/**
 * Smart Auto Trader Module
 * Picks the strongest signal from Rise/Fall, Matches/Differs, Over/Under, and Even/Odd
 */

class SmartTrader {
  constructor() {
    this.isRunning = false;
    this.tradeHistory = [];
    this.config = {
      confirmDigit: false,
      confirmDigitScans: 3,
      stake: 0.5,
      maxConsecutiveLosses: 3
    };
    this.consecutiveLosses = 0;
  }

  start(state) {
    this.isRunning = true;
    this.consecutiveLosses = 0;
    this.monitorSignals(state);
    console.log('✅ Smart Auto Trader Started');
  }

  stop() {
    this.isRunning = false;
    console.log('⛔ Smart Auto Trader Stopped');
  }

  async monitorSignals(state) {
    while (this.isRunning) {
      try {
        if (state.ticks.length < 50) {
          await this.sleep(1000);
          continue;
        }

        const strongestSignal = this.findStrongestSignal(state);

        if (strongestSignal && strongestSignal.strength > 55) {
          if (this.config.confirmDigit) {
            await this.confirmSignal(strongestSignal, state);
          } else {
            await this.executeTrade(strongestSignal);
          }
        }

        await this.sleep(2000);
      } catch (error) {
        console.error('❌ Smart Trader Error:', error);
      }
    }
  }

  findStrongestSignal(state) {
    const digits = state.ticks.map(t => parseInt(String(Math.floor(t.quote)).slice(-1)));
    const analysis = this.analyzePatterns(digits);

    const signals = [
      {
        type: 'rise',
        strength: analysis.riseRate,
        direction: 'rise'
      },
      {
        type: 'fall',
        strength: analysis.fallRate,
        direction: 'fall'
      },
      {
        type: 'matches',
        strength: analysis.matchRate,
        direction: 'matches'
      },
      {
        type: 'differs',
        strength: analysis.differRate,
        direction: 'differs'
      },
      {
        type: 'even',
        strength: analysis.evenRate,
        direction: 'even'
      },
      {
        type: 'odd',
        strength: analysis.oddRate,
        direction: 'odd'
      },
      {
        type: 'over',
        strength: analysis.overRate,
        direction: 'over'
      },
      {
        type: 'under',
        strength: analysis.underRate,
        direction: 'under'
      }
    ];

    return signals.reduce((strongest, signal) => 
      signal.strength > strongest.strength ? signal : strongest
    );
  }

  analyzePatterns(digits) {
    let rises = 0, falls = 0, matches = 0, differs = 0, even = 0, odd = 0, over = 0, under = 0;

    // Rise/Fall
    for (let i = 1; i < digits.length; i++) {
      if (digits[i] > digits[i - 1]) rises++;
      else if (digits[i] < digits[i - 1]) falls++;
    }

    // Matches/Differs
    for (let i = 1; i < digits.length; i++) {
      if (digits[i] === digits[i - 1]) matches++;
      else differs++;
    }

    // Even/Odd
    digits.forEach(d => {
      d % 2 === 0 ? even++ : odd++;
    });

    // Over/Under
    digits.forEach(d => {
      d > 5 ? over++ : under++;
    });

    const total = digits.length;

    return {
      riseRate: (rises / (rises + falls || 1) * 100).toFixed(2),
      fallRate: (falls / (rises + falls || 1) * 100).toFixed(2),
      matchRate: (matches / (matches + differs || 1) * 100).toFixed(2),
      differRate: (differs / (matches + differs || 1) * 100).toFixed(2),
      evenRate: (even / total * 100).toFixed(2),
      oddRate: (odd / total * 100).toFixed(2),
      overRate: (over / total * 100).toFixed(2),
      underRate: (under / total * 100).toFixed(2)
    };
  }

  async confirmSignal(signal, state) {
    let confirmCount = 0;
    const confirmThreshold = this.config.confirmDigitScans;

    for (let i = 0; i < confirmThreshold; i++) {
      const recentSignal = this.findStrongestSignal(state);
      if (recentSignal.type === signal.type) {
        confirmCount++;
      }
      await this.sleep(500);
    }

    if (confirmCount >= confirmThreshold * 0.7) {
      await this.executeTrade(signal);
    }
  }

  async executeTrade(signal) {
    const trade = {
      id: Date.now(),
      timestamp: new Date(),
      type: signal.type,
      direction: signal.direction,
      strength: signal.strength,
      stake: this.config.stake,
      status: 'executed'
    };

    this.tradeHistory.push(trade);

    // Simulate result
    await this.sleep(1000);
    const result = Math.random() > 0.5 ? 'win' : 'loss';
    trade.result = result;
    trade.profit = result === 'win' ? this.config.stake : -this.config.stake;

    if (result === 'loss') {
      this.consecutiveLosses++;
      if (this.consecutiveLosses >= this.config.maxConsecutiveLosses) {
        this.stop();
        console.warn('⚠️ Max consecutive losses reached - Smart Trader halted');
      }
    } else {
      this.consecutiveLosses = 0;
    }

    const event = new CustomEvent('smarttrade:executed', { detail: trade });
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

export default SmartTrader;