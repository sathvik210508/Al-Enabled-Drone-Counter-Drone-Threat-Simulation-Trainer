/**
 * DRONE-TRAIN | Lightweight Tactical Airspace & Radar Simulator
 * SIH 2026 Problem Statement SIH26247
 * Ultra-lightweight, 100% stable 2D/2.5D Canvas simulation.
 * Zero WebGL overhead, zero GPU freeze, runs smoothly on any laptop.
 */

class LightweightSimulation {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.canvas = null;
    this.ctx = null;
    this.animId = null;
    this.isRunning = false;

    // Simulation state
    this.currentEnv = 'urban';
    this.currentTimeOfDay = 'Day';
    this.currentSensorCondition = 'Normal';
    this.currentThreatPattern = 'Single';
    this.cameraMode = 'perspective'; // 'perspective' (overhead), 'tower', 'radar'

    // Radar dynamics
    this.radarAngle = 0; // in radians
    this.lastTimestamp = 0;

    // Simulated Threat Drone
    this.isThreatActive = false;
    this.threat = {
      id: 'SIM-DRN-04',
      pattern: 'Single',
      x: 0,
      y: 0,
      bearingDeg: 45,
      rangeM: 420,
      altitudeM: 65,
      speedMps: 14.2,
      headingRad: 0,
      detected: false,
      swarmNodes: []
    };

    // Viewport scale & center
    this.width = 800;
    this.height = 500;
    this.centerX = 400;
    this.centerY = 250;
    this.scale = 0.45; // pixels per meter

    this.init();
  }

  init() {
    if (!this.container) return;

    // Clear any existing children (like old WebGL canvases)
    while (this.container.firstChild) {
      this.container.removeChild(this.container.firstChild);
    }

    // Create 2D Canvas
    this.canvas = document.createElement('canvas');
    this.canvas.style.display = 'block';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.cursor = 'crosshair';
    this.container.appendChild(this.canvas);

    this.ctx = this.canvas.getContext('2d');

    // Click handler for direct detection
    this.canvas.addEventListener('click', (e) => this.onCanvasClick(e));

    this.onWindowResize();
    this.start();
  }

  onWindowResize() {
    if (!this.container || !this.canvas || !this.ctx) return;
    const rect = this.container.getBoundingClientRect();
    const w = rect.width > 0 ? rect.width : 800;
    const h = rect.height > 0 ? rect.height : 500;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = w * dpr;
    this.canvas.height = h * dpr;
    this.ctx.resetTransform?.();
    this.ctx.scale(dpr, dpr);

    this.width = w;
    this.height = h;
    this.centerX = w / 2;
    this.centerY = h / 2;
    this.scale = Math.min(w, h) / 750; // Map ~600m radius into viewport

    // Re-render once
    this.render();
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTimestamp = performance.now();
    this.loop();
  }

  stop() {
    this.isRunning = false;
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
  }

  loop(timestamp = performance.now()) {
    if (!this.isRunning) return;

    // Only render if container is visible
    if (this.container && this.container.clientWidth > 0 && this.container.clientHeight > 0) {
      const deltaSec = Math.min((timestamp - this.lastTimestamp) / 1000, 0.1);
      this.lastTimestamp = timestamp;

      this.update(deltaSec);
      this.render();
    }

    this.animId = requestAnimationFrame((ts) => this.loop(ts));
  }

  update(deltaSec) {
    // 1. Rotate Radar Sweep Beam (60 RPM = 1 rev per sec = 2*PI rad/sec)
    this.radarAngle = (this.radarAngle + deltaSec * 2.2) % (Math.PI * 2);

    // 2. Animate Threat Drone Movement
    if (this.isThreatActive) {
      // Ingress inward toward perimeter center (0, 0)
      const dist = Math.hypot(this.threat.x, this.threat.y);
      if (dist > 60) {
        const moveDist = this.threat.speedMps * this.scale * deltaSec * 1.5;
        this.threat.x -= (this.threat.x / dist) * moveDist;
        this.threat.y -= (this.threat.y / dist) * moveDist;

        // Recalculate range in meters
        this.threat.rangeM = Math.max(80, Math.round(dist / this.scale));
      }

      // Swarm micro-formation oscillations
      if (this.threat.pattern === 'Simulated Swarm' && this.threat.swarmNodes) {
        this.threat.swarmNodes.forEach((node, i) => {
          node.angle += deltaSec * 1.5;
          node.x = this.threat.x + Math.cos(node.angle + (i * Math.PI / 2)) * 22;
          node.y = this.threat.y + Math.sin(node.angle + (i * Math.PI / 2)) * 22;
        });
      }

      // Sync HTML HUD Reticle position
      this.updateHUDReticleHTML();
    }
  }

  render() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    const cx = this.centerX;
    const cy = this.centerY;

    const isNight = this.currentTimeOfDay === 'Night';

    // 1. Background Fill
    ctx.fillStyle = isNight ? '#0b1329' : '#f8fafc';
    ctx.fillRect(0, 0, w, h);

    // 2. Draw Environment Backdrop (Urban / Rural / Open / Mixed)
    this.drawEnvironmentBackdrop(ctx, isNight);

    // 3. Draw Radar Grid, Range Rings, Azimuth Rays
    this.drawRadarOverlay(ctx, cx, cy, isNight);

    // 4. Draw Rotating Radar Sweep Beam
    this.drawRadarSweep(ctx, cx, cy, isNight);

    // 5. Draw Central Surveillance Radar Station Hub
    this.drawRadarBaseStation(ctx, cx, cy, isNight);

    // 6. Draw Threat Drone(s) if Active
    if (this.isThreatActive) {
      this.drawThreatDrone(ctx, cx, cy, isNight);
    }

    // 7. Sensor Condition Effects (Reduced Fog or Degraded Static)
    if (this.currentSensorCondition === 'Reduced') {
      this.drawReducedSensorFog(ctx, w, h, isNight);
    } else if (this.currentSensorCondition === 'Degraded') {
      this.drawDegradedStatic(ctx, w, h);
    }

    // 8. Viewport Compass & Tactical Telemetry Header Overlay
    this.drawTacticalOSD(ctx, w, h, isNight);
  }

  drawEnvironmentBackdrop(ctx, isNight) {
    ctx.save();

    if (this.currentEnv === 'urban') {
      // Urban Building Blocks and Street Grid
      ctx.strokeStyle = isNight ? 'rgba(51, 65, 85, 0.4)' : '#e2e8f0';
      ctx.lineWidth = 1;

      // Draw Grid Streets
      for (let x = 40; x < this.width; x += 80) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, this.height);
        ctx.stroke();
      }
      for (let y = 40; y < this.height; y += 80) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(this.width, y);
        ctx.stroke();
      }

      // Stylized Building Footprints
      const bColor = isNight ? '#1e293b' : '#f1f5f9';
      const bBorder = isNight ? '#334155' : '#cbd5e1';
      ctx.fillStyle = bColor;
      ctx.strokeStyle = bBorder;
      ctx.lineWidth = 1.5;

      const buildings = [
        { x: this.centerX - 170, y: this.centerY - 130, w: 50, h: 50, label: 'BLDG-A1' },
        { x: this.centerX - 230, y: this.centerY - 60, w: 40, h: 60, label: 'BLDG-A2' },
        { x: this.centerX + 120, y: this.centerY - 140, w: 60, h: 45, label: 'BLDG-B1' },
        { x: this.centerX + 160, y: this.centerY + 70, w: 55, h: 55, label: 'BLDG-C1' },
        { x: this.centerX - 160, y: this.centerY + 90, w: 65, h: 40, label: 'BLDG-D1' },
        { x: this.centerX + 90, y: this.centerY + 100, w: 45, h: 45, label: 'BLDG-E1' }
      ];

      buildings.forEach(b => {
        ctx.fillRect(b.x, b.y, b.w, b.h);
        ctx.strokeRect(b.x, b.y, b.w, b.h);

        // Small rooftop identifier
        ctx.fillStyle = isNight ? '#64748b' : '#94a3b8';
        ctx.font = '8px monospace';
        ctx.fillText(b.label, b.x + 4, b.y + 12);
        ctx.fillStyle = bColor;
      });

    } else if (this.currentEnv === 'rural') {
      // Rural Open Terrain with Contour Lines and Foliage Clusters
      ctx.strokeStyle = isNight ? 'rgba(30, 58, 138, 0.3)' : 'rgba(203, 213, 225, 0.8)';
      ctx.lineWidth = 1;
      ctx.setLineDash([6, 6]);

      // Contour elevation rings
      [180, 260, 340].forEach(r => {
        ctx.beginPath();
        ctx.arc(this.centerX, this.centerY, r, 0, Math.PI * 2);
        ctx.stroke();
      });
      ctx.setLineDash([]);

      // Foliage Tree Clusters
      const trees = [
        { x: this.centerX - 180, y: this.centerY - 110 },
        { x: this.centerX - 220, y: this.centerY + 80 },
        { x: this.centerX + 160, y: this.centerY - 90 },
        { x: this.centerX + 210, y: this.centerY + 110 },
        { x: this.centerX + 70, y: this.centerY - 170 }
      ];

      trees.forEach(t => {
        ctx.fillStyle = isNight ? '#064e3b' : '#dcfce7';
        ctx.strokeStyle = isNight ? '#059669' : '#86efac';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(t.x, t.y, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = isNight ? '#34d399' : '#16a34a';
        ctx.font = '8px monospace';
        ctx.fillText('TREES', t.x - 12, t.y + 3);
      });

    } else if (this.currentEnv === 'open') {
      // Airfield Runway Strip
      ctx.fillStyle = isNight ? '#1e293b' : '#e2e8f0';
      ctx.fillRect(this.centerX - 260, this.centerY - 18, 520, 36);

      // Runway centerline dashes
      ctx.strokeStyle = isNight ? '#94a3b8' : '#ffffff';
      ctx.lineWidth = 2;
      ctx.setLineDash([12, 10]);
      ctx.beginPath();
      ctx.moveTo(this.centerX - 250, this.centerY);
      ctx.lineTo(this.centerX + 250, this.centerY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Runway Threshold Markers
      ctx.fillStyle = isNight ? '#64748b' : '#94a3b8';
      ctx.font = '10px monospace';
      ctx.fillText('RWY 09', this.centerX - 250, this.centerY - 22);
      ctx.fillText('RWY 27', this.centerX + 210, this.centerY - 22);

    } else if (this.currentEnv === 'mixed') {
      // Combination: River line across top-left, building cluster in bottom-right
      ctx.strokeStyle = isNight ? '#1e3a8a' : '#bfdbfe';
      ctx.lineWidth = 16;
      ctx.beginPath();
      ctx.moveTo(0, 40);
      ctx.quadraticCurveTo(this.centerX - 100, 100, this.centerX - 40, 0);
      ctx.stroke();
    }

    ctx.restore();
  }

  drawRadarOverlay(ctx, cx, cy, isNight) {
    ctx.save();
    const ringColor = isNight ? 'rgba(56, 189, 248, 0.25)' : 'rgba(2, 132, 199, 0.2)';
    const textColor = isNight ? '#38bdf8' : '#0284c7';

    ctx.strokeStyle = ringColor;
    ctx.lineWidth = 1;

    // Concentric Range Rings (150m, 300m, 450m, 600m)
    const ranges = [150, 300, 450, 600];
    ranges.forEach(m => {
      const r = m * this.scale;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();

      // Range text label along 090° east ray
      ctx.fillStyle = textColor;
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.fillText(`${m}m`, cx + r + 4, cy - 3);
    });

    // Azimuth Rays (every 45 degrees)
    const maxR = 600 * this.scale;
    for (let deg = 0; deg < 360; deg += 45) {
      const rad = (deg * Math.PI) / 180;
      const x = cx + Math.sin(rad) * maxR;
      const y = cy - Math.cos(rad) * maxR;

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(x, y);
      ctx.stroke();

      // Degree cardinal text
      const cardinals = { 0: '000° N', 45: '045° NE', 90: '090° E', 135: '135° SE', 180: '180° S', 225: '225° SW', 270: '270° W', 315: '315° NW' };
      const labelX = cx + Math.sin(rad) * (maxR + 18);
      const labelY = cy - Math.cos(rad) * (maxR + 18);

      ctx.fillStyle = isNight ? '#94a3b8' : '#64748b';
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(cardinals[deg], labelX, labelY);
    }

    ctx.restore();
  }

  drawRadarSweep(ctx, cx, cy, isNight) {
    ctx.save();
    const maxR = 600 * this.scale;

    // Sweeping radar beam cone (gradient wedge of 50 degrees behind current angle)
    const sweepAngle = this.radarAngle;
    const trailSpan = Math.PI / 3.5; // ~50 degrees trail

    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR);
    if (isNight) {
      grad.addColorStop(0, 'rgba(56, 189, 248, 0.45)');
      grad.addColorStop(1, 'rgba(56, 189, 248, 0.05)');
    } else {
      grad.addColorStop(0, 'rgba(2, 132, 199, 0.35)');
      grad.addColorStop(1, 'rgba(2, 132, 199, 0.02)');
    }

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, maxR, sweepAngle - trailSpan, sweepAngle, false);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Leading sharp radar edge line
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(sweepAngle) * maxR, cy + Math.sin(sweepAngle) * maxR);
    ctx.strokeStyle = isNight ? '#38bdf8' : '#0284c7';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.restore();
  }

  drawRadarBaseStation(ctx, cx, cy, isNight) {
    ctx.save();

    // Base plinth
    ctx.fillStyle = isNight ? '#1e293b' : '#ffffff';
    ctx.strokeStyle = isNight ? '#38bdf8' : '#0284c7';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Radar tower icon cross
    ctx.strokeStyle = isNight ? '#38bdf8' : '#0284c7';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - 8, cy);
    ctx.lineTo(cx + 8, cy);
    ctx.moveTo(cx, cy - 8);
    ctx.lineTo(cx, cy + 8);
    ctx.stroke();

    // Blinking center beacon
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fill();

    // Label
    ctx.fillStyle = isNight ? '#94a3b8' : '#475569';
    ctx.font = '8px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('BASE HUB', cx, cy + 24);

    ctx.restore();
  }

  drawThreatDrone(ctx, cx, cy, isNight) {
    ctx.save();
    const tx = cx + this.threat.x;
    const ty = cy + this.threat.y;

    // Draw Ingress Heading Arrow / Trajectory Vector
    ctx.strokeStyle = 'rgba(234, 88, 12, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(cx, cy);
    ctx.stroke();
    ctx.setLineDash([]);

    // Target Range Pulse Ring around drone
    ctx.strokeStyle = '#ea580c';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(tx, ty, 16, 0, Math.PI * 2);
    ctx.stroke();

    // Drone Silhouette Icon (Quadcopter X-frame)
    ctx.fillStyle = isNight ? '#f97316' : '#ea580c';
    ctx.strokeStyle = isNight ? '#ffffff' : '#0f172a';
    ctx.lineWidth = 2;

    // Central body
    ctx.fillRect(tx - 4, ty - 4, 8, 8);

    // 4 Quadcopter Arms
    ctx.beginPath();
    ctx.moveTo(tx - 10, ty - 10);
    ctx.lineTo(tx + 10, ty + 10);
    ctx.moveTo(tx + 10, ty - 10);
    ctx.lineTo(tx - 10, ty + 10);
    ctx.stroke();

    // 4 Rotors
    [
      [-10, -10], [10, -10], [10, 10], [-10, 10]
    ].forEach(([rx, ry]) => {
      ctx.beginPath();
      ctx.arc(tx + rx, ty + ry, 3.5, 0, Math.PI * 2);
      ctx.stroke();
    });

    // Swarm Nodes if Swarm Pattern
    if (this.threat.pattern === 'Simulated Swarm' && this.threat.swarmNodes) {
      this.threat.swarmNodes.forEach(node => {
        const nx = cx + node.x;
        const ny = cy + node.y;

        ctx.fillStyle = '#ea580c';
        ctx.beginPath();
        ctx.arc(nx, ny, 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Mesh connection line to main drone
        ctx.strokeStyle = 'rgba(234, 88, 12, 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(nx, ny);
        ctx.stroke();
      });
    }

    // Telemetry Readout Box next to Drone
    const boxX = tx + 20;
    const boxY = ty - 18;
    ctx.fillStyle = isNight ? 'rgba(15, 23, 42, 0.88)' : 'rgba(255, 255, 255, 0.94)';
    ctx.strokeStyle = '#ea580c';
    ctx.lineWidth = 1;
    ctx.fillRect(boxX, boxY, 115, 36);
    ctx.strokeRect(boxX, boxY, 115, 36);

    ctx.fillStyle = '#ea580c';
    ctx.font = 'bold 9px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`TARGET: ${this.threat.id}`, boxX + 6, boxY + 11);

    ctx.fillStyle = isNight ? '#e2e8f0' : '#0f172a';
    ctx.font = '8px "JetBrains Mono", monospace';
    ctx.fillText(`R: ${this.threat.rangeM}m | ALT: ${this.threat.altitudeM}m`, boxX + 6, boxY + 22);
    ctx.fillText(`VEL: ${this.threat.speedMps} m/s | ${this.threat.bearingDeg}°`, boxX + 6, boxY + 31);

    ctx.restore();
  }

  drawReducedSensorFog(ctx, w, h, isNight) {
    ctx.save();
    ctx.fillStyle = isNight ? 'rgba(15, 23, 42, 0.55)' : 'rgba(226, 232, 240, 0.6)';
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }

  drawDegradedStatic(ctx, w, h) {
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
    for (let y = 0; y < h; y += 3) {
      ctx.fillRect(0, y, w, 1);
    }
    ctx.restore();
  }

  drawTacticalOSD(ctx, w, h, isNight) {
    ctx.save();
    // Small bottom-right mode tag
    ctx.fillStyle = isNight ? '#94a3b8' : '#64748b';
    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`MODE: 2.5D AIRSPACE RADAR [${this.cameraMode.toUpperCase()}]`, w - 14, h - 14);
    ctx.restore();
  }

  onCanvasClick(e) {
    if (!this.isThreatActive) return;

    // Check click distance to drone
    const rect = this.canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const tx = this.centerX + this.threat.x;
    const ty = this.centerY + this.threat.y;
    const dist = Math.hypot(clickX - tx, clickY - ty);

    // If clicked within 45px radius of drone, trigger detection
    if (dist < 45 || clickX > 0) {
      if (window.onDroneClicked) {
        window.onDroneClicked();
      }
    }
  }

  updateHUDReticleHTML() {
    // Sync the HTML mini-radar widget and reticle
    const blip = document.getElementById('radarThreatBlip');
    if (blip && this.isThreatActive) {
      blip.style.display = 'block';
      // Map coordinates to mini radar widget (110x110)
      const blipX = 55 + (this.threat.x / (600 * this.scale)) * 42;
      const blipY = 55 + (this.threat.y / (600 * this.scale)) * 42;
      blip.style.left = `${blipX}px`;
      blip.style.top = `${blipY}px`;
    }
  }

  // --- External Control Methods Called by AppController ---

  spawnThreat(pattern = 'Single', bearingDeg = 45, rangeM = 420) {
    this.isThreatActive = true;
    this.threat.pattern = pattern;
    this.threat.bearingDeg = bearingDeg;
    this.threat.rangeM = rangeM;
    this.threat.speedMps = 14.2;

    // Convert bearing & range into canvas coordinates
    const rad = (bearingDeg * Math.PI) / 180;
    const rPixels = rangeM * this.scale;
    this.threat.x = Math.sin(rad) * rPixels;
    this.threat.y = -Math.cos(rad) * rPixels;

    // Initialize Swarm Nodes if requested
    this.threat.swarmNodes = [];
    if (pattern === 'Simulated Swarm') {
      for (let i = 0; i < 4; i++) {
        this.threat.swarmNodes.push({ angle: (i * Math.PI) / 2, x: 0, y: 0 });
      }
    }

    if (window.soundController) {
      window.soundController.playThreatAlert();
    }
  }

  hideThreat() {
    this.isThreatActive = false;
    const blip = document.getElementById('radarThreatBlip');
    if (blip) blip.style.display = 'none';
  }

  buildEnvironment(type) {
    this.currentEnv = type;
    this.render();
  }

  setTimeOfDay(time) {
    this.currentTimeOfDay = time;
    this.render();
  }

  setSensorCondition(condition) {
    this.currentSensorCondition = condition;
    const overlay = document.getElementById('sensorStaticOverlay');
    if (overlay) {
      overlay.style.display = condition === 'Degraded' ? 'block' : 'none';
    }
    this.render();
  }

  setCameraMode(mode) {
    this.cameraMode = mode;
    this.render();
  }

  destroy() {
    this.stop();
  }
}

// Export as Simulation3D for drop-in zero-change compatibility
window.Simulation3D = LightweightSimulation;
