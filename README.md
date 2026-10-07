# DRONE-TRAIN
### AI-Enabled Drone & Counter-Drone Threat Simulation Trainer
**Smart India Hackathon 2026 — Problem Statement SIH26247**

---

## 1. Prototype Overview
**DRONE-TRAIN** is a software-only, simulated defence-training prototype designed for **Smart India Hackathon 2026 (SIH26247)**. It demonstrates the complete end-to-end training cycle:

$$\text{SCENARIO} \longrightarrow \text{DETECT} \longrightarrow \text{CLASSIFY} \longrightarrow \text{DECIDE} \longrightarrow \text{SCORE} \longrightarrow \text{REVIEW} \longrightarrow \text{ADAPT}$$

> **IMPORTANT SCOPE & SAFETY NOTICE:**
> This application is strictly a **training simulation prototype**. It contains **no real-world weapon controls, targeting algorithms, weapon guidance, autonomous attack systems, or integration with physical defence hardware**. All threats, sensor feeds, telemetry signatures, environments, and responses are simulated and training-oriented.

---

## 2. Key Features & Screens

1. **Enterprise White-Based Command Dashboard:**
   - Real-time training metrics: Active Sessions (03), Sessions Completed (128+), Avg Detection Time (3.8s), Classification Accuracy (87%), Decision Accuracy (82%), Overall Score (86/100).
   - Multi-session competency trajectory chart (Overall, Detection, Classification, Decision).
   - Recent Training Sessions table with direct links to After-Action Reviews.
   - Dynamic Adaptive Training Recommendation card.

2. **Training Simulator (Core Demonstration View):**
   - Interactive **Three.js 3D Viewport** featuring synthetic training environments:
     - **Urban**: Stylized modern buildings, street corridors, perimeter security fence, antenna towers, and helipad.
     - **Rural**: Rolling terrain with clusters of pine/oak foliage and observation towers.
     - **Open Terrain**: Airfield runway with center dashes and radar station.
     - **Mixed Terrain**: Combination of structures and wooded borders.
   - **Day / Night Illumination & Sensor Condition Simulation**:
     - *Normal*: Clear radar scans and sharp visual telemetry.
     - *Reduced*: Atmospheric fog obscuration.
     - *Degraded*: Electromagnetic static overlay, scanlines, and telemetry jitter.
   - **Simulated Drone 3D Entity**:
     - Quadcopter with spinning rotor disks, blinking red/green/white beacon lights, and ground altitude drop line.
     - Swarm formation option rendering synchronized micro-drones.
     - Interactive Raycasting: Click directly on the drone in 3D to trigger detection (or hit `[Spacebar]`).
   - **Multi-Perspective Cameras**:
     - *Tactical Orbit*: Free pan, rotate, and zoom.
     - *Perimeter Tower*: First-person view from atop the surveillance tower.
     - *Radar Overhead*: Top-down orthographic airspace view.
   - **Step-by-step Interactive Workflow**:
     - **Step 1: Detection**: Real-time reaction timer counting in milliseconds; HUD reticle and mini radar sweep blip.
     - **Step 2: Classification**: Telemetry analysis panel (acoustic harmonic frequency, RF spectrum, micro-Doppler modulation) with 4 choices: Small UAV, Large UAV, Unknown Object, Swarm Group.
     - **Step 3: Training Decision**: Safe, non-weaponized procedural responses (Continue observation, Increase monitoring, Notify training supervisor, Mark scenario for review).
     - **Step 4: Transparent Scoring**: Deterministic breakdown: Detection (30 pts) + Classification (30 pts) + Decision (25 pts) + Consistency (15 pts) = 100 pts.

3. **After-Action Review (AAR):**
   - Chronological event timeline with millisecond timestamps (`Threat Generated` $\rightarrow$ `Detected` $\rightarrow$ `Classified` $\rightarrow$ `Decided` $\rightarrow$ `Scored`).
   - Dynamic "What went well" and "Areas to improve" evaluations based on real trainee latency.
   - Interactive Trainer Feedback input with debrief tags and persistence.
   - Export AAR Report button formatted for clean printing/PDF.

4. **Adaptive Training Engine:**
   - Current level tracking (Level 4 — Intermediate).
   - Rule-based AI Recommendation engine:
     - $\text{Score} \ge 85$: Increase difficulty (+1 Level, adds sensor noise or multi-threats).
     - $\text{Score } 65 - 84$: Maintain level (consolidate classification consistency).
     - $\text{Score} < 65$: Reduce difficulty (-1 Level, baseline reaction drills).
   - Transparent progression logic diagram.
   - 5 Adjustable factor sliders (Environment complexity, Sensor visibility, Threat pattern, Randomness, Time pressure).
   - 1-Click "Launch Adapted Scenario" button.

5. **Scenario Library & Custom Generator:**
   - 6 Pre-configured scenarios: Urban Perimeter, Rural Surveillance, Night Watch, Degraded Sensor, Swarm Awareness, Perimeter Intrusion.
   - Procedural Scenario Generator with reproducible seed generation (`SEED-9842X`) and live configuration preview.

6. **Performance Analytics & Unit Roster:**
   - Longitudinal Score & Detection Latency progression chart.
   - Threat Category classification accuracy bar chart.
   - Sensor Environmental Resilience matrix (Normal vs Reduced vs Degraded).
   - Unit Trainee Roster table with sorting, filters, qualification levels, and profile modal.

7. **Trainer Console:**
   - Real-time simulation inject triggers: *Simulate Sensor Jamming*, *Secondary Decoy Threat*, *Sudden Altitude Evasion*.
   - Adaptive threshold calibration controls.

8. **SIH Judge Demo Walkthrough Mode:**
   - Topbar button: **Judge Demo Walkthrough**.
   - Step-by-step guided banner that steps through all 7 stages in under 60 seconds with an optional "Auto Play" mode!

---

## 3. How to Run Locally

### Option A: Using the Built-in Node.js Server
```bash
node server.js
```
Open your browser and navigate to:
```
http://localhost:3000
```

### Option B: Using Python
```bash
python -m http.server 3000
```
Open your browser and navigate to:
```
http://localhost:3000
```

---

## 4. SIH Presentation Demonstration Script (for Judges)

1. **Dashboard (30 seconds):**
   - Explain the training problem: Operators need measurable, repeatable practice in recognizing drone threats without physical risk.
   - Point out the active metrics, recent sessions, and the Adaptive Training recommendation.

2. **Launch Simulator (1 minute):**
   - Click **Training Simulator** on the left sidebar.
   - Show the 3D synthetic environment, radar sweep cone, and telemetry panel.
   - Switch camera view to *Perimeter Tower* or *Radar Overhead*.
   - Click **Inject Threat** (or wait for automatic intrusion).
   - Observe the simulated drone entering airspace, altitude indicator line, and reaction timer counting up.
   - Click **CONFIRM THREAT DETECTION** (or press `Spacebar` / click the drone in 3D).

3. **Classification & Safe Decision (1 minute):**
   - Review synthetic cues: *Multi-rotor electric harmonic (840 Hz)*, *2.4 GHz FHSS*, *4-blade micro-Doppler modulation*.
   - Select **Small UAV** and click **CONFIRM CLASSIFICATION**.
   - Select **Increase monitoring** (safe procedural response) and click **SUBMIT TRAINING DECISION**.

4. **Scoring & AAR (1 minute):**
   - Point out the transparent rule-based scoring (e.g. 92/100).
   - Click **Proceed to After-Action Review (AAR)** to show the chronological event timeline, automated feedback, and trainer debrief note input.

5. **Adaptive Progression (30 seconds):**
   - Click **View Adaptive Engine Recommendation**.
   - Highlight how the engine autonomously elevated difficulty from Level 4 to Level 5 because the trainee achieved $\ge 85$ points, introducing reduced visibility and swarm variations.
   - Click **Launch Adapted Scenario** to show the continuous loop in action!

---

## 5. Technology Stack & Alignment with Proposal
- **Frontend Core:** Modern Vanilla ES6+ & HTML5 Semantic UI
- **Styling:** Custom Enterprise CSS (Light-slate, white cards, zero bloated frameworks)
- **3D Synthetic Environment:** Three.js (WebGL) + OrbitControls
- **Analytics & Visualizations:** Chart.js
- **Audio Synthesizer:** Web Audio API (procedural radar chirps and alert tones)
- **Persistence:** LocalStorage with JSON state synchronization and one-click reset
- **Future Integration Target:** FastAPI + PostgreSQL + TimescaleDB telemetry backend
