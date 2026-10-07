/**
 * DRONE-TRAIN | Adaptive Training Engine
 * SIH 2026 Problem Statement SIH26247
 * Deterministic difficulty progression model, parameter weighting & syllabus generation
 */

class AdaptiveEngineController {
  constructor() {
    this.container = document.getElementById('view-adaptive');
    this.setupListeners();
  }

  render() {
    const state = window.appState.get();
    const model = state.adaptiveModel;

    // Evaluate live recommendation from recent sessions
    const rec = window.appState.evaluateAdaptiveRecommendation();

    // 1. Current Level Badge & Title
    const lvlNum = document.getElementById('adaptiveCurrentLevelNum');
    if (lvlNum) lvlNum.textContent = model.currentLevel;

    const lvlName = document.getElementById('adaptiveCurrentLevelName');
    if (lvlName) lvlName.textContent = `Level ${model.currentLevel} — Intermediate`;

    const masteryPercent = document.getElementById('levelMasteryPercent');
    if (masteryPercent) masteryPercent.textContent = `${model.masteryPercent}%`;

    // 2. Recommended Level & AI Reasoning
    const recLevel = document.getElementById('adaptiveRecommendedLevel');
    if (recLevel) recLevel.textContent = model.recommendedLevelName || 'Level 5 — Advanced';

    const quote = document.getElementById('adaptiveReasoningQuote');
    if (quote) quote.textContent = `"${model.reasoning}"`;

    // 3. Highlight Active Rule in Diagram
    this.updateRuleHighlight(rec.recLevel, model.currentLevel);

    // 4. Update Sliders and Values
    this.syncSlidersFromModel(model);
  }

  updateRuleHighlight(recommendedLevel, currentLevel) {
    const rules = document.querySelectorAll('.adaptive-rules-diagram .rule-box');
    rules.forEach(r => r.classList.remove('active-rule'));

    if (recommendedLevel > currentLevel) {
      const up = document.querySelector('.rule-up');
      if (up) up.classList.add('active-rule');
    } else if (recommendedLevel < currentLevel) {
      const down = document.querySelector('.rule-down');
      if (down) down.classList.add('active-rule');
    } else {
      const hold = document.querySelector('.rule-hold');
      if (hold) hold.classList.add('active-rule');
    }
  }

  syncSlidersFromModel(model) {
    const fComplexity = document.getElementById('factorComplexity');
    const fVisibility = document.getElementById('factorVisibility');
    const fThreatCount = document.getElementById('factorThreatCount');
    const fRandomness = document.getElementById('factorRandomness');
    const fTimePressure = document.getElementById('factorTimePressure');

    if (fComplexity) fComplexity.value = model.factors.complexity;
    if (fVisibility) fVisibility.value = model.factors.visibility;
    if (fThreatCount) fThreatCount.value = model.factors.threatPattern;
    if (fRandomness) fRandomness.value = model.factors.randomness;
    if (fTimePressure) fTimePressure.value = 3;

    this.updateSliderLabels();
  }

  updateSliderLabels() {
    const complexityMap = { 1: 'Rural Simple', 2: 'Open Airfield', 3: 'Mixed Wooded', 4: 'Urban Dense', 5: 'Extreme Canyon' };
    const visibilityMap = { 1: 'Normal (Day)', 2: 'Reduced (Night)', 3: 'Degraded (Fog/Noise)' };
    const patternMap = { 1: 'Single Drone', 2: 'Multiple Targets', 3: 'Simulated Swarm' };
    const timePressureMap = { 1: 'Relaxed (6.0s)', 2: 'Standard (4.0s)', 3: 'Accelerated (3.0s)', 4: 'Critical (2.0s)' };

    const cVal = document.getElementById('factorComplexity')?.value;
    const vVal = document.getElementById('factorVisibility')?.value;
    const pVal = document.getElementById('factorThreatCount')?.value;
    const rVal = document.getElementById('factorRandomness')?.value;
    const tVal = document.getElementById('factorTimePressure')?.value;

    const lblC = document.getElementById('valComplexity');
    const lblV = document.getElementById('valVisibility');
    const lblP = document.getElementById('valThreatCount');
    const lblR = document.getElementById('valRandomness');
    const lblT = document.getElementById('valTimePressure');

    if (lblC && cVal) lblC.textContent = complexityMap[cVal] || 'Urban Dense';
    if (lblV && vVal) lblV.textContent = visibilityMap[vVal] || 'Degraded';
    if (lblP && pVal) lblP.textContent = patternMap[pVal] || 'Multiple Targets';
    if (lblR && rVal) lblR.textContent = `${rVal}% Seed Clutter`;
    if (lblT && tVal) lblT.textContent = timePressureMap[tVal] || 'Accelerated (3.0s)';
  }

  setupListeners() {
    // Sliders input events
    ['factorComplexity', 'factorVisibility', 'factorThreatCount', 'factorRandomness', 'factorTimePressure'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', () => this.updateSliderLabels());
      }
    });

    // Reset to Recommended button
    const btnResetFactors = document.getElementById('btnResetFactors');
    if (btnResetFactors) {
      btnResetFactors.addEventListener('click', () => {
        window.appState.update(state => {
          state.adaptiveModel.factors = {
            complexity: 4,
            visibility: 3,
            threatPattern: 2,
            randomness: 75,
            timePressureSec: 3.0
          };
        });
        this.render();
        if (window.showToast) window.showToast('Reset factor matrix to AI recommended values', 'success');
      });
    }

    // Launch Adapted Scenario Button
    const btnLaunch = document.getElementById('btnLaunchAdaptiveScenario');
    if (btnLaunch) {
      btnLaunch.addEventListener('click', () => this.launchAdaptedSession());
    }

    // Reset model baseline
    const btnResetBaseline = document.getElementById('btnResetAdaptiveModel');
    if (btnResetBaseline) {
      btnResetBaseline.addEventListener('click', () => {
        window.appState.update(state => {
          state.adaptiveModel.currentLevel = 4;
          state.adaptiveModel.masteryPercent = 75;
        });
        this.render();
        if (window.showToast) window.showToast('Adaptive training baseline reset to Level 4', 'success');
      });
    }
  }

  launchAdaptedSession() {
    const state = window.appState.get();
    const recLvl = state.adaptiveModel.recommendedLevel || 5;

    // Synthesize adapted scenario based on level
    let env = 'Urban';
    let time = 'Day';
    let sensor = 'Degraded';
    let pattern = 'Multiple';
    let diff = 'Hard';

    if (recLvl >= 5) {
      env = 'Urban';
      time = 'Night';
      sensor = 'Degraded';
      pattern = 'Simulated Swarm';
      diff = 'Advanced';
    } else if (recLvl === 4) {
      env = 'Mixed';
      time = 'Day';
      sensor = 'Reduced';
      pattern = 'Multiple';
      diff = 'Moderate';
    } else {
      env = 'Rural';
      time = 'Day';
      sensor = 'Normal';
      pattern = 'Single';
      diff = 'Easy';
    }

    const seed = `ADAPT-${Math.floor(1000 + Math.random() * 9000)}`;
    const proc = window.scenarioManager.createProceduralScenario(env, time, sensor, pattern, diff, seed);

    window.appState.update(st => {
      st.activeSession = {
        id: `TR-${Math.floor(1050 + Math.random() * 40)}`,
        scenarioId: proc.id,
        scenarioName: `Adaptive Level ${recLvl} — ${env}`,
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
          ...proc.targetThreat,
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
          { timeOffsetSec: '00:00.0', title: 'Adaptive Scenario Loaded', desc: `Autonomous difficulty scaled to Level ${recLvl} (${diff} • ${sensor} sensor condition).` }
        ],
        trainerFeedback: {
          tags: [],
          notes: '',
          saved: false
        }
      };
      st.currentView = 'simulator';
    });

    if (window.appRouter) window.appRouter.renderCurrentView();
    if (window.showToast) window.showToast(`Launched Adaptive Level ${recLvl} Scenario (${diff})`, 'success');
  }
}

window.adaptiveController = new AdaptiveEngineController();
