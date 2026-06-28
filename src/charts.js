/**
 * Charts Module
 * Manages Chart.js visualizations for trading data
 */

import Chart from 'chart.js/auto';

class Charts {
  constructor() {
    this.charts = new Map();
  }

  createDigitFrequencyChart(container, frequency) {
    const digits = Array.from({ length: 10 }, (_, i) => i);
    const counts = digits.map(d => frequency[d]?.count || 0);
    const percentages = digits.map(d => frequency[d]?.percentage || 0);

    if (this.charts.has('digitFrequency')) {
      this.charts.get('digitFrequency').destroy();
    }

    const ctx = container.getContext('2d');
    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: digits,
        datasets: [{
          label: 'Digit Frequency (%)',
          data: percentages,
          backgroundColor: 'rgba(75, 192, 192, 0.7)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: { display: true, text: 'Last Digit Frequency Analysis' }
        },
        scales: {
          y: { beginAtZero: true, max: 100 }
        }
      }
    });

    this.charts.set('digitFrequency', chart);
    return chart;
  }

  createPatternChart(container, patterns) {
    if (this.charts.has('patterns')) {
      this.charts.get('patterns').destroy();
    }

    const ctx = container.getContext('2d');
    const chart = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: ['Rise', 'Fall', 'Matches', 'Differs', 'Even', 'Odd', 'Over', 'Under'],
        datasets: [{
          label: 'Win Rate (%)',
          data: [
            parseFloat(patterns.riseWinRate),
            parseFloat(patterns.fallWinRate),
            parseFloat(patterns.matchWinRate),
            parseFloat(patterns.differWinRate),
            parseFloat(patterns.evenWinRate),
            parseFloat(patterns.oddWinRate),
            parseFloat(patterns.overWinRate),
            parseFloat(patterns.underWinRate)
          ],
          borderColor: 'rgba(153, 102, 255, 1)',
          backgroundColor: 'rgba(153, 102, 255, 0.2)',
          pointBackgroundColor: 'rgba(153, 102, 255, 1)',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: { display: true, text: 'Pattern Analysis' }
        },
        scales: {
          r: { beginAtZero: true, max: 100 }
        }
      }
    });

    this.charts.set('patterns', chart);
    return chart;
  }

  createEquityChart(container, tradeHistory) {
    if (this.charts.has('equity')) {
      this.charts.get('equity').destroy();
    }

    let equity = 1000; // Starting balance
    const equityPoints = [equity];
    const labels = ['Start'];

    tradeHistory.forEach((trade, index) => {
      equity += trade.profit;
      equityPoints.push(equity);
      labels.push(`Trade ${index + 1}`);
    });

    const ctx = container.getContext('2d');
    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Account Equity',
          data: equityPoints,
          borderColor: equityPoints[equityPoints.length - 1] > 1000 ? '#00ff00' : '#ff0000',
          backgroundColor: 'rgba(75, 192, 192, 0.1)',
          tension: 0.1,
          fill: true,
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: { display: true, text: 'Account Equity Curve' }
        },
        scales: {
          y: { beginAtZero: false }
        }
      }
    });

    this.charts.set('equity', chart);
    return chart;
  }

  destroyChart(name) {
    if (this.charts.has(name)) {
      this.charts.get(name).destroy();
      this.charts.delete(name);
    }
  }

  destroyAll() {
    this.charts.forEach(chart => chart.destroy());
    this.charts.clear();
  }
}

export default Charts;