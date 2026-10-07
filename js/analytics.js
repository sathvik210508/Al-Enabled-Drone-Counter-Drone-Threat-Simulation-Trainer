/**
 * DRONE-TRAIN | Performance Analytics & Unit Roster (Chart.js)
 * SIH 2026 Problem Statement SIH26247
 * Multi-session trends, accuracy breakdowns, and unit qualification roster
 */

class AnalyticsManager {
  constructor() {
    this.dashChart = null;
    this.scoreLatencyChart = null;
    this.classAccChart = null;
    this.traineeFilter = 'all';
  }

  initDashboardChart() {
    const canvas = document.getElementById('dashboardPerformanceChart');
    if (!canvas || typeof Chart === 'undefined') return;

    if (this.dashChart) {
      this.dashChart.destroy();
    }

    const ctx = canvas.getContext('2d');
    this.dashChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['TR-1045', 'TR-1046', 'TR-1047', 'TR-1048', 'TR-1049 (Current)'],
        datasets: [
          {
            label: 'Overall Score',
            data: [88, 78, 84, 91, 92],
            borderColor: '#0284c7',
            backgroundColor: 'rgba(2, 132, 199, 0.08)',
            borderWidth: 2.5,
            fill: true,
            tension: 0.35,
            pointRadius: 4,
            pointBackgroundColor: '#0284c7'
          },
          {
            label: 'Detection',
            data: [90, 80, 86, 94, 93],
            borderColor: '#10b981',
            borderWidth: 2,
            borderDash: [4, 4],
            tension: 0.35,
            pointRadius: 3
          },
          {
            label: 'Classification',
            data: [86, 75, 82, 90, 100],
            borderColor: '#6366f1',
            borderWidth: 2,
            borderDash: [2, 2],
            tension: 0.35,
            pointRadius: 3
          },
          {
            label: 'Decision',
            data: [85, 78, 84, 88, 84],
            borderColor: '#f59e0b',
            borderWidth: 2,
            tension: 0.35,
            pointRadius: 3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#0f172a',
            titleFont: { family: 'Inter', size: 12, weight: 'bold' },
            bodyFont: { family: 'Inter', size: 11 },
            padding: 10,
            cornerRadius: 6
          }
        },
        scales: {
          y: {
            min: 50,
            max: 100,
            grid: { color: '#f1f5f9' },
            ticks: {
              color: '#64748b',
              font: { family: 'JetBrains Mono', size: 10 },
              stepSize: 10
            }
          },
          x: {
            grid: { display: false },
            ticks: {
              color: '#64748b',
              font: { family: 'JetBrains Mono', size: 10 }
            }
          }
        }
      }
    });
  }

  initPerformanceCharts() {
    if (typeof Chart === 'undefined') return;

    // 1. Score & Latency Progression Chart
    const canvas1 = document.getElementById('scoreLatencyProgressionChart');
    if (canvas1) {
      if (this.scoreLatencyChart) this.scoreLatencyChart.destroy();
      const ctx1 = canvas1.getContext('2d');
      this.scoreLatencyChart = new Chart(ctx1, {
        type: 'line',
        data: {
          labels: ['Session 10', 'Session 11', 'Session 12', 'Session 13', 'Session 14'],
          datasets: [
            {
              label: 'Session Score (pts)',
              data: [85, 78, 84, 91, 92],
              borderColor: '#0284c7',
              backgroundColor: 'rgba(2, 132, 199, 0.1)',
              yAxisID: 'y',
              borderWidth: 2.5,
              tension: 0.3
            },
            {
              label: 'Detection Latency (sec)',
              data: [4.2, 4.8, 3.6, 2.9, 2.8],
              borderColor: '#ea580c',
              yAxisID: 'y1',
              borderWidth: 2,
              borderDash: [4, 4],
              tension: 0.3
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: false,
          plugins: {
            legend: { position: 'top', labels: { boxWidth: 12, font: { size: 11 } } }
          },
          scales: {
            y: {
              type: 'linear',
              position: 'left',
              min: 60,
              max: 100,
              grid: { color: '#f1f5f9' },
              ticks: { font: { family: 'JetBrains Mono', size: 10 } }
            },
            y1: {
              type: 'linear',
              position: 'right',
              min: 1.0,
              max: 6.0,
              grid: { display: false },
              ticks: {
                callback: (val) => `${val}s`,
                font: { family: 'JetBrains Mono', size: 10 }
              }
            },
            x: {
              grid: { display: false },
              ticks: { font: { family: 'JetBrains Mono', size: 10 } }
            }
          }
        }
      });
    }

    // 2. Classification Accuracy by Drone Category Bar Chart
    const canvas2 = document.getElementById('classificationAccuracyBarChart');
    if (canvas2) {
      if (this.classAccChart) this.classAccChart.destroy();
      const ctx2 = canvas2.getContext('2d');
      this.classAccChart = new Chart(ctx2, {
        type: 'bar',
        data: {
          labels: ['Small UAV (Quad/Hex)', 'Large UAV (Fixed-Wing)', 'Unknown Clutter Object', 'Swarm Group formation'],
          datasets: [
            {
              label: 'Accuracy Rate (%)',
              data: [94, 88, 76, 85],
              backgroundColor: ['#0284c7', '#4f46e5', '#94a3b8', '#ea580c'],
              borderRadius: 6
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: {
              min: 50,
              max: 100,
              grid: { color: '#f1f5f9' },
              ticks: {
                callback: (val) => `${val}%`,
                font: { family: 'JetBrains Mono', size: 10 }
              }
            },
            x: {
              grid: { display: false },
              ticks: { font: { size: 11 } }
            }
          }
        }
      });
    }
  }

  renderRecentSessionsTable() {
    const tbody = document.getElementById('recentSessionsTableBody');
    if (!tbody) return;

    const state = window.appState.get();
    const sessions = state.recentSessions;

    tbody.innerHTML = sessions.map(s => {
      let resultBadge = 'badge-success';
      if (s.result === 'Good') resultBadge = 'badge-info';
      if (s.result === 'Improving') resultBadge = 'badge-warning';

      return `
        <tr>
          <td><strong class="font-mono text-accent">${s.id}</strong></td>
          <td>${s.scenario}</td>
          <td><span class="badge-pill badge-slate">${s.environment}</span></td>
          <td><strong class="font-mono">${s.score}</strong>/100</td>
          <td><span class="badge-pill ${resultBadge}">${s.result}</span></td>
          <td>
            <button class="btn btn-outline btn-sm btn-view-aar-session" data-session-id="${s.id}">
              <span>View AAR</span>
            </button>
          </td>
        </tr>
      `;
    }).join('');

    tbody.querySelectorAll('.btn-view-aar-session').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const sid = e.currentTarget.getAttribute('data-session-id');
        this.openAARForSession(sid);
      });
    });
  }

  renderTraineesTable() {
    const tbody = document.getElementById('traineesTableBody');
    if (!tbody) return;

    const state = window.appState.get();
    let list = state.trainees;

    if (this.traineeFilter === 'top') {
      list = list.filter(t => t.avgScore >= 85);
    } else if (this.traineeFilter === 'needs') {
      list = list.filter(t => t.avgScore < 80);
    }

    tbody.innerHTML = list.map(t => {
      const trendIcon = t.trend === 'up' ? '<span class="text-emerald">&uarr;</span>' : (t.trend === 'down' ? '<span class="text-rose">&darr;</span>' : '<span class="text-amber">&rarr;</span>');
      return `
        <tr>
          <td>
            <div style="display:flex; align-items:center; gap:8px;">
              <div class="user-avatar" style="width:24px; height:24px; font-size:9px;">${t.name.split(' ').map(n=>n[0]).join('')}</div>
              <div>
                <strong>${t.name}</strong>
                <div class="text-subtle text-xs">${t.rank} • ${t.id}</div>
              </div>
            </div>
          </td>
          <td class="font-mono">${t.sessions}</td>
          <td><span class="badge-pill badge-info">Level ${t.level}</span></td>
          <td><strong class="font-mono">${t.avgScore}</strong>/100</td>
          <td class="font-mono text-emerald">${t.detectionRate}</td>
          <td class="font-mono">${t.classificationRate}</td>
          <td style="font-size:16px;">${trendIcon}</td>
          <td>
            <div style="display:flex; gap:6px;">
              <button class="btn btn-secondary btn-sm btn-trainee-profile" data-trainee-id="${t.id}">Profile</button>
              <button class="btn btn-primary btn-sm btn-assign-training" data-trainee-id="${t.id}">Train</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Attach listeners
    tbody.querySelectorAll('.btn-trainee-profile').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tid = e.currentTarget.getAttribute('data-trainee-id');
        this.openTraineeModal(tid);
      });
    });

    tbody.querySelectorAll('.btn-assign-training').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tid = e.currentTarget.getAttribute('data-trainee-id');
        const trainee = window.appState.get().trainees.find(tr => tr.id === tid);
        if (trainee) {
          window.appState.update(st => {
            st.currentUser = {
              id: trainee.id,
              name: trainee.name,
              rank: trainee.rank,
              unit: 'Air-Defence Training Wing',
              currentLevel: trainee.level,
              levelName: `Level ${trainee.level} — Intermediate`,
              avgScore: trainee.avgScore,
              completedSessionsCount: trainee.sessions
            };
            st.currentView = 'simulator';
          });
          if (window.appRouter) window.appRouter.renderCurrentView();
          if (window.showToast) window.showToast(`Switched active trainee to ${trainee.name}`, 'success');
        }
      });
    });
  }

  openAARForSession(sid) {
    const s = window.appState.get().recentSessions.find(item => item.id === sid);
    if (!s) return;

    window.appState.update(st => {
      st.activeSession.id = s.id;
      st.activeSession.scenarioName = s.scenario;
      st.activeSession.environment = s.environment;
      st.activeSession.scores.totalScore = s.score;
      st.activeSession.scores.ratingText = s.result;
      st.activeSession.detectionLatencySec = parseFloat(s.detectionTime);
      st.currentView = 'aar';
    });

    if (window.appRouter) window.appRouter.renderCurrentView();
  }

  openTraineeModal(tid) {
    const trainee = window.appState.get().trainees.find(t => t.id === tid);
    if (!trainee) return;

    const modal = document.getElementById('traineeProfileModal');
    const modalName = document.getElementById('tmodalName');
    const modalBody = document.getElementById('tmodalBody');

    if (modal && modalName && modalBody) {
      modalName.textContent = `${trainee.name} (${trainee.id})`;
      modalBody.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:16px;">
          <div style="display:flex; justify-content:space-between; align-items:center; padding:12px; background:var(--bg-secondary); border-radius:var(--radius-md);">
            <div>
              <div class="text-subtle text-xs">QUALIFICATION LEVEL</div>
              <strong style="font-size:16px;">Level ${trainee.level} — Intermediate</strong>
            </div>
            <div style="text-align:right;">
              <div class="text-subtle text-xs">AVERAGE SCORE</div>
              <strong style="font-size:20px; color:var(--accent-primary);" class="font-mono">${trainee.avgScore}/100</strong>
            </div>
          </div>
          <div class="threat-spec-grid" style="margin:0;">
            <div class="spec-cell">
              <span class="spec-label">Total Sessions:</span>
              <span class="spec-val font-mono">${trainee.sessions} completed</span>
            </div>
            <div class="spec-cell">
              <span class="spec-label">Detection Precision:</span>
              <span class="spec-val font-mono text-emerald">${trainee.detectionRate}</span>
            </div>
            <div class="spec-cell">
              <span class="spec-label">Classification Accuracy:</span>
              <span class="spec-val font-mono text-indigo">${trainee.classificationRate}</span>
            </div>
            <div class="spec-cell">
              <span class="spec-label">Last Training Run:</span>
              <span class="spec-val font-mono">${trainee.lastTraining}</span>
            </div>
          </div>
          <button class="btn btn-primary btn-block" id="btnLaunchForThisTrainee">Launch Training Session as ${trainee.name}</button>
        </div>
      `;

      modal.style.display = 'flex';

      const launchBtn = document.getElementById('btnLaunchForThisTrainee');
      if (launchBtn) {
        launchBtn.onclick = () => {
          modal.style.display = 'none';
          window.appState.update(st => {
            st.currentUser = {
              id: trainee.id,
              name: trainee.name,
              rank: trainee.rank,
              unit: 'Air-Defence Training Wing',
              currentLevel: trainee.level,
              levelName: `Level ${trainee.level} — Intermediate`,
              avgScore: trainee.avgScore,
              completedSessionsCount: trainee.sessions
            };
            st.currentView = 'simulator';
          });
          if (window.appRouter) window.appRouter.renderCurrentView();
        };
      }
    }
  }
}

window.analyticsManager = new AnalyticsManager();
