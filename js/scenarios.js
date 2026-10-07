/**
 * DRONE-TRAIN | Scenario Library & Procedural Generator
 * SIH 2026 Problem Statement SIH26247
 * Fictional training scenario catalog & deterministic procedural generator
 */

const SCENARIO_CATALOG = [
  {
    id: 'sc-urban-01',
    title: 'Urban Perimeter',
    description: 'Surveillance across high-density synthetic urban buildings with multiple RF reflections.',
    environment: 'Urban',
    time: 'Day',
    sensorCondition: 'Normal',
    threatPattern: 'Single',
    difficulty: 'Moderate',
    targetThreat: {
      id: 'SIM-DRN-04',
      type: 'Small UAV',
      bearing: '045° NE',
      bearingDeg: 45,
      rangeM: 420,
      altitudeM: 65,
      speedMps: 14.2,
      acousticSignature: 'High-frequency multi-rotor electric buzz (840 Hz harmonic)',
      rfSpectrum: '2.437 GHz ISM Band • Fictional FHSS Telemetry',
      microDoppler: '4-blade rotation modulation detected • Small RCS (0.012 m²)',
      expectedDecision: 'Increase monitoring'
    }
  },
  {
    id: 'sc-rural-01',
    title: 'Rural Surveillance',
    description: 'Baseline low-clutter reconnaissance scenario across open agricultural and tree-line perimeter.',
    environment: 'Rural',
    time: 'Day',
    sensorCondition: 'Normal',
    threatPattern: 'Single',
    difficulty: 'Easy',
    targetThreat: {
      id: 'SIM-DRN-01',
      type: 'Small UAV',
      bearing: '315° NW',
      bearingDeg: 315,
      rangeM: 520,
      altitudeM: 80,
      speedMps: 11.5,
      acousticSignature: 'Twin-rotor acoustic whine (620 Hz fundamental)',
      rfSpectrum: '5.8 GHz FPV Video Carrier • Fictional standard link',
      microDoppler: 'Clean sinusoidal Doppler shift • Clear Line-of-Sight',
      expectedDecision: 'Continue observation'
    }
  },
  {
    id: 'sc-night-01',
    title: 'Night Watch',
    description: 'Perimeter scanning under zero-lux twilight conditions relying on synthetic EO/IR telemetry.',
    environment: 'Rural',
    time: 'Night',
    sensorCondition: 'Normal',
    threatPattern: 'Multiple',
    difficulty: 'Hard',
    targetThreat: {
      id: 'SIM-DRN-07',
      type: 'Large UAV',
      bearing: '180° S',
      bearingDeg: 180,
      rangeM: 680,
      altitudeM: 120,
      speedMps: 22.0,
      acousticSignature: 'Low-frequency internal combustion engine thrum (180 Hz)',
      rfSpectrum: '915 MHz Long-Range Telemetry • Frequency hopping',
      microDoppler: 'Single pusher-propeller periodic spike • Large RCS (0.15 m²)',
      expectedDecision: 'Notify training supervisor'
    }
  },
  {
    id: 'sc-degraded-01',
    title: 'Degraded Sensor',
    description: 'Electromagnetic clutter and atmospheric fog causing telemetry jitter and visual obscuration.',
    environment: 'Mixed',
    time: 'Day',
    sensorCondition: 'Degraded',
    threatPattern: 'Single',
    difficulty: 'Hard',
    targetThreat: {
      id: 'SIM-DRN-09',
      type: 'Unknown Object',
      bearing: '090° E',
      bearingDeg: 90,
      rangeM: 380,
      altitudeM: 50,
      speedMps: 16.0,
      acousticSignature: 'Intermittent harmonic burst masked by ambient RF noise floor',
      rfSpectrum: 'Broadband RF interference spike • High noise figure',
      microDoppler: 'Noisy phase returns • Unresolved blade count',
      expectedDecision: 'Mark scenario for review'
    }
  },
  {
    id: 'sc-swarm-01',
    title: 'Swarm Awareness',
    description: 'Simulated coordinated flight formation of 4 micro-UAVs testing swarm classification protocols.',
    environment: 'Open',
    time: 'Day',
    sensorCondition: 'Normal',
    threatPattern: 'Simulated Swarm',
    difficulty: 'Advanced',
    targetThreat: {
      id: 'SIM-SWM-03',
      type: 'Swarm Group',
      bearing: '020° NNE',
      bearingDeg: 20,
      rangeM: 490,
      altitudeM: 70,
      speedMps: 18.5,
      acousticSignature: 'Overlapping multi-tone acoustic chorus (multi-node heterodyne)',
      rfSpectrum: 'Synchronized mesh-network beaconing (868 MHz / 2.4 GHz)',
      microDoppler: 'Multi-target micro-Doppler cloud with dynamic spatial spread',
      expectedDecision: 'Notify training supervisor'
    }
  },
  {
    id: 'sc-urban-adv',
    title: 'Perimeter Intrusion',
    description: 'High-speed synthetic intruder navigating urban street canyons under reduced visibility.',
    environment: 'Urban',
    time: 'Night',
    sensorCondition: 'Reduced',
    threatPattern: 'Multiple',
    difficulty: 'Advanced',
    targetThreat: {
      id: 'SIM-DRN-12',
      type: 'Large UAV',
      bearing: '270° W',
      bearingDeg: 270,
      rangeM: 350,
      altitudeM: 45,
      speedMps: 24.0,
      acousticSignature: 'High-speed fixed-wing brushless turbine simulation (1150 Hz)',
      rfSpectrum: 'Encrypted telemetry stream • 5.8 GHz directional payload',
      microDoppler: 'High radial Doppler velocity • Moderate RCS (0.08 m²)',
      expectedDecision: 'Notify training supervisor'
    }
  }
];

class ScenarioManager {
  constructor() {
    this.scenarios = [...SCENARIO_CATALOG];
    this.activeFilter = 'all';
    this.searchQuery = '';
  }

  getAll() {
    return this.scenarios;
  }

  getById(id) {
    return this.scenarios.find(s => s.id === id) || this.scenarios[0];
  }

  renderScenarioCards(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const filtered = this.scenarios.filter(sc => {
      const matchFilter = this.activeFilter === 'all' || sc.difficulty === this.activeFilter;
      const matchSearch = sc.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                          sc.environment.toLowerCase().includes(this.searchQuery.toLowerCase());
      return matchFilter && matchSearch;
    });

    container.innerHTML = filtered.map(sc => {
      let diffBadgeClass = 'badge-info';
      if (sc.difficulty === 'Easy') diffBadgeClass = 'badge-success';
      if (sc.difficulty === 'Moderate') diffBadgeClass = 'badge-warning';
      if (sc.difficulty === 'Hard' || sc.difficulty === 'Advanced') diffBadgeClass = 'badge-danger';

      return `
        <div class="scenario-card-item">
          <div>
            <div class="sc-card-top">
              <h4 class="sc-title">${sc.title}</h4>
              <span class="badge-pill ${diffBadgeClass}">${sc.difficulty}</span>
            </div>
            <p class="text-subtle text-xs mt-1 mb-3">${sc.description}</p>
            <div class="sc-meta-rows">
              <div class="sc-row">
                <span class="sc-label">Environment:</span>
                <span class="sc-val">${sc.environment}</span>
              </div>
              <div class="sc-row">
                <span class="sc-label">Visibility:</span>
                <span class="sc-val">${sc.time} • ${sc.sensorCondition}</span>
              </div>
              <div class="sc-row">
                <span class="sc-label">Threat Pattern:</span>
                <span class="sc-val">${sc.threatPattern}</span>
              </div>
            </div>
          </div>
          <div class="sc-actions mt-3">
            <button class="btn btn-primary btn-block btn-sm btn-start-scenario" data-scenario-id="${sc.id}">
              <span>Start Scenario</span>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Attach Start Scenario Button Listeners
    container.querySelectorAll('.btn-start-scenario').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-scenario-id');
        this.launchScenarioById(id);
      });
    });
  }

  launchScenarioById(id) {
    const sc = this.getById(id);
    if (!sc) return;

    window.appState.update(state => {
      state.activeSession = {
        id: `TR-${Math.floor(1050 + Math.random() * 40)}`,
        scenarioId: sc.id,
        scenarioName: sc.title,
        difficulty: sc.difficulty,
        environment: sc.environment,
        time: sc.time,
        sensorCondition: sc.sensorCondition,
        threatPattern: sc.threatPattern,
        seed: `SEED-${Math.floor(1000 + Math.random() * 9000)}X`,
        phase: 'IDLE',
        startTime: null,
        threatSpawnTime: null,
        detectionTime: null,
        detectionLatencySec: 0,
        threat: {
          ...sc.targetThreat,
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
          { timeOffsetSec: '00:00.0', title: 'Scenario Initialized', desc: `${sc.title} loaded (${sc.environment} • ${sc.time} • ${sc.sensorCondition}).` }
        ],
        trainerFeedback: {
          tags: [],
          notes: '',
          saved: false
        }
      };
      state.currentView = 'simulator';
    });

    if (window.appRouter) {
      window.appRouter.renderCurrentView();
    }
    if (window.showToast) {
      window.showToast(`Loaded scenario: ${sc.title}`, 'success');
    }
  }

  generateProceduralSeed() {
    const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const num = Math.floor(1000 + Math.random() * 9000);
    const letter = letters[Math.floor(Math.random() * letters.length)];
    return `SEED-${num}${letter}`;
  }

  createProceduralScenario(env, time, sensor, pattern, difficulty, seed) {
    const threatTypes = ['Small UAV', 'Large UAV', 'Unknown Object', 'Swarm Group'];
    const chosenType = pattern === 'Simulated Swarm' ? 'Swarm Group' : threatTypes[Math.floor(Math.random() * 3)];
    
    const bearingDeg = Math.floor(Math.random() * 360);
    const rangeM = Math.floor(320 + Math.random() * 350);
    const altM = Math.floor(40 + Math.random() * 60);
    const speed = (12 + Math.random() * 12).toFixed(1);

    let expectedDecision = 'Increase monitoring';
    if (chosenType === 'Small UAV') expectedDecision = 'Increase monitoring';
    if (chosenType === 'Large UAV' || chosenType === 'Swarm Group') expectedDecision = 'Notify training supervisor';
    if (chosenType === 'Unknown Object') expectedDecision = 'Mark scenario for review';

    return {
      id: `sc-proc-${Date.now()}`,
      title: `Custom ${env} (${seed})`,
      description: `Procedural training synthesis generated from seed ${seed}.`,
      environment: env,
      time: time,
      sensorCondition: sensor,
      threatPattern: pattern,
      difficulty: difficulty,
      seed: seed,
      targetThreat: {
        id: `SIM-DRN-${Math.floor(10 + Math.random() * 89)}`,
        type: chosenType,
        bearing: `${bearingDeg}°`,
        bearingDeg: bearingDeg,
        rangeM: rangeM,
        altitudeM: altM,
        speedMps: parseFloat(speed),
        acousticSignature: chosenType === 'Small UAV'
          ? 'Electric multi-rotor harmonic (820 Hz)'
          : 'Gas-engine drone acoustic thrum (240 Hz)',
        rfSpectrum: '2.4 / 5.8 GHz Dual-band Fictional Telemetry Link',
        microDoppler: 'Modulated multi-blade Doppler radar shift',
        expectedDecision: expectedDecision
      }
    };
  }
}

window.scenarioManager = new ScenarioManager();
