/**
 * Statistics Module
 * Tracks trading statistics and performance metrics
 */

class Statistics {
  constructor() {
    this.trades = [];
    this.dailyStats = {
      totalTrades: 0,
      wins: 0,
      losses: 0,
      totalProfit: 0,
      totalLoss: 0,
      winRate: 0,
      averageWin: 0,
      averageLoss: 0
    };
  }

  recordTrade(trade) {
    this.trades.push({
      ...trade,
      timestamp: Date.now()
    });
    this.updateStats();
  }

  updateStats() {
    const stats = this.dailyStats;
    stats.totalTrades = this.trades.length;
    stats.wins = this.trades.filter(t => t.profit > 0).length;
    stats.losses = this.trades.filter(t => t.profit < 0).length;
    stats.totalProfit = this.trades.filter(t => t.profit > 0).reduce((sum, t) => sum + t.profit, 0);
    stats.totalLoss = Math.abs(this.trades.filter(t => t.profit < 0).reduce((sum, t) => sum + t.profit, 0));
    stats.winRate = stats.totalTrades > 0 ? (stats.wins / stats.totalTrades * 100).toFixed(2) : 0;
    stats.averageWin = stats.wins > 0 ? (stats.totalProfit / stats.wins).toFixed(2) : 0;
    stats.averageLoss = stats.losses > 0 ? (stats.totalLoss / stats.losses).toFixed(2) : 0;
  }

  update(ticks) {
    // Update with latest tick data
    return this.getStats();
  }

  getStats() {
    return this.dailyStats;
  }

  getRecentTrades(count = 10) {
    return this.trades.slice(-count);
  }

  reset() {
    this.trades = [];
    this.dailyStats = {
      totalTrades: 0,
      wins: 0,
      losses: 0,
      totalProfit: 0,
      totalLoss: 0,
      winRate: 0,
      averageWin: 0,
      averageLoss: 0
    };
  }
}

export default Statistics;