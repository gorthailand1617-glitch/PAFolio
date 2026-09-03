/**
 * PAFolio - Dynamic Chart Configuration
 * Synchronizes with Active Teacher and Academic Year
 */

let radarChartInstance = null;
let sdlChartInstance = null;

function initPACharts() {
  updateChartsForCurrentContext();
}

function updateChartsForCurrentContext() {
  const teacher = getActiveTeacher();
  const currentYearData = getActiveYearData();

  initRadarChart(teacher, currentYearData);
  initSDLChart(currentYearData);
}

function initRadarChart(teacher, yearData) {
  const ctx = document.getElementById('competencyRadarChart');
  if (!ctx) return;

  if (radarChartInstance) {
    radarChartInstance.destroy();
  }

  const scores = yearData.scores || { domain1: 38, domain2: 19, domain3: 20, challenge: 19 };
  const d1Score = (scores.domain1 / 40) * 100;
  const d2Score = (scores.domain2 / 20) * 100;
  const d3Score = (scores.domain3 / 20) * 100;
  const chScore = (scores.challenge / 20) * 100;

  radarChartInstance = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: [
        '1. การจัดการเรียนรู้ (8 ตัวชี้วัด)',
        '2. การส่งเสริม & สนับสนุน (4 ตัวชี้วัด)',
        '3. การพัฒนาตนเอง & วิชาชีพ (3 ตัวชี้วัด)',
        '4. นวัตกรรมประเด็นท้าทาย',
        '5. การวัดและประเมินผลสมรรถนะ',
        '6. การบริหารงานและชุมชน PLC'
      ],
      datasets: [
        {
          label: `ผลการประเมินจริง (${teacher.academicStanding})`,
          data: [d1Score, d2Score, d3Score, chScore, 95, 98],
          fill: true,
          backgroundColor: 'rgba(20, 184, 166, 0.25)',
          borderColor: '#0d9488',
          pointBackgroundColor: '#0f766e',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: '#0f766e',
          borderWidth: 2.5
        },
        {
          label: 'เกณฑ์มาตรฐานขั้นต่ำ ว.PA (ก.ค.ศ.)',
          data: [80, 80, 80, 80, 80, 80],
          fill: true,
          backgroundColor: 'rgba(245, 158, 11, 0.08)',
          borderColor: 'rgba(245, 158, 11, 0.8)',
          pointBackgroundColor: '#d97706',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: '#d97706',
          borderDash: [5, 5],
          borderWidth: 2
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          angleLines: {
            color: 'rgba(148, 163, 184, 0.25)'
          },
          grid: {
            color: 'rgba(148, 163, 184, 0.2)'
          },
          pointLabels: {
            font: {
              family: 'Prompt',
              size: 11,
              weight: '500'
            },
            color: '#334155'
          },
          suggestedMin: 50,
          suggestedMax: 100,
          ticks: {
            stepSize: 10,
            backdropColor: 'transparent',
            font: {
              family: 'Sarabun',
              size: 10
            }
          }
        }
      },
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            font: {
              family: 'Prompt',
              size: 12
            },
            usePointStyle: true,
            padding: 16
          }
        }
      }
    }
  });
}

function initSDLChart(yearData) {
  const ctx = document.getElementById('sdlComparisonChart');
  if (!ctx) return;

  if (sdlChartInstance) {
    sdlChartInstance.destroy();
  }

  const challenge = yearData.challengeIssue || {};
  const comparison = challenge.sdlComparison || {
    labels: ["การกำหนดเป้าหมาย", "การวางแผน", "การสืบค้น", "การแก้ปัญหา", "การสะท้อนคิด"],
    preTest: [60, 58, 62, 55, 60],
    postTest: [88, 91, 92, 86, 90]
  };

  sdlChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: comparison.labels,
      datasets: [
        {
          label: 'ก่อนเรียน (Pre-test)',
          data: comparison.preTest,
          backgroundColor: 'rgba(148, 163, 184, 0.7)',
          borderColor: '#94a3b8',
          borderWidth: 1,
          borderRadius: 6
        },
        {
          label: 'หลังจัดการเรียนรู้ (Post-test)',
          data: comparison.postTest,
          backgroundColor: 'rgba(13, 148, 136, 0.85)',
          borderColor: '#0f766e',
          borderWidth: 1,
          borderRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: {
            font: {
              family: 'Sarabun',
              size: 11
            },
            callback: function(value) {
              return value + '%';
            }
          },
          grid: {
            color: 'rgba(241, 245, 249, 0.9)'
          }
        },
        x: {
          ticks: {
            font: {
              family: 'Prompt',
              size: 11
            }
          },
          grid: {
            display: false
          }
        }
      },
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            font: {
              family: 'Prompt',
              size: 12
            },
            usePointStyle: true,
            padding: 14
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return context.dataset.label + ': ' + context.raw + '%';
            }
          }
        }
      }
    }
  });
}
