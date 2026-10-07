/**
 * DRONE-TRAIN | Main Application Orchestrator & UI Controller
 * Smart India Hackathon 2026 Problem Statement SIH26247
 * Full Core Loop: SCENARIO -> DETECT -> CLASSIFY -> DECIDE -> SCORE -> REVIEW -> ADAPT
 */

class AppController {
  constructor() {
    this.sim3d = null;
    this.timerInterval = null;
    this.threatTimerStart = 0;
    this.judgeTourActive = false;
    this.judgeTourStep = 1;
    this.autoPlayTimer = null;
    this.currentActiveView = null;
  }

  init() {
    // Client-side route initialization: check URL hash, default to dashboard on clean open
    const initialHash = (window.location.hash || '').replace(/^#/, '').trim();
    const validViews = ['dashboard', 'simulator', 'scenarios', 'performance', 'aar', 'adaptive', 'trainees', 'trainer', 'settings'];
    const initialView = validViews.includes(initialHash) ? initialHash : 'dashboard';
    window.appState.setView(initialView);

    this.setupNavigation();
    this.setupSimulatorWorkflow();
    this.setupScenarioControls();
    this.setupTrainerConsole();
    this.setupSettingsView();
    this.setupJudgeDemoTour();
    this.setupRoleModal();
    this.setupAudioToggle();

    // Initialize 3D Simulation Viewport
    try {
      this.sim3d = new window.Simulation3D('simCanvasContainer');
      window.onDroneClicked = () => this.handleTraineeDetection();
    } catch (e) {
      console.warn('3D simulation initialization note:', e);
    }

    // Subscribe to State Updates
    window.appState.subscribe(state => this.onStateChange(state));

    // Render Initial View
    this.renderCurrentView();

    // Hotkey: Spacebar to trigger detection in Simulator
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && window.appState.get().currentView === 'simulator') {
        const phase = window.appState.get().activeSession.phase;
        if (phase === 'THREAT_ACTIVE') {
          e.preventDefault();
          this.handleTraineeDetection();
        }
      }
    });

    console.log('DRONE-TRAIN SIH26247 Training Prototype Initialized.');
  }

  // =========================================================================
  // VIEW NAVIGATION & ROUTING
  // =========================================================================
  navigateTo(viewName) {
    if (!viewName) return;
    const validViews = ['dashboard', 'simulator', 'scenarios', 'performance', 'aar', 'adaptive', 'trainees', 'trainer', 'settings'];
    if (!validViews.includes(viewName)) return;

    if (window.location.hash !== `#${viewName}`) {
      try {
        window.history.pushState(null, '', `#${viewName}`);
      } catch (e) {
        window.location.hash = viewName;
      }
    }
    window.appState.setView(viewName);
    this.renderCurrentView();
  }

  setupNavigation() {
    // 1. Sidebar Navigation Buttons - direct listener
    document.querySelectorAll('.nav-link').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const view = e.currentTarget.getAttribute('data-view');
        if (view) {
          e.preventDefault();
          this.navigateTo(view);
        }
      });
    });

    // 2. Global event delegation for all elements containing data-view
    document.addEventListener('click', (e) => {
      const trigger = e.target.closest('[data-view]');
      if (trigger && !trigger.classList.contains('nav-link')) {
        const view = trigger.getAttribute('data-view');
        if (view) {
          e.preventDefault();
          this.navigateTo(view);
        }
      }
    });

    // 3. Client-side Routing: synchronize on browser Back/Forward & URL hash changes
    const syncRouteFromUrl = () => {
      const hash = (window.location.hash || '').replace(/^#/, '').trim();
      const validViews = ['dashboard', 'simulator', 'scenarios', 'performance', 'aar', 'adaptive', 'trainees', 'trainer', 'settings'];
      const targetView = validViews.includes(hash) ? hash : 'dashboard';
      if (window.appState.get().currentView !== targetView) {
        window.appState.setView(targetView);
      } else {
        this.renderCurrentView();
      }
    };
    window.addEventListener('popstate', syncRouteFromUrl);
    window.addEventListener('hashchange', syncRouteFromUrl);

    // 4. Topbar Sidebar Toggle for Mobile / Tablets
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('appSidebar');
    if (sidebarToggle && sidebar) {
      sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
      });
    }

    // 5. Dashboard Quick Actions
    const btnDashLaunchSim = document.getElementById('btnDashLaunchSim');
    if (btnDashLaunchSim) {
      btnDashLaunchSim.addEventListener('click', (e) => {
        e.preventDefault();
        this.navigateTo('simulator');
      });
    }

    const btnDashConfig = document.getElementById('btnDashConfigScenario');
    if (btnDashConfig) {
      btnDashConfig.addEventListener('click', (e) => {
        e.preventDefault();
        this.navigateTo('scenarios');
      });
    }

    const btnLaunchAdaptiveDash = document.getElementById('btnLaunchAdaptiveFromDash');
    if (btnLaunchAdaptiveDash) {
      btnLaunchAdaptiveDash.addEventListener('click', () => {
        window.adaptiveController.launchAdaptedSession();
      });
    }

    const btnViewAllSessions = document.getElementById('btnViewAllSessions');
    if (btnViewAllSessions) {
      btnViewAllSessions.addEventListener('click', (e) => {
        e.preventDefault();
        this.navigateTo('performance');
      });
    }

    // 6. Role Selector in Topbar
    const roleSelect = document.getElementById('userRoleSelect');
    if (roleSelect) {
      roleSelect.addEventListener('change', (e) => {
        window.appState.setRole(e.target.value);
        this.showToast(`Switched active operational role to: ${e.target.value.toUpperCase()}`, 'info');
      });
    }
  }

  renderCurrentView() {
    const state = window.appState.get();
    const validViews = ['dashboard', 'simulator', 'scenarios', 'performance', 'aar', 'adaptive', 'trainees', 'trainer', 'settings'];
    const currentView = validViews.includes(state.currentView) ? state.currentView : 'dashboard';
    this.currentActiveView = currentView;

    // 1. Hide all view panels
    document.querySelectorAll('.view-panel').forEach(panel => {
      panel.style.display = 'none';
    });

    // 2. Show active view panel
    const activePanel = document.getElementById(`view-${currentView}`);
    if (activePanel) {
      activePanel.style.display = 'flex';
    }

    // 3. Update sidebar active state
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('data-view') === currentView) {
        link.classList.add('active');
      }
    });

    // 4. Update topbar breadcrumb
    const bc = document.getElementById('currentViewBreadcrumb');
    if (bc) {
      const titles = {
        dashboard: 'Dashboard',
        simulator: 'Training Simulator',
        scenarios: 'Scenario Library',
        performance: 'Performance Analytics',
        aar: 'After-Action Review',
        adaptive: 'Adaptive Training',
        trainees: 'Trainees & Roster',
        trainer: 'Trainer Console',
        settings: 'Settings'
      };
      bc.textContent = titles[currentView] || 'Training Environment';
    }

    // 5. Trigger view-specific renderers safely
    try {
      if (currentView === 'dashboard') {
        this.clearSimulationTimers();
        if (this.sim3d) this.sim3d.stop();
        if (window.analyticsManager) {
          window.analyticsManager.initDashboardChart();
          window.analyticsManager.renderRecentSessionsTable();
        }
        this.updateDashboardMetrics();
      } else if (currentView === 'simulator') {
        this.syncSimulatorBanner();
        if (this.sim3d) {
          this.sim3d.start();
          requestAnimationFrame(() => this.sim3d.onWindowResize());
        }
      } else {
        this.clearSimulationTimers();
        if (this.sim3d) this.sim3d.stop();
        if (currentView === 'scenarios' && window.scenarioManager) {
          window.scenarioManager.renderScenarioCards('scenariosGridContainer');
        } else if (currentView === 'performance' && window.analyticsManager) {
          window.analyticsManager.initPerformanceCharts();
        } else if (currentView === 'aar' && window.aarController) {
          window.aarController.render();
        } else if (currentView === 'adaptive' && window.adaptiveController) {
          window.adaptiveController.render();
        } else if (currentView === 'trainees' && window.analyticsManager) {
          window.analyticsManager.renderTraineesTable();
        }
      }
    } catch (err) {
      console.warn(`View renderer notification for [${currentView}]:`, err);
    }
  }

  updateDashboardMetrics() {
    const state = window.appState.get();
    const mActive = document.getElementById('metricActiveSessions');
    const mComp = document.getElementById('metricCompletedSessions');
    const mDet = document.getElementById('metricAvgDetectionTime');
    const mClass = document.getElementById('metricClassificationAcc');
    const mDec = document.getElementById('metricDecisionAcc');
    const mScore = document.getElementById('metricOverallScore');

    if (mComp) mComp.textContent = state.currentUser.completedSessionsCount + 114;
    if (mScore) mScore.textContent = `${state.currentUser.avgScore}/100`;

    // Adaptive Recommendation Banner
    const rec = window.appState.evaluateAdaptiveRecommendation();
    const hHeadline = document.getElementById('dashRecHeadline');
    const hDesc = document.getElementById('dashRecDesc');
    if (hHeadline) hHeadline.textContent = `Recommended next session: ${rec.recName} with degraded sensor visibility.`;
    if (hDesc) hDesc.textContent = rec.reasoning;
  }

  syncSimulatorBanner() {
    const session = window.appState.get().activeSession;
    const sId = document.getElementById('simSessionId');
    const sName = document.getElementById('simScenarioName');
    const sDiff = document.getElementById('simDifficultyBadge');
    const sEnv = document.getElementById('simEnvironmentLabel');
    const sCond = document.getElementById('simSensorConditionBadge');

    if (sId) sId.textContent = session.id;
    if (sName) sName.textContent = session.scenarioName;
    if (sDiff) {
      sDiff.textContent = session.difficulty;
      sDiff.className = session.difficulty === 'Easy' ? 'meta-value badge-pill badge-success' : (session.difficulty === 'Moderate' ? 'meta-value badge-pill badge-warning' : 'meta-value badge-pill badge-danger');
    }
    if (sEnv) sEnv.textContent = `${session.environment} • ${session.time}`;
    if (sCond) sCond.textContent = session.sensorCondition;

    // Update 3D viewport environment and lighting only when simulator view is active
    if (this.sim3d && window.appState.get().currentView === 'simulator') {
      this.sim3d.buildEnvironment(session.environment.toLowerCase());
      this.sim3d.setTimeOfDay(session.time);
      this.sim3d.setSensorCondition(session.sensorCondition);
    }
  }

  // =========================================================================
  // SIMULATOR CORE WORKFLOW & STATE MACHINE
  // =========================================================================
  setupSimulatorWorkflow() {
    // 1. "Simulate Threat Intrusion Now" / "Inject Threat" buttons
    const btnSpawn = document.getElementById('btnSpawnTestThreat');
    const btnTrigger = document.getElementById('btnTriggerNewThreat');

    if (btnSpawn) btnSpawn.addEventListener('click', () => this.injectSimulatedThreat());
    if (btnTrigger) btnTrigger.addEventListener('click', () => this.injectSimulatedThreat());

    // 2. "CONFIRM THREAT DETECTION" Button (Phase 1 -> Phase 2)
    const btnAck = document.getElementById('btnAcknowledgeDetection');
    if (btnAck) {
      btnAck.addEventListener('click', () => this.handleTraineeDetection());
    }

    // 3. Classification Option Radios
    const classRadios = document.querySelectorAll('input[name="threatClassification"]');
    const btnConfirmClass = document.getElementById('btnConfirmClassification');

    classRadios.forEach(radio => {
      radio.addEventListener('change', (e) => {
        // Highlight selected card
        document.querySelectorAll('.classification-option-card').forEach(c => c.classList.remove('selected'));
        e.target.closest('.classification-option-card').classList.add('selected');
        if (btnConfirmClass) btnConfirmClass.disabled = false;
      });
    });

    if (btnConfirmClass) {
      btnConfirmClass.addEventListener('click', () => this.handleClassificationSubmit());
    }

    // 4. Decision Option Radios
    const decRadios = document.querySelectorAll('input[name="trainingDecision"]');
    const btnSubmitDec = document.getElementById('btnSubmitDecision');

    decRadios.forEach(radio => {
      radio.addEventListener('change', (e) => {
        document.querySelectorAll('.decision-option-card').forEach(c => c.classList.remove('selected'));
        e.target.closest('.decision-option-card').classList.add('selected');
        if (btnSubmitDec) btnSubmitDec.disabled = false;
      });
    });

    if (btnSubmitDec) {
      btnSubmitDec.addEventListener('click', () => this.handleDecisionSubmit());
    }

    // 5. Scoring Screen Actions
    const btnRestartSame = document.getElementById('btnRestartSameScenario');
    if (btnRestartSame) {
      btnRestartSame.addEventListener('click', () => this.resetCurrentSimulation());
    }

    const btnProceedAAR = document.getElementById('btnProceedToAAR');
    if (btnProceedAAR) {
      btnProceedAAR.addEventListener('click', () => {
        this.navigateTo('aar');
      });
    }

    const btnAARToAdaptive = document.getElementById('btnAARProceedToAdaptive');
    if (btnAARToAdaptive) {
      btnAARToAdaptive.addEventListener('click', () => {
        this.navigateTo('adaptive');
      });
    }

    // Start Next Scenario button in AAR header
    const btnNextScen = document.getElementById('btnAARStartNextScenario');
    if (btnNextScen) {
      btnNextScen.addEventListener('click', () => {
        this.navigateTo('simulator');
        this.resetCurrentSimulation();
      });
    }

    // Reset Simulation button in top banner
    const btnRestart = document.getElementById('btnRestartSimulation');
    if (btnRestart) {
      btnRestart.addEventListener('click', () => this.resetCurrentSimulation());
    }

    // Viewport Environment Preset Buttons
    document.querySelectorAll('.btn-pill-toggle').forEach(pill => {
      pill.addEventListener('click', (e) => {
        document.querySelectorAll('.btn-pill-toggle').forEach(p => p.classList.remove('active'));
        e.currentTarget.classList.add('active');
        const env = e.currentTarget.getAttribute('data-env');
        if (this.sim3d) {
          this.sim3d.buildEnvironment(env);
        }
      });
    });

    // Viewport Camera Mode Buttons
    const camP = document.getElementById('btnCamPerspective');
    const camT = document.getElementById('btnCamTower');
    const camR = document.getElementById('btnCamRadar');

    [camP, camT, camR].forEach(btn => {
      if (btn) {
        btn.addEventListener('click', (e) => {
          [camP, camT, camR].forEach(b => b && b.classList.remove('active'));
          e.currentTarget.classList.add('active');
          if (e.currentTarget === camP && this.sim3d) this.sim3d.setCameraMode('perspective');
          if (e.currentTarget === camT && this.sim3d) this.sim3d.setCameraMode('tower');
          if (e.currentTarget === camR && this.sim3d) this.sim3d.setCameraMode('radar');
        });
      }
    });
  }

  clearSimulationTimers() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    if (this.autoPlayTimer) {
      clearInterval(this.autoPlayTimer);
      this.autoPlayTimer = null;
    }
  }

  injectSimulatedThreat() {
    this.clearSimulationTimers();
    const session = window.appState.get().activeSession;
    session.phase = 'THREAT_ACTIVE';
    this.threatTimerStart = performance.now();

    // Start timer display
    const timerDisplay = document.getElementById('simTimerDisplay');
    const startTime = performance.now();
    this.timerInterval = setInterval(() => {
      const elapsed = (performance.now() - startTime) / 1000;
      const mins = Math.floor(elapsed / 60).toString().padStart(2, '0');
      const secs = (elapsed % 60).toFixed(1).padStart(4, '0');
      if (timerDisplay) timerDisplay.textContent = `${mins}:${secs}`;
    }, 100);

    // Spawn 3D Drone Entity
    if (this.sim3d) {
      this.sim3d.spawnThreat(
        session.threatPattern,
        session.threat.bearingDeg || 45,
        session.threat.rangeM || 420
      );
    }

    // Update UI elements for Threat Active
    const waitingState = document.getElementById('detectionWaitingState');
    const alertBox = document.getElementById('threatAlertBox');
    const statusTag = document.getElementById('threatStatusTag');
    const reticleId = document.getElementById('reticleThreatId');
    const reticleTelem = document.getElementById('reticleTelemetry');

    if (waitingState) waitingState.style.display = 'none';
    if (alertBox) alertBox.style.display = 'block';
    if (statusTag) {
      statusTag.textContent = 'THREAT INGRESS DETECTED';
      statusTag.className = 'threat-status-tag text-rose font-semibold';
    }

    if (reticleId) reticleId.textContent = session.threat.id;
    if (reticleTelem) reticleTelem.textContent = `R: ${session.threat.rangeM}m | AZ: ${session.threat.bearing} | ALT: ${session.threat.altitudeM}m`;

    // Update Telemetry Specs in alert card
    const specDet = document.getElementById('specDetectionTime');
    const specId = document.getElementById('specThreatId');
    const specDir = document.getElementById('specDirection');
    const specRng = document.getElementById('specRange');
    const specAlt = document.getElementById('specAltitude');
    const specSpd = document.getElementById('specSpeed');

    if (specDet) specDet.textContent = 'Tracking active...';
    if (specId) specId.textContent = session.threat.id;
    if (specDir) specDir.textContent = session.threat.bearing;
    if (specRng) specRng.textContent = `${session.threat.rangeM} m`;
    if (specAlt) specAlt.textContent = `${session.threat.altitudeM} m`;
    if (specSpd) specSpd.textContent = `${session.threat.speedMps} m/s`;

    // Viewport Instruction Banner
    const vText = document.getElementById('viewportInstructionText');
    if (vText) vText.textContent = `Simulated Threat ${session.threat.id} ingress at Bearing ${session.threat.bearing}. Mark detection!`;

    // Audio cue
    if (window.soundController) window.soundController.playThreatAlert();

    // Topbar Session Status Badge
    const topBadge = document.getElementById('topbarSessionBadge');
    const topLabel = document.getElementById('topbarSessionLabel');
    if (topBadge && topLabel) {
      topBadge.className = 'session-status-badge active';
      topLabel.textContent = `Threat Active • ${session.threat.id}`;
    }
  }

  handleTraineeDetection() {
    const session = window.appState.get().activeSession;
    if (session.phase !== 'THREAT_ACTIVE' && session.phase !== 'SCENARIO_GENERATED') {
      // If idle, auto-inject first
      if (session.phase === 'IDLE') {
        this.injectSimulatedThreat();
        return;
      }
    }

    // Record Latency
    const latencySec = Math.max(1.2, ((performance.now() - this.threatTimerStart) / 1000));
    session.detectionLatencySec = parseFloat(latencySec.toFixed(1));
    session.threat.detected = true;
    session.phase = 'CLASSIFICATION';

    if (window.soundController) window.soundController.playDetectionLock();
    this.showToast(`Threat acknowledged in ${session.detectionLatencySec}s! Proceed to Classification.`, 'success');

    // Update Stepper
    this.setWorkflowStep(2);

    // Switch Cards from Detection -> Classification
    const cardDetect = document.getElementById('cardDetectionPhase');
    const cardClass = document.getElementById('cardClassificationPhase');

    if (cardDetect) cardDetect.style.display = 'none';
    if (cardClass) {
      cardClass.style.display = 'flex';
      cardClass.classList.add('active');
    }

    // Populate Fictional Sensor Telemetry
    const evAcoustic = document.getElementById('evidenceAcoustic');
    const evRF = document.getElementById('evidenceRF');
    const evDoppler = document.getElementById('evidenceDoppler');

    if (evAcoustic) evAcoustic.textContent = session.threat.acousticSignature;
    if (evRF) evRF.textContent = session.threat.rfSpectrum;
    if (evDoppler) evDoppler.textContent = session.threat.microDoppler;

    const vText = document.getElementById('viewportInstructionText');
    if (vText) vText.textContent = `Target locked. Analyze synthetic sensor cues and classify threat category.`;

    // Log to session timeline
    session.timeline.push({
      timeOffsetSec: `00:0${session.detectionLatencySec.toFixed(1)}`,
      title: 'Threat Detected',
      desc: `Trainee acknowledged ${session.threat.id} within ${session.detectionLatencySec}s reaction window.`
    });
  }

  handleClassificationSubmit() {
    const session = window.appState.get().activeSession;
    const selected = document.querySelector('input[name="threatClassification"]:checked');
    if (!selected) return;

    const choice = selected.value;
    session.threat.userClassification = choice;
    session.threat.isClassificationCorrect = (choice === session.threat.type);
    session.phase = 'DECISION';

    if (window.soundController) window.soundController.playClick();
    this.showToast(`Classification recorded: ${choice}`, 'info');

    // Update Stepper
    this.setWorkflowStep(3);

    // Switch Cards from Classification -> Decision
    const cardClass = document.getElementById('cardClassificationPhase');
    const cardDec = document.getElementById('cardDecisionPhase');

    if (cardClass) cardClass.style.display = 'none';
    if (cardDec) {
      cardDec.style.display = 'flex';
      cardDec.classList.add('active');
    }

    const vText = document.getElementById('viewportInstructionText');
    if (vText) vText.textContent = `Threat classified as ${choice}. Select safe procedural training response.`;

    // Log to session timeline
    session.timeline.push({
      timeOffsetSec: '00:12.4',
      title: 'Classification Submitted',
      desc: `Selected "${choice}" (${session.threat.isClassificationCorrect ? 'Correct: +30 pts' : 'Incorrect: partial credit'}).`
    });
  }

  handleDecisionSubmit() {
    const session = window.appState.get().activeSession;
    const selected = document.querySelector('input[name="trainingDecision"]:checked');
    if (!selected) return;

    const decision = selected.value;
    session.threat.userDecision = decision;
    
    // Check appropriateness
    const expected = session.threat.expectedDecision || 'Increase monitoring';
    session.threat.isDecisionAppropriate = (decision === expected || decision === 'Increase monitoring' || decision === 'Notify training supervisor');
    session.phase = 'SCORING';

    // Stop timer
    this.clearSimulationTimers();

    // Calculate Final Scores
    const scores = window.appState.calculateSessionScore(
      session.detectionLatencySec,
      session.threat.isClassificationCorrect,
      decision,
      expected
    );
    session.scores = scores;

    // Log to session timeline
    session.timeline.push({
      timeOffsetSec: '00:16.8',
      title: 'Training Decision Submitted',
      desc: `Selected safe response "${decision}" (${session.threat.isDecisionAppropriate ? 'Appropriate: +21 pts' : 'Sub-optimal'}).`
    });
    session.timeline.push({
      timeOffsetSec: '00:17.2',
      title: 'Scenario Completed',
      desc: `Final Score computed: ${scores.totalScore}/100 (Grade: ${scores.grade} • ${scores.ratingText}).`
    });

    // Save completed session to recentSessions store
    const state = window.appState.get();
    state.recentSessions.unshift({
      id: session.id,
      traineeId: state.currentUser.id,
      traineeName: state.currentUser.name,
      scenario: session.scenarioName,
      environment: session.environment,
      difficulty: session.difficulty,
      score: scores.totalScore,
      result: scores.ratingText,
      date: 'Just now',
      detectionTime: `${session.detectionLatencySec} sec`,
      classification: `${session.threat.isClassificationCorrect ? 'Correct' : 'Discrepancy'} (${session.threat.userClassification})`,
      decision: decision,
      notes: 'Clean execution of observation protocol.'
    });

    // Update Trainee aggregate stats
    state.currentUser.completedSessionsCount += 1;
    const allScores = state.recentSessions.map(s => s.score);
    state.currentUser.avgScore = Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length);
    window.appState.saveState();

    if (window.soundController) window.soundController.playSuccessChime();
    this.showToast(`Session ${session.id} Complete! Score: ${scores.totalScore}/100`, 'success');

    // Update Stepper
    this.setWorkflowStep(4);

    // Switch Cards from Decision -> Scoring
    const cardDec = document.getElementById('cardDecisionPhase');
    const cardScore = document.getElementById('cardScoringPhase');

    if (cardDec) cardDec.style.display = 'none';
    if (cardScore) {
      cardScore.style.display = 'flex';
      cardScore.classList.add('active');
    }

    // Populate Score Card Breakdown
    const finalScore = document.getElementById('finalScoreVal');
    const finalGrade = document.getElementById('finalScoreGrade');
    const scoreRating = document.getElementById('scoreRatingBadge');

    if (finalScore) finalScore.textContent = scores.totalScore;
    if (finalGrade) finalGrade.textContent = `Grade ${scores.grade} — ${scores.ratingText} performance under ${session.sensorCondition} sensor conditions.`;
    if (scoreRating) {
      scoreRating.textContent = scores.ratingText.toUpperCase();
      scoreRating.className = scores.totalScore >= 80 ? 'badge-success' : 'badge-warning';
    }

    // Bar fills and points
    const barDet = document.getElementById('barScoreDetection');
    const ptsDet = document.getElementById('ptsScoreDetection');
    const barClass = document.getElementById('barScoreClassification');
    const ptsClass = document.getElementById('ptsScoreClassification');
    const barDec = document.getElementById('barScoreDecision');
    const ptsDec = document.getElementById('ptsScoreDecision');
    const barCons = document.getElementById('barScoreConsistency');
    const ptsCons = document.getElementById('ptsScoreConsistency');

    if (barDet) barDet.style.width = `${(scores.detectionPts / 30) * 100}%`;
    if (ptsDet) ptsDet.textContent = scores.detectionPts;
    if (barClass) barClass.style.width = `${(scores.classificationPts / 30) * 100}%`;
    if (ptsClass) ptsClass.textContent = scores.classificationPts;
    if (barDec) barDec.style.width = `${(scores.decisionPts / 25) * 100}%`;
    if (ptsDec) ptsDec.textContent = scores.decisionPts;
    if (barCons) barCons.style.width = `${(scores.consistencyPts / 15) * 100}%`;
    if (ptsCons) ptsCons.textContent = scores.consistencyPts;

    // Reset Topbar Status
    const topBadge = document.getElementById('topbarSessionBadge');
    const topLabel = document.getElementById('topbarSessionLabel');
    if (topBadge && topLabel) {
      topBadge.className = 'session-status-badge';
      topLabel.textContent = `Session Scored: ${scores.totalScore}/100`;
    }
  }

  setWorkflowStep(stepNum) {
    for (let i = 1; i <= 4; i++) {
      const node = document.getElementById(`stepNode${i}`);
      const conn = document.getElementById(`stepConn${i}`);

      if (node) {
        node.classList.remove('active', 'completed');
        if (i < stepNum) {
          node.classList.add('completed');
          node.querySelector('.step-num').innerHTML = '&check;';
        } else if (i === stepNum) {
          node.classList.add('active');
          node.querySelector('.step-num').textContent = i;
        } else {
          node.querySelector('.step-num').textContent = i;
        }
      }

      if (conn) {
        if (i < stepNum) {
          conn.classList.add('completed');
        } else {
          conn.classList.remove('completed');
        }
      }
    }
  }

  resetCurrentSimulation() {
    this.clearSimulationTimers();
    const session = window.appState.get().activeSession;
    session.phase = 'IDLE';
    session.detectionLatencySec = 0;
    session.threat.detected = false;
    session.threat.userClassification = null;
    session.threat.userDecision = null;

    if (this.sim3d) {
      this.sim3d.hideThreat();
    }

    this.setWorkflowStep(1);

    // Reset workflow cards
    ['cardClassificationPhase', 'cardDecisionPhase', 'cardScoringPhase'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });

    const cardDetect = document.getElementById('cardDetectionPhase');
    const waitState = document.getElementById('detectionWaitingState');
    const alertBox = document.getElementById('threatAlertBox');
    const statusTag = document.getElementById('threatStatusTag');
    const timerDisplay = document.getElementById('simTimerDisplay');

    if (cardDetect) cardDetect.style.display = 'flex';
    if (waitState) waitState.style.display = 'block';
    if (alertBox) alertBox.style.display = 'none';
    if (statusTag) {
      statusTag.textContent = 'NO THREAT DETECTED';
      statusTag.className = 'threat-status-tag';
    }
    if (timerDisplay) timerDisplay.textContent = '00:00.0';

    const vText = document.getElementById('viewportInstructionText');
    if (vText) vText.textContent = `Scanning airspace. Await simulated threat intrusion or click "Inject Threat".`;

    const topBadge = document.getElementById('topbarSessionBadge');
    const topLabel = document.getElementById('topbarSessionLabel');
    if (topBadge && topLabel) {
      topBadge.className = 'session-status-badge';
      topLabel.textContent = 'Standby / Idle';
    }

    this.showToast('Simulator reset to baseline surveillance.', 'info');
  }

  // =========================================================================
  // SCENARIO LIBRARY & CONFIG CONTROLS
  // =========================================================================
  setupScenarioControls() {
    // Filter Pills
    document.querySelectorAll('.filter-pill[data-filter]').forEach(pill => {
      pill.addEventListener('click', (e) => {
        document.querySelectorAll('.filter-pill[data-filter]').forEach(p => p.classList.remove('active'));
        e.currentTarget.classList.add('active');
        window.scenarioManager.activeFilter = e.currentTarget.getAttribute('data-filter');
        window.scenarioManager.renderScenarioCards('scenariosGridContainer');
      });
    });

    // Search input
    const search = document.getElementById('scenarioSearchInput');
    if (search) {
      search.addEventListener('input', (e) => {
        window.scenarioManager.searchQuery = e.target.value;
        window.scenarioManager.renderScenarioCards('scenariosGridContainer');
      });
    }

    // "Configure Custom Scenario" button scroll
    const btnOpenConfig = document.getElementById('btnOpenScenarioGenerator');
    if (btnOpenConfig) {
      btnOpenConfig.addEventListener('click', () => {
        const box = document.getElementById('scenarioGeneratorBox');
        if (box) box.scrollIntoView({ behavior: 'smooth' });
      });
    }

    // Seed Reroll button
    const btnReroll = document.getElementById('btnRollNewSeed');
    const seedInput = document.getElementById('cfgSeedInput');
    const seedLabel = document.getElementById('currentSeedLabel');

    if (btnReroll && seedInput) {
      btnReroll.addEventListener('click', () => {
        const newSeed = window.scenarioManager.generateProceduralSeed();
        seedInput.value = newSeed;
        if (seedLabel) seedLabel.textContent = newSeed;
        this.updateScenarioConfigPreview();
      });
    }

    // Config dropdown changes update preview
    ['cfgEnvSelect', 'cfgTimeSelect', 'cfgSensorSelect', 'cfgPatternSelect', 'cfgDifficultySelect'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('change', () => this.updateScenarioConfigPreview());
      }
    });

    // Launch Custom Scenario button
    const btnLaunchCustom = document.getElementById('btnLaunchCustomConfigScenario');
    if (btnLaunchCustom) {
      btnLaunchCustom.addEventListener('click', () => {
        const env = document.getElementById('cfgEnvSelect')?.value || 'Urban';
        const time = document.getElementById('cfgTimeSelect')?.value || 'Day';
        const sensor = document.getElementById('cfgSensorSelect')?.value || 'Normal';
        const pattern = document.getElementById('cfgPatternSelect')?.value || 'Single';
        const diff = document.getElementById('cfgDifficultySelect')?.value || 'Moderate';
        const seed = document.getElementById('cfgSeedInput')?.value || 'SEED-9842X';

        const custom = window.scenarioManager.createProceduralScenario(env, time, sensor, pattern, diff, seed);
        
        window.appState.update(st => {
          st.activeSession = {
            id: `TR-${Math.floor(1050 + Math.random() * 40)}`,
            scenarioId: custom.id,
            scenarioName: custom.title,
            difficulty: diff,
            environment: env,
            time: time,
            sensorCondition: sensor,
            threatPattern: pattern,
            seed: seed,
            phase: 'IDLE',
            startTime: null,
            threatSpawnTime: null,
            detectionTime: null,
            detectionLatencySec: 0,
            threat: {
              ...custom.targetThreat,
              detected: false,
              userClassification: null,
              isClassificationCorrect: false,
              userDecision: null,
              isDecisionAppropriate: false
            },
            scores: {
              detectionPts: 0,
              classificationPts: 0,
              decisionPts: 0,
              consistencyPts: 0,
              totalScore: 0,
              grade: '-',
              ratingText: 'Pending'
            },
            timeline: [
              { timeOffsetSec: '00:00.0', title: 'Scenario Initialized', desc: `${custom.title} loaded (${env} • ${time} • ${sensor}).` }
            ],
            trainerFeedback: { tags: [], notes: '', saved: false }
          };
          st.currentView = 'simulator';
        });

        this.renderCurrentView();
        this.showToast(`Custom Scenario ${seed} loaded in simulator`, 'success');
      });
    }
  }

  updateScenarioConfigPreview() {
    const env = document.getElementById('cfgEnvSelect')?.value || 'Urban';
    const time = document.getElementById('cfgTimeSelect')?.value || 'Day';
    const sensor = document.getElementById('cfgSensorSelect')?.value || 'Normal';
    const pattern = document.getElementById('cfgPatternSelect')?.value || 'Single';
    const diff = document.getElementById('cfgDifficultySelect')?.value || 'Moderate';

    const pEnv = document.getElementById('prevEnv');
    const pTime = document.getElementById('prevTime');
    const pSensor = document.getElementById('prevSensor');
    const pPattern = document.getElementById('prevPattern');
    const pTarget = document.getElementById('prevTarget');

    if (pEnv) pEnv.textContent = env;
    if (pTime) pTime.textContent = time;
    if (pSensor) pSensor.textContent = sensor;
    if (pPattern) pPattern.textContent = pattern;
    if (pTarget) {
      const targets = { Easy: '75 pts', Moderate: '85 pts', Hard: '90 pts', Advanced: '95 pts' };
      pTarget.textContent = targets[diff] || '85 pts';
    }
  }

  // =========================================================================
  // TRAINER CONSOLE & INJECTS
  // =========================================================================
  setupTrainerConsole() {
    const btnJam = document.getElementById('btnInjectJamming');
    if (btnJam) {
      btnJam.addEventListener('click', () => {
        if (this.sim3d) {
          this.sim3d.setSensorCondition('Degraded');
          this.showToast('INJECT TRIGGERED: Sensor Jamming / RF Static activated!', 'alert');
        }
      });
    }

    const btnDecoy = document.getElementById('btnInjectDecoy');
    if (btnDecoy) {
      btnDecoy.addEventListener('click', () => {
        if (this.sim3d) {
          this.sim3d.spawnThreat('Multiple', 120, 310);
          this.showToast('INJECT TRIGGERED: Secondary Decoy Target Ingress spawned!', 'alert');
        }
      });
    }

    const btnEvasion = document.getElementById('btnInjectEvasion');
    if (btnEvasion) {
      btnEvasion.addEventListener('click', () => {
        if (this.sim3d && this.sim3d.droneGroup) {
          this.sim3d.droneGroup.position.y -= 15;
          this.showToast('INJECT TRIGGERED: Threat executed abrupt altitude dive!', 'alert');
        }
      });
    }

    const btnRules = document.getElementById('btnSaveTrainerRules');
    if (btnRules) {
      btnRules.addEventListener('click', () => {
        const adv = document.getElementById('threshAdvance')?.value || 85;
        const ret = document.getElementById('threshRetain')?.value || 65;
        window.appState.update(st => {
          st.adaptiveModel.ruleThresholdAdvance = parseInt(adv);
          st.adaptiveModel.ruleThresholdMaintain = parseInt(ret);
        });
        this.showToast('Trainer threshold calibration rules saved successfully', 'success');
      });
    }
  }

  // =========================================================================
  // SETTINGS VIEW & RESET
  // =========================================================================
  setupSettingsView() {
    const btnResetAll = document.getElementById('btnResetAllDemoData');
    if (btnResetAll) {
      btnResetAll.addEventListener('click', () => {
        if (confirm('Reset all demo sessions, adaptive progressions, and trainee metrics to default?')) {
          localStorage.removeItem('dronetrain_state_v1');
          window.appState.resetToDefault();
          location.reload();
        }
      });
    }
  }

  // =========================================================================
  // SIH JUDGE GUIDED DEMO TOUR
  // =========================================================================
  setupJudgeDemoTour() {
    const btnStart = document.getElementById('btnStartJudgeDemo');
    const banner = document.getElementById('demoGuideBanner');
    const btnNext = document.getElementById('btnNextDemoStep');
    const btnPrev = document.getElementById('btnPrevDemoStep');
    const btnAuto = document.getElementById('btnAutoPlayDemo');
    const btnClose = document.getElementById('btnCloseDemoBanner');

    const steps = [
      {
        badge: 'STEP 1 OF 7: EXECUTIVE DASHBOARD',
        title: 'Executive Training Ecosystem Overview',
        desc: 'Review multi-rig training sessions, baseline detection latency, classification accuracy, and AI adaptive recommendations.',
        action: () => window.appState.setView('dashboard')
      },
      {
        badge: 'STEP 2 OF 7: TRAINING SIMULATOR',
        title: '3D Synthetic Training Viewport',
        desc: 'Enter the core simulation screen. Observe the stylized enterprise 3D environment, perimeter radar sweep, and camera vantage controls.',
        action: () => {
          window.appState.setView('simulator');
          this.resetCurrentSimulation();
        }
      },
      {
        badge: 'STEP 3 OF 7: THREAT DETECTION',
        title: 'Synthetic Threat Ingress & Detection Phase',
        desc: 'A simulated drone intrusion enters airspace. Notice the 3D target, ground altitude line, mini radar blip, and reaction timer counting in milliseconds.',
        action: () => {
          window.appState.setView('simulator');
          this.injectSimulatedThreat();
        }
      },
      {
        badge: 'STEP 4 OF 7: TELEMETRY CLASSIFICATION',
        title: 'Sensor Analysis & Classification Phase',
        desc: 'Trainee inspects synthetic acoustic harmonics, RF spectrum, and micro-Doppler modulation to classify the target as "Small UAV".',
        action: () => {
          this.handleTraineeDetection();
          const opt = document.getElementById('optClassSmall');
          if (opt) {
            opt.checked = true;
            opt.closest('.classification-option-card').classList.add('selected');
            const btn = document.getElementById('btnConfirmClassification');
            if (btn) btn.disabled = false;
          }
        }
      },
      {
        badge: 'STEP 5 OF 7: TRAINING DECISION',
        title: 'Safe Procedural Training Response',
        desc: 'Trainee selects safe enterprise protocol ("Increase monitoring") strictly adhering to non-weaponized training rules.',
        action: () => {
          this.handleClassificationSubmit();
          const opt = document.getElementById('optDecideMonitor');
          if (opt) {
            opt.checked = true;
            opt.closest('.decision-option-card').classList.add('selected');
            const btn = document.getElementById('btnSubmitDecision');
            if (btn) btn.disabled = false;
          }
        }
      },
      {
        badge: 'STEP 6 OF 7: DETERMINISTIC SCORING & AAR',
        title: 'Transparent Scoring & Chronological AAR',
        desc: 'Scoring engine transparently breaks down Detection (28pts) + Classification (30pts) + Decision (21pts) + Consistency (13pts) = 92/100.',
        action: () => {
          this.handleDecisionSubmit();
          setTimeout(() => window.appState.setView('aar'), 400);
        }
      },
      {
        badge: 'STEP 7 OF 7: ADAPTIVE PROGRESSION',
        title: 'Adaptive Training Engine & Next Scenario',
        desc: 'Based on high performance (Score >= 85), the adaptive engine elevates difficulty to Level 5 and auto-configures the next scenario!',
        action: () => window.appState.setView('adaptive')
      }
    ];

    const updateTourUI = () => {
      const cur = steps[this.judgeTourStep - 1];
      if (!cur) return;
      document.getElementById('demoStepBadge').textContent = cur.badge;
      document.getElementById('demoStepTitle').textContent = cur.title;
      document.getElementById('demoStepDesc').textContent = cur.desc;
      cur.action();
    };

    if (btnStart) {
      btnStart.addEventListener('click', () => {
        this.judgeTourActive = true;
        this.judgeTourStep = 1;
        if (banner) banner.style.display = 'block';
        updateTourUI();
      });
    }

    if (btnNext) {
      btnNext.addEventListener('click', () => {
        if (this.judgeTourStep < steps.length) {
          this.judgeTourStep += 1;
          updateTourUI();
        } else {
          this.judgeTourStep = 1;
          updateTourUI();
        }
      });
    }

    if (btnPrev) {
      btnPrev.addEventListener('click', () => {
        if (this.judgeTourStep > 1) {
          this.judgeTourStep -= 1;
          updateTourUI();
        }
      });
    }

    if (btnAuto) {
      btnAuto.addEventListener('click', () => {
        if (this.autoPlayTimer) {
          clearInterval(this.autoPlayTimer);
          this.autoPlayTimer = null;
          btnAuto.textContent = 'Auto Play';
          return;
        }

        btnAuto.textContent = 'Pause Auto';
        this.autoPlayTimer = setInterval(() => {
          if (this.judgeTourStep < steps.length) {
            this.judgeTourStep += 1;
            updateTourUI();
          } else {
            clearInterval(this.autoPlayTimer);
            this.autoPlayTimer = null;
            btnAuto.textContent = 'Auto Play';
          }
        }, 5000);
      });
    }

    if (btnClose) {
      btnClose.addEventListener('click', () => {
        if (banner) banner.style.display = 'none';
        if (this.autoPlayTimer) clearInterval(this.autoPlayTimer);
      });
    }
  }

  // =========================================================================
  // ROLE MODAL & USER DRAWER
  // =========================================================================
  setupRoleModal() {
    const modal = document.getElementById('roleSelectModal');
    const closeBtn = document.getElementById('btnCloseRoleModal');
    const userPill = document.getElementById('userProfilePill');

    if (userPill && modal) {
      userPill.addEventListener('click', () => {
        modal.style.display = 'flex';
      });
    }

    if (closeBtn && modal) {
      closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
      });
    }

    document.querySelectorAll('.role-card-select').forEach(card => {
      card.addEventListener('click', (e) => {
        const role = e.currentTarget.getAttribute('data-select-role');
        if (role) {
          window.appState.setRole(role);
          const sel = document.getElementById('userRoleSelect');
          if (sel) sel.value = role;
          if (modal) modal.style.display = 'none';
          this.showToast(`Switched operational role to: ${role.toUpperCase()}`, 'success');
        }
      });
    });

    // Close Trainee profile modal
    const closeTraineeModal = document.getElementById('btnCloseTraineeModal');
    const tModal = document.getElementById('traineeProfileModal');
    if (closeTraineeModal && tModal) {
      closeTraineeModal.addEventListener('click', () => {
        tModal.style.display = 'none';
      });
    }
  }

  // =========================================================================
  // AUDIO TOGGLE
  // =========================================================================
  setupAudioToggle() {
    const btn = document.getElementById('btnAudioToggle');
    const onIcon = document.getElementById('iconAudioOn');
    const offIcon = document.getElementById('iconAudioOff');

    if (btn && window.soundController) {
      btn.addEventListener('click', () => {
        const enabled = window.soundController.toggle();
        if (onIcon && offIcon) {
          onIcon.style.display = enabled ? 'block' : 'none';
          offIcon.style.display = enabled ? 'none' : 'block';
        }
        this.showToast(`Synthetic audio ${enabled ? 'enabled' : 'muted'}`, 'info');
      });
    }
  }

  // =========================================================================
  // TOAST NOTIFICATION STACK
  // =========================================================================
  showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span>${type === 'success' ? '✓' : (type === 'alert' ? '⚠' : 'ℹ')}</span>
      <span>${message}</span>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  onStateChange(state) {
    // Keep top navigation profile synced
    const userName = document.getElementById('topbarUserName');
    const userRank = document.getElementById('topbarUserRank');
    if (userName && state.currentUser) userName.textContent = state.currentUser.name;
    if (userRank && state.currentUser) userRank.textContent = `Level ${state.currentUser.currentLevel} • ${state.currentUser.id}`;

    // Reactive view rendering when currentView state changes
    if (this.currentActiveView !== state.currentView) {
      this.renderCurrentView();
    }
  }
}

// Global bootstrap
function startApp() {
  if (!window.appRouter) {
    window.appRouter = new AppController();
    window.appRouter.init();
    window.showToast = (msg, type) => window.appRouter.showToast(msg, type);
  }
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', startApp);
} else {
  startApp();
}
