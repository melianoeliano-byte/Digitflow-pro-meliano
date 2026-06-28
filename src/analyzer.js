/**
 * Analyzer Module
 * Performs advanced digit analysis on market ticks
 */

class Analyzer {
  constructor() {
    this.digitHistory = {};
    this.patterns = {};
    this.volatilities = new Map();
  }

  analyzeTicks(ticks) {
    if (ticks.length === 0) return;

    // Extract last digits
    const lastDigits = ticks.map(t => parseInt(String(Math.floor(t.quote)).slice(-1)));
    
    // Update digit frequency
    this.updateDigitFrequency(lastDigits);
    
    // Analyze patterns
    this.analyzePatterns(lastDigits);
    
    // Calculate statistics
    return this.getAnalysis();
  }

  updateDigitFrequency(digits) {
    digits.forEach(digit => {
      this.digitHistory[digit] = (this.digitHistory[digit] || 0) + 1;
    });
  }

  analyzePatterns(digits) {
    // Rise/Fall analysis
    let rises = 0, falls = 0;
    for (let i = 1; i < digits.length; i++) {
      if (digits[i] > digits[i - 1]) rises++;
      else if (digits[i] < digits[i - 1]) falls++;
    }
    this.patterns.riseWinRate = (rises / (rises + falls) * 100).toFixed(2);
    this.patterns.fallWinRate = (falls / (rises + falls) * 100).toFixed(2);

    // Matches/Differs analysis
    let matches = 0, differs = 0;
    for (let i = 1; i < digits.length; i++) {
      if (digits[i] === digits[i - 1]) matches++;
      else differs++;
    }
    this.patterns.matchWinRate = (matches / (matches + differs) * 100).toFixed(2);
    this.patterns.differWinRate = (differs / (matches + differs) * 100).toFixed(2);

    // Even/Odd analysis
    let even = 0, odd = 0;
    digits.forEach(d => {
      d % 2 === 0 ? even++ : odd++;
    });
    this.patterns.evenWinRate = (even / digits.length * 100).toFixed(2);
    this.patterns.oddWinRate = (odd / digits.length * 100).toFixed(2);

    // Over/Under analysis (5 as pivot)
    let over = 0, under = 0;
    digits.forEach(d => {
      d > 5 ? over++ : under++;
    });
    this.patterns.overWinRate = (over / digits.length * 100).toFixed(2);
    this.patterns.underWinRate = (under / digits.length * 100).toFixed(2);
  }

  getAnalysis() {
    const total = Object.values(this.digitHistory).reduce((a, b) => a + b, 0);
    const frequency = {};

    for (let digit = 0; digit <= 9; digit++) {
      frequency[digit] = {
        count: this.digitHistory[digit] || 0,
        percentage: total > 0 ? ((this.digitHistory[digit] || 0) / total * 100).toFixed(2) : 0
      };
    }

    // Find rarest digit
    const rarestDigit = Object.keys(frequency).reduce((a, b) => 
      frequency[a].count < frequency[b].count ? a : b
    );

    return {
      frequency,
      patterns: this.patterns,
      rarestDigit: parseInt(rarestDigit),
      totalTicks: total
    };
  }

  getStrongestSignal() {
    const patterns = this.patterns;
    const signals = {
      rise: parseFloat(patterns.riseWinRate),
      fall: parseFloat(patterns.fallWinRate),
      matches: parseFloat(patterns.matchWinRate),
      differs: parseFloat(patterns.differWinRate),
      even: parseFloat(patterns.evenWinRate),
      odd: parseFloat(patterns.oddWinRate),
      over: parseFloat(patterns.overWinRate),
      under: parseFloat(patterns.underWinRate)
    };

    // Return strongest signal
    return Object.entries(signals).reduce((a, b) => b[1] > a[1] ? b : a);
  }

  reset() {
    this.digitHistory = {};
    this.patterns = {};
  }
}

export default Analyzer;