/**
 * DRONE-TRAIN | State Management Store
 * SIH 2026 Problem Statement SIH26247
 * Deterministic Simulation State, Sessions, Scoring, and Adaptive Rules
 */

const STORAGE_KEY = 'dronetrain_state_v1';

// Default initial state with realistic SIH demo seed data
const DEFAULT_STATE = {
  currentView: 'dashboard',
  currentRole: 'trainee', // 'trainee' | 'trainer' | 'admin'
  audioEnabled: true,
  
  currentUser: {
    id: 'TR-C84',
    name: 'Cadet R. Sharma',
    rank: 'Cadet',
    unit: 'Air-Defence Training Wing',
    currentLevel: 4,
    levelName: 'Level 4 — Intermediate',
    avgScore: 86,
    completedSessionsCount: 14
  },

  // Active Session in the Training Simulator
  activeSession: {
    id: 'TR-1049',
    scenarioId: 'sc-urban-01',
    scenarioName: 'Urban Perimeter',
    difficulty: 'Moderate',
    environment: 'Urban',
    time: 'Day',
    sensorCondition: 'Normal', // 'Normal' | 'Reduced' | 'Degraded'
    threatPattern: 'Single',   // 'Single' | 'Multiple' | 'Simulated Swarm'
    seed: 'SEED-9842X',
    
    // State Machine: IDLE -> SCENARIO_GENERATED -> THREAT_ACTIVE -> DETECTION -> CLASSIFICATION -> DECISION -> SCORING -> AAR
    phase: 'IDLE',
    startTime: null,
    threatSpawnTime: null,
    detectionTime: null,
    detectionLatencySec: 0,
    
    // Active Synthetic Threat Entity
    threat: {
      id: 'SIM-DRN-04',
      type: 'Small UAV', // True label
      displayCategory: 'Small UAV',
      bearing: '045° NE',
      bearingDeg: 45,
      rangeM: 420,
      altitudeM: 65,
      speedMps: 14.2,
      acousticSignature: 'High-frequency multi-rotor electric buzz (840 Hz harmonic)',
      rfSpectrum: '2.437 GHz ISM Band • Fictional FHSS Telemetry',
      microDoppler: '4-blade rotation modulation detected • Small RCS (0.012 m²)',
      detected: false,
      userClassification: null,
      isClassificationCorrect: false,
      userDecision: null,
      isDecisionAppropriate: false
    },

    // Detailed Rule-based Scoring Breakdown
    scores: {
      detectionPts: 28,     // out of 30
      classificationPts: 30,// out of 30
      decisionPts: 21,      // out of 25
      consistencyPts: 13,   // out of 15
      totalScore: 92,       // out of 100
      grade: 'A',
      ratingText: 'Excellent'
    },

    // Chronological event timeline for After-Action Review (AAR)
    timeline: [
      { timeOffsetSec: '00:00.0', title: 'Scenario Initialized', desc: 'Urban Perimeter loaded with Day illumination & Normal sensor calibration.' },
      { timeOffsetSec: '00:03.2', title: 'Radar Airspace Scan', desc: 'MTI surveillance radar operational at 60 RPM. Sector SEC-04B clear.' },
      { timeOffsetSec: '00:06.1', title: 'Threat Generated', desc: 'Synthetic drone target [SIM-DRN-04] injected at Azimuth 045°, Range 420m.' },
      { timeOffsetSec: '00:08.9', title: 'Threat Detected', desc: 'Trainee acknowledged intrusion in 2.8s reaction window (Optimal < 4.0s).' },
      { timeOffsetSec: '00:13.4', title: 'Classification Submitted', desc: 'Selected "Small UAV" based on micro-Doppler and acoustic profile (Correct: +30 pts).' },
      { timeOffsetSec: '00:17.8', title: 'Training Decision Submitted', desc: 'Selected "Increase monitoring" safe protocol (Appropriate: +21 pts).' },
      { timeOffsetSec: '00:18.2', title: 'Scenario Completed', desc: 'Rule-based scoring computed final score of 92/100.' }
    ],

    // Trainer AAR Feedback
    trainerFeedback: {
      tags: ['Fast detection', 'Accurate RCS analysis'],
      notes: 'Good detection performance. Focus on maintaining classification accuracy under reduced visibility.',
      saved: true
    }
  },

  // Completed Sessions History
  recentSessions: [
    {
      id: 'TR-1048',
      traineeId: 'TR-C84',
      traineeName: 'Cadet R. Sharma',
      scenario: 'Urban Recon',
      environment: 'Urban',
      difficulty: 'Moderate',
      score: 91,
      result: 'Excellent',
      date: 'Today, 11:20 AM',
      detectionTime: '2.9 sec',
      classification: 'Correct (Small UAV)',
      decision: 'Increase monitoring',
      notes: 'Demonstrated sharp target acquisition.'
    },
    {
      id: 'TR-1047',
      traineeId: 'TR-C84',
      traineeName: 'Cadet R. Sharma',
      scenario: 'Night Watch',
      environment: 'Rural',
      difficulty: 'Hard',
      score: 84,
      result: 'Good',
      date: 'Yesterday, 04:45 PM',
      detectionTime: '3.6 sec',
      classification: 'Correct (Large UAV)',
      decision: 'Notify training supervisor',
      notes: 'Consistent night identification.'
    },
    {
      id: 'TR-1046',
      traineeId: 'TR-C84',
      traineeName: 'Cadet R. Sharma',
      scenario: 'Swarm Awareness',
      environment: 'Mixed',
      difficulty: 'Advanced',
      score: 78,
      result: 'Improving',
      date: 'Yesterday, 02:15 PM',
      detectionTime: '4.2 sec',
      classification: 'Correct (Swarm Group)',
      decision: 'Notify training supervisor',
      notes: 'Slight delay during formation clustering.'
    },
    {
      id: 'TR-1045',
      traineeId: 'TR-C84',
      traineeName: 'Cadet R. Sharma',
      scenario: 'Perimeter Intrusion',
      environment: 'Urban',
      difficulty: 'Moderate',
      score: 88,
      result: 'Excellent',
      date: '05 Oct 2026',
      detectionTime: '3.1 sec',
      classification: 'Correct (Small UAV)',
      decision: 'Increase monitoring',
      notes: 'Clean execution of observation protocol.'
    }
  ],

  // Unit Trainees Roster
  trainees: [
    {
      id: 'TR-C84',
      name: 'Cadet R. Sharma',
      rank: 'Cadet',
      sessions: 14,
      level: 4,
      levelName: 'Level 4 — Intermediate',
      avgScore: 86,
      detectionRate: '94%',
      classificationRate: '87%',
      trend: 'up',
      status: 'Active',
      lastTraining: 'Today'
    },
    {
      id: 'TR-O12',
      name: 'Officer A. Verma',
      rank: 'Flight Lieutenant',
      sessions: 10,
      level: 5,
      levelName: 'Level 5 — Advanced',
      avgScore: 91,
      detectionRate: '96%',
      classificationRate: '92%',
      trend: 'up',
      status: 'Active',
      lastTraining: 'Yesterday'
    },
    {
      id: 'TR-C91',
      name: 'Cadet P. Nair',
      rank: 'Cadet',
      sessions: 15,
      level: 3,
      levelName: 'Level 3 — Basic',
      avgScore: 78,
      detectionRate: '82%',
      classificationRate: '79%',
      trend: 'flat',
      status: 'In Training',
      lastTraining: 'Yesterday'
    },
    {
      id: 'TR-C77',
      name: 'Cadet V. Singh',
      rank: 'Cadet',
      sessions: 8,
      level: 2,
      levelName: 'Level 2 — Novice',
      avgScore: 72,
      detectionRate: '75%',
      classificationRate: '74%',
      trend: 'down',
      status: 'Needs Review',
      lastTraining: '04 Oct 2026'
    },
    {
      id: 'TR-O09',
      name: 'Officer S. Gupta',
      rank: 'Sub Lieutenant',
      sessions: 12,
      level: 4,
      levelName: 'Level 4 — Intermediate',
      avgScore: 88,
      detectionRate: '91%',
      classificationRate: '88%',
      trend: 'up',
      status: 'Active',
      lastTraining: '03 Oct 2026'
    }
  ],

  // Adaptive Engine Status
  adaptiveModel: {
    currentLevel: 4,
    recommendedLevel: 5,
    recommendedLevelName: 'Level 5 — Advanced',
    reasoning: 'Recent sessions show strong detection accuracy and stable decision performance. The next scenario introduces increased environmental variation and degraded sensor visibility.',
    masteryPercent: 78,
    ruleThresholdAdvance: 85,
    ruleThresholdMaintain: 65,
    factors: {
      complexity: 4,       // 1 - 5 (Urban)
      visibility: 3,        // 1 - 3 (Degraded)
      threatPattern: 2,     // 1 - 3 (Multiple)
      randomness: 75,       // 0 - 100%
      timePressureSec: 3.0  // Target window
    }
  }
};

class StateStore {
  constructor() {
    this.state = this.loadState();
    this.listeners = [];
  }

  loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          const merged = Object.assign({}, JSON.parse(JSON.stringify(DEFAULT_STATE)), parsed);
          const validViews = ['dashboard', 'simulator', 'scenarios', 'performance', 'aar', 'adaptive', 'trainees', 'trainer', 'settings'];
          if (!validViews.includes(merged.currentView)) {
            merged.currentView = 'dashboard';
          }
          return merged;
        }
      }
    } catch (e) {
      console.warn('Failed to load state from localStorage:', e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_STATE));
  }

  saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.warn('Failed to save state to localStorage:', e);
    }
    this.notify();
  }

  resetToDefault() {
    this.state = JSON.parse(JSON.stringify(DEFAULT_STATE));
    this.saveState();
  }

  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  notify() {
    this.listeners.forEach(fn => fn(this.state));
  }

  get() {
    return this.state;
  }

  update(fn) {
    fn(this.state);
    this.saveState();
  }

  setView(viewName) {
    this.state.currentView = viewName;
    this.saveState();
  }

  setRole(roleName) {
    this.state.currentRole = roleName;
    this.saveState();
  }

  /**
   * Deterministic scoring model
   * Detection: 30 pts
   * Classification: 30 pts
   * Decision: 25 pts
   * Consistency: 15 pts
   * Total = 100 pts
   */
  calculateSessionScore(latencySec, isClassCorrect, userDecision, expectedDecision) {
    // 1. Detection Score (30 max)
    let detPts = 30;
    if (latencySec <= 2.5) {
      detPts = 30;
    } else if (latencySec <= 4.0) {
      detPts = Math.round(30 - ((latencySec - 2.5) / 1.5) * 4); // 26 - 30
    } else if (latencySec <= 7.0) {
      detPts = Math.round(26 - ((latencySec - 4.0) / 3.0) * 8); // 18 - 26
    } else {
      detPts = 12;
    }

    // 2. Classification Score (30 max)
    let classPts = 0;
    if (isClassCorrect) {
      classPts = 30;
    } else if (this.state.activeSession.threat.userClassification === 'Unknown Object') {
      classPts = 12; // Partial credit for cautious classification
    } else {
      classPts = 6;  // Small baseline for telemetry attempt
    }

    // 3. Decision Score (25 max)
    let decPts = 15;
    if (userDecision === expectedDecision) {
      decPts = 25;
    } else if (userDecision === 'Increase monitoring' || userDecision === 'Notify training supervisor') {
      decPts = 20; // Safe standard protocols
    } else if (userDecision === 'Continue observation') {
      decPts = 14;
    } else if (userDecision === 'Mark scenario for review') {
      decPts = 18;
    }

    // 4. Consistency & Latency Weight (15 max)
    let consistPts = 13;
    if (latencySec < 3.5 && isClassCorrect) {
      consistPts = 15;
    } else if (latencySec > 5.0) {
      consistPts = 10;
    }

    const total = Math.min(100, Math.max(0, detPts + classPts + decPts + consistPts));
    let grade = 'B';
    let rating = 'Good';

    if (total >= 90) {
      grade = 'A+';
      rating = 'Excellent';
    } else if (total >= 85) {
      grade = 'A';
      rating = 'Excellent';
    } else if (total >= 75) {
      grade = 'B';
      rating = 'Good';
    } else if (total >= 65) {
      grade = 'C';
      rating = 'Improving';
    } else {
      grade = 'D';
      rating = 'Needs Focus';
    }

    return {
      detectionPts: detPts,
      classificationPts: classPts,
      decisionPts: decPts,
      consistencyPts: consistPts,
      totalScore: total,
      grade: grade,
      ratingText: rating
    };
  }

  /**
   * Adaptive Difficulty Rule Evaluator
   * IF avgScore >= 85 repeatedly -> Increase difficulty
   * IF avgScore 65-84 -> Maintain
   * IF avgScore < 65 -> Reduce difficulty
   */
  evaluateAdaptiveRecommendation() {
    const scores = this.state.recentSessions.slice(0, 4).map(s => s.score);
    const avg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 85;
    let recLevel = this.state.adaptiveModel.currentLevel;
    let recName = 'Level 4 — Intermediate';
    let reasoning = '';

    if (avg >= 85) {
      recLevel = Math.min(5, this.state.adaptiveModel.currentLevel + 1);
      recName = `Level ${recLevel} — ${recLevel === 5 ? 'Advanced' : 'Expert'}`;
      reasoning = `Recent sessions show strong detection accuracy (${avg}% avg) and stable decision performance. The next scenario introduces increased environmental variation and degraded sensor visibility.`;
    } else if (avg >= 65) {
      recLevel = this.state.adaptiveModel.currentLevel;
      recName = `Level ${recLevel} — Intermediate`;
      reasoning = `Performance is stable (${avg}% avg). Maintaining current difficulty level to reinforce consistent target classification across multiple directions.`;
    } else {
      recLevel = Math.max(1, this.state.adaptiveModel.currentLevel - 1);
      recName = `Level ${recLevel} — Basic`;
      reasoning = `Recent score cadence (${avg}%) indicates difficulty under high clutter. Recommending a baseline session with clear visibility to solidify response timing.`;
    }

    this.state.adaptiveModel.recommendedLevel = recLevel;
    this.state.adaptiveModel.recommendedLevelName = recName;
    this.state.adaptiveModel.reasoning = reasoning;

    return {
      recLevel,
      recName,
      reasoning
    };
  }
}

// Global state instance
window.appState = new StateStore();
