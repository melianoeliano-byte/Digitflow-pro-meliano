/**
 * Differ Scanner Module
 * Automatically scans all volatilities for rarest digits and executes differ trades
 */

class DifferScanner {
  constructor() {
    this.isRunning = false;
    this.scanHistory = [];
    this.config = {
      scanInterval: 5000,
      minDifferWinRate: 60,
      bulkContracts: 30,
      volatilities: [
        'Volatility 10 Index',
        'Volatility 25 Index',
        'Volatility 50 Index',
        'Volatility 75 Index',
        'Volatility 100 Index',
        'Volatility 10 (1s) Index',
        'Volatility 25 (1s) Index',
        'Volatility 50 (1s) Index',
        'Volatility 75 (1s) Index',
        'Volatility 100 (1s) Index'
      ]
    };
  }

  start(state) {
    this.isRunning = true;
    this.scanAll(state);
    console.log('✅ Differ Scanner Started');
  }

  stop() {
    this.isRunning = false;
    console.log('⛔ Differ Scanner Stopped');
  }

  async scanAll(state) {
    while (this.isRunning) {
      try {
        const results = [];

        for (const volatility of this.config.volatilities) {
          const scan = this.scanVolatility(volatility, state);
          if (scan && scan.rarestDigit !== null) {
            results.push({
              volatility,
              ...scan
            });
          }
        }

        // Execute bulk differs on strongest signals
        if (results.length > 0) {
          await this.executeBulkDiffers(results);
        }

        this.scanHistory.push({
          timestamp: new Date(),
          results,
          totalScans: results.length
        });

        await this.sleep(this.config.scanInterval);
      } catch (error) {
        console.error('❌ Differ Scanner Error:', error);
      }
    }
  }

  scanVolatility(volatility, state) {
    if (state.ticks.length < 20) return null;

    const digits = state.ticks.map(t => parseInt(String(Math.floor(t.quote)).slice(-1)));
    const frequency = {};

    // Count digit occurrences
    digits.forEach(d => {
      frequency[d] = (frequency[d] || 0) + 1;
    });

    // Find rarest digit
    let rarestDigit = null;
    let minCount = Infinity;

    for (let d = 0; d <= 9; d++) {
      if ((frequency[d] || 0) < minCount) {
        minCount = frequency[d] || 0;
        rarestDigit = d;
      }
    }

    // Calculate differ win rate
    let differs = 0;
    for (let i = 1; i < digits.length; i++) {
      if (digits[i] !== digits[i - 1]) differs++;
    }
    const differWinRate = (differs / digits.length * 100).toFixed(2);

    return {
      rarestDigit,
      rarestDigitCount: minCount,
      differWinRate: parseFloat(differWinRate),
      shouldTrade: parseFloat(differWinRate) >= this.config.minDifferWinRate
    };
  }

  async executeBulkDiffers(results) {
    const strongSignals = results.filter(r => r.shouldTrade).slice(0, 3);

    for (const signal of strongSignals) {
      for (let i = 0; i < this.config.bulkContracts; i++) {
        const trade = {
          id: `bulk-${Date.now()}-${i}`,
          volatility: signal.volatility,
          type: 'differs',
          digit: signal.rarestDigit,
          timestamp: new Date(),
          stake: 1,
          contracts: 1,
          status: 'pending'
        };

        // Execute trade
        await this.sleep(100);
        trade.status = 'executed';

        // Broadcast
        const event = new CustomEvent('differ:executed', { detail: trade });
        window.dispatchEvent(event);
      }
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getHistory() {
    return this.scanHistory.slice(-10);
  }

  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }
}

export default DifferScanner;