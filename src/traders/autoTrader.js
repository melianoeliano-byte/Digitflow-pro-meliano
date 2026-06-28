/**
 * Auto Trader Module
 * Main automated trading bot with configurable parameters
 */

class AutoTrader {
  constructor() {
    this.isRunning = false;
    this.currentTrade = null;
    this.tradeHistory = [];
    this.config = {
      timeframe: 100,
      stake: 0.5,
      duration: 1,
      lookback: 100,
      edgePercent: 100,
      slAmount: 20,
      tpAmount: 50,
      predictedDigit: 5,
      martingaleEnabled: false,
      multiplier: 2,
      maxStake: 40,
      stopOnDominanceFlip: false,
      volatilityGuard: 200
    };
  }

  start(state) {
    this.isRunning = true;
    this.tradeHistory = [];
    this.monitorMarket(state);
    console.log('✅ Auto Trader Started');
  }

  stop() {
    this.isRunning = false;
    console.log('⛔ Auto Trader Stopped');
  }

  async monitorMarket(state) {
    while (this.isRunning) {
      try {
        // Analyze current market data
        const analysis = this.analyzeMarket(state);
        
        // Check for trade signals
        if (analysis.shouldTrade) {
          await this.executeTrade(state, analysis);
        }

        // Check for stop conditions
        if (this.config.stopOnDominanceFlip && analysis.dominanceFlipped) {
          this.stop();
          console.warn('⚠️ Dominance flip detected - Auto Trader halted');
        }

        await this.sleep(1000);
      } catch (error) {
        console.error('❌ Auto Trader Error:', error);
      }
    }
  }

  analyzeMarket(state) {
    if (state.ticks.length < this.config.lookback) {
      return { shouldTrade: false };
    }

    const recentTicks = state.ticks.slice(-this.config.lookback);
    const digits = recentTicks.map(t => parseInt(String(Math.floor(t.quote)).slice(-1)));
    
    // Calculate statistics
    let trend = 0;
    for (let i = 1; i < digits.length; i++) {
      if (digits[i] > digits[i - 1]) trend++;
      else trend--;
    }

    // Check volatility guard
    const volatility = Math.abs(trend) / digits.length * 100;
    if (volatility > this.config.volatilityGuard) {
      return { shouldTrade: false, volatilityTooHigh: true };
    }

    // Detect dominance flip
    const dominanceFlipped = Math.abs(trend) < 10 && digits.length > 50;

    return {
      shouldTrade: volatility <= this.config.volatilityGuard && !dominanceFlipped,
      trend,
      volatility,
      digits,
      dominanceFlipped
    };
  }

  async executeTrade(state, analysis) {
    let stake = this.config.stake;

    // Apply Martingale if enabled
    if (this.config.martingaleEnabled && this.tradeHistory.length > 0) {
      const lastTrade = this.tradeHistory[this.tradeHistory.length - 1];
      if (lastTrade.result === 'loss') {
        stake = Math.min(stake * this.config.multiplier, this.config.maxStake);
      }
    }

    const trade = {
      id: Date.now(),
      timestamp: new Date(),
      type: analysis.trend > 0 ? 'rise' : 'fall',
      stake: stake,
      digit: this.config.predictedDigit,
      duration: this.config.duration,
      sl: this.config.slAmount,
      tp: this.config.tpAmount,
      status: 'pending'
    };

    this.currentTrade = trade;
    this.tradeHistory.push(trade);
    
    // Simulate trade execution
    await this.sleep(this.config.duration * 1000);
    
    // Determine result (simplified)
    const result = Math.random() > 0.5 ? 'win' : 'loss';
    trade.result = result;
    trade.profit = result === 'win' ? stake : -stake;
    trade.status = 'closed';

    // Broadcast trade result
    const event = new CustomEvent('trade:executed', { detail: trade });
    window.dispatchEvent(event);
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getStats() {
    const wins = this.tradeHistory.filter(t => t.result === 'win').length;
    const losses = this.tradeHistory.filter(t => t.result === 'loss').length;
    return {
      totalTrades: this.tradeHistory.length,
      wins,
      losses,
      winRate: this.tradeHistory.length > 0 ? (wins / this.tradeHistory.length * 100).toFixed(2) : 0
    };
  }

  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }
}

export default AutoTrader;