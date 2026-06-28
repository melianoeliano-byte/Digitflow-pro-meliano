/**
 * Dashboard Module
 * Main UI component for Digitflow Pro Dashboard
 */

class Dashboard {
  constructor() {
    this.container = null;
    this.state = {};
    this.charts = {};
    this.updateInterval = null;
  }

  render(container) {
    this.container = container;
    this.container.innerHTML = this.getHTML();
    this.attachEventListeners();
    this.startUpdates();
  }

  getHTML() {
    return `
      <div class="dashboard">
        <!-- Header -->
        <header class="dashboard-header">
          <div class="header-left">
            <div class="logo">
              <span class="logo-icon">⚡</span>
              <h1>Digitflow Pro</h1>
            </div>
          </div>
          <div class="header-right">
            <div class="account-info">
              <select id="accountSelect" class="account-select">
                <option value="DEMO">DEMO0000</option>
                <option value="REAL">REAL Account</option>
              </select>
              <div class="balance">Balance: <span id="balanceAmount">$1000.00</span></div>
            </div>
            <button id="settingsBtn" class="btn-icon">⚙️</button>
          </div>
        </header>

        <!-- Main Controls -->
        <section class="main-controls">
          <div class="control-group">
            <button id="powerBtn" class="btn-power">⏻</button>
            <select id="volatilitySelect" class="volatility-select">
              <option>Volatility 75 Index</option>
              <option>Volatility 10 Index</option>
              <option>Volatility 25 Index</option>
              <option>Volatility 50 Index</option>
              <option>Volatility 100 Index</option>
            </select>
            <div class="balance-display">$1000.00</div>
            <button id="refreshBtn" class="btn-refresh">↻</button>
          </div>

          <div class="trader-controls">
            <div class="trader-status">Auto Trader <span id="traderStatus" class="status">Idle · Idle</span></div>
            <button id="startBtn" class="btn btn-start">▶ Start</button>
            <button id="stopBtn" class="btn btn-stop">⏹ Stop</button>
          </div>
        </section>

        <!-- Tabs Navigation -->
        <nav class="tabs-nav">
          <button class="tab-btn active" data-tab="analysis">Analysis</button>
          <button class="tab-btn" data-tab="signals">Signals</button>
          <button class="tab-btn" data-tab="trades">Trades</button>
          <button class="tab-btn" data-tab="scanner">Scanner</button>
          <button class="tab-btn" data-tab="settings">Settings</button>
        </nav>

        <!-- Analysis Tab -->
        <div id="analysisTab" class="tab-content active">
          <div class="analysis-container">
            <!-- Volatility Selection -->
            <div class="volatility-selector">
              <select id="volatilityDropdown" class="dropdown">
                <option selected>Volatility 75 Index</option>
              </select>
              <div class="volatility-info">
                <span>Volatility 75 Index</span>
                <span id="tickCount">14 ticks</span>
              </div>
            </div>

            <!-- Digit Circles Analysis -->
            <div class="digit-analysis">
              <div class="digits-grid">
                ${Array.from({ length: 10 }, (_, i) => `
                  <div class="digit-circle" data-digit="${i}">
                    <span class="digit-number">${i}</span>
                    <span class="digit-percent">8%</span>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Pattern Analysis -->
            <div class="patterns-row">
              <div class="pattern-box pattern-matches">
                <span class="pattern-icon">≈</span>
                <span class="pattern-label">Matches 5</span>
                <span class="pattern-percent">9%</span>
              </div>
              <div class="pattern-box pattern-differs">
                <span class="pattern-icon">⚡</span>
                <span class="pattern-label">Differs 5</span>
                <span class="pattern-percent">91%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Signals Tab -->
        <div id="signalsTab" class="tab-content">
          <div class="signals-container">
            <h3>Live Trading Signals</h3>
            <div id="signalsBoard" class="signals-board">
              <p class="placeholder">Waiting for signals...</p>
            </div>
          </div>
        </div>

        <!-- Trades Tab -->
        <div id="tradesTab" class="tab-content">
          <div class="trades-container">
            <h3>Trade History</h3>
            <div class="stats-summary">
              <div class="stat">Total Trades: <span id="totalTrades">0</span></div>
              <div class="stat">Wins: <span id="totalWins">0</span></div>
              <div class="stat">Losses: <span id="totalLosses">0</span></div>
              <div class="stat">Win Rate: <span id="winRate">0%</span></div>
              <div class="stat">Profit: <span id="totalProfit">$0.00</span></div>
            </div>
            <table class="trades-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Type</th>
                  <th>Stake</th>
                  <th>Result</th>
                  <th>Profit/Loss</th>
                </tr>
              </thead>
              <tbody id="tradesTableBody">
                <tr><td colspan="5" class="placeholder">No trades yet</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Scanner Tab -->
        <div id="scannerTab" class="tab-content">
          <div class="scanner-container">
            <h3>Differ Scanner - All Volatilities</h3>
            <div class="scanner-controls">
              <button id="startScannerBtn" class="btn btn-start">▶ Start Scanner</button>
              <button id="stopScannerBtn" class="btn btn-stop">⏹ Stop Scanner</button>
            </div>
            <div class="scanner-results" id="scannerResults">
              <div class="scan-item">
                <span class="volatility-name">Volatility 75 Index</span>
                <span class="rarest-digit">Rarest: 3 (2%)</span>
                <span class="differ-rate">Differs: 91%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Settings Tab -->
        <div id="settingsTab" class="tab-content">
          <div class="settings-container">
            <h3>Trading Configuration</h3>
            <form id="settingsForm" class="settings-form">
              <fieldset>
                <legend>Time Frame Settings</legend>
                <div class="form-row">
                  <label>Time frame (ticks):</label>
                  <input type="number" id="timeframe" value="100" min="10">
                </div>
              </fieldset>

              <fieldset>
                <legend>Stake & Contract Settings</legend>
                <div class="form-row">
                  <label>Stake ($):</label>
                  <input type="number" id="stake" value="0.5" step="0.1" min="0.1">
                </div>
                <div class="form-row">
                  <label>Duration (ticks):</label>
                  <input type="number" id="duration" value="1" min="1">
                </div>
              </fieldset>

              <fieldset>
                <legend>Risk Management</legend>
                <div class="form-row">
                  <label>Lookback:</label>
                  <input type="number" id="lookback" value="100" min="10">
                </div>
                <div class="form-row">
                  <label>Edge %:</label>
                  <input type="number" id="edgePercent" value="100" min="0">
                </div>
                <div class="form-row">
                  <label>SL ($):</label>
                  <input type="number" id="slAmount" value="20" step="1">
                </div>
                <div class="form-row">
                  <label>TP ($):</label>
                  <input type="number" id="tpAmount" value="50" step="1">
                </div>
              </fieldset>

              <fieldset>
                <legend>Martingale Settings</legend>
                <div class="form-row">
                  <label>
                    <input type="checkbox" id="martingaleEnabled">
                    Enable Martingale
                  </label>
                </div>
                <div class="form-row">
                  <label>Multiplier:</label>
                  <input type="number" id="multiplier" value="2" step="0.5" min="1">
                </div>
                <div class="form-row">
                  <label>Max Stake:</label>
                  <input type="number" id="maxStake" value="40" step="1">
                </div>
              </fieldset>

              <fieldset>
                <legend>Advanced Settings</legend>
                <div class="form-row">
                  <label>
                    <input type="checkbox" id="stopOnDominanceFlip">
                    Stop on Dominance Flip
                  </label>
                </div>
                <div class="form-row">
                  <label>Volatility Guard %:</label>
                  <input type="number" id="volatilityGuard" value="200" min="0">
                </div>
              </fieldset>

              <button type="submit" class="btn btn-primary">Save Settings</button>
            </form>
          </div>
        </div>
      </div>
    `;
  }

  attachEventListeners() {
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
    });

    // Main controls
    document.getElementById('startBtn')?.addEventListener('click', () => this.onStart());
    document.getElementById('stopBtn')?.addEventListener('click', () => this.onStop());
    document.getElementById('settingsBtn')?.addEventListener('click', () => this.switchTab('settings'));

    // Settings form
    document.getElementById('settingsForm')?.addEventListener('submit', (e) => this.onSettingsSave(e));

    // Scanner controls
    document.getElementById('startScannerBtn')?.addEventListener('click', () => this.onStartScanner());
    document.getElementById('stopScannerBtn')?.addEventListener('click', () => this.onStopScanner());
  }

  switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(`${tabName}Tab`)?.classList.add('active');
    document.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');
  }

  onStart() {
    const event = new CustomEvent('dashboard:start');
    window.dispatchEvent(event);
    this.updateStatus('Trading Active');
  }

  onStop() {
    const event = new CustomEvent('dashboard:stop');
    window.dispatchEvent(event);
    this.updateStatus('Trading Stopped');
  }

  onStartScanner() {
    const event = new CustomEvent('dashboard:startScanner');
    window.dispatchEvent(event);
  }

  onStopScanner() {
    const event = new CustomEvent('dashboard:stopScanner');
    window.dispatchEvent(event);
  }

  onSettingsSave(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const settings = Object.fromEntries(formData);
    const event = new CustomEvent('dashboard:settingsSave', { detail: settings });
    window.dispatchEvent(event);
  }

  updateStatus(status) {
    const statusEl = document.getElementById('traderStatus');
    if (statusEl) statusEl.textContent = status;
  }

  updateBalance(amount) {
    document.getElementById('balanceAmount')&&(document.getElementById('balanceAmount').textContent = `$${amount.toFixed(2)}`);
  }

  displaySignal(signal) {
    const board = document.getElementById('signalsBoard');
    if (board) {
      const signalEl = document.createElement('div');
      signalEl.className = 'signal-item';
      signalEl.innerHTML = `
        <span class="signal-time">${new Date().toLocaleTimeString()}</span>
        <span class="signal-type">${signal.type}</span>
        <span class="signal-strength">${signal.strength}%</span>
      `;
      board.insertBefore(signalEl, board.firstChild);
    }
  }

  startUpdates() {
    this.updateInterval = setInterval(() => {
      // Update live data
    }, 1000);
  }
}

export default Dashboard;