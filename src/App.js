import { DerivAPI } from './api.js';
import Dashboard from './dashboard.js';
import AutoTrader from './traders/autoTrader.js';
import DifferScanner from './traders/differScanner.js';
import SmartTrader from './traders/smartTrader.js';
import Statistics from './statistics.js';
import Analyzer from './analyzer.js';

class App {
  constructor() {
    this.api = new DerivAPI();
    this.dashboard = new Dashboard();
    this.autoTrader = new AutoTrader();
    this.differScanner = new DifferScanner();
    this.smartTrader = new SmartTrader();
    this.statistics = new Statistics();
    this.analyzer = new Analyzer();
    this.state = {
      isRunning: false,
      selectedVolatility: 'Volatility 75 Index',
      account: 'DEMO0000',
      balance: 1000.00,
      tradeHistory: [],
      ticks: [],
      signals: [],
      sessionProfit: 0,
      sessionLoss: 0
    };
  }

  async init() {
    try {
      // Initialize API connection
      await this.api.connect();
      
      // Fetch account info
      const accountInfo = await this.api.getAccountInfo();
      this.state.account = accountInfo.account_id;
      this.state.balance = accountInfo.balance;
      
      console.log('✅ API Connected:', this.state.account);
    } catch (error) {
      console.error('❌ Initialization error:', error);
    }
  }

  async startTrading() {
    this.state.isRunning = true;
    this.autoTrader.start(this.state);
    this.differScanner.start(this.state);
    this.smartTrader.start(this.state);
    this.dashboard.updateStatus('Trading Active');
  }

  async stopTrading() {
    this.state.isRunning = false;
    this.autoTrader.stop();
    this.differScanner.stop();
    this.smartTrader.stop();
    this.dashboard.updateStatus('Trading Stopped');
  }

  updateTicks(newTicks) {
    this.state.ticks = [...this.state.ticks, ...newTicks].slice(-100);
    this.analyzer.analyzeTicks(this.state.ticks);
    this.statistics.update(this.state.ticks);
  }

  addSignal(signal) {
    this.state.signals.push(signal);
    this.dashboard.displaySignal(signal);
  }

  recordTrade(trade) {
    this.state.tradeHistory.push(trade);
    if (trade.profit > 0) {
      this.state.sessionProfit += trade.profit;
    } else {
      this.state.sessionLoss += Math.abs(trade.profit);
    }
    this.dashboard.updateBalance(this.state.balance);
  }

  applySettings(settings) {
    Object.assign(this.state, settings);
  }

  render(container) {
    this.dashboard.render(container);
  }
}

export default App;