# Digitflow Pro - Advanced Deriv Auto Trading Dashboard

**Version 2.0.0** | Advanced automated trading bot with smart digit analysis and multi-strategy support

![Status](https://img.shields.io/badge/status-active-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![Deriv API](https://img.shields.io/badge/Deriv%20API-v3-orange)

## 🚀 Features

### Core Trading Features
- ✅ **Auto Trader** - Fully automated trading with configurable parameters
- ✅ **Smart Auto Trader** - Intelligent signal detection picking strongest pattern (Rise/Fall, Matches/Differs, Over/Under, Even/Odd)
- ✅ **Differ Scanner** - Scans all volatilities for rarest digits and auto-trades differs
- ✅ **Live Market Analysis** - Real-time digit frequency and pattern analysis
- ✅ **Multi-Volatility Support** - All 10 Deriv volatility indices supported

### Advanced Features
- 🎯 **Confirm Digit** - Wait for digit to hold 3 scans before trading
- 📊 **Martingale System** - Auto recover losses by scaling stake
- 🛡️ **Volatility Guard** - Halt trading when volatility exceeds threshold
- 🔄 **Dominance Flip Detection** - Stop trading when trend reverses or fades
- 📈 **Live Statistics** - Real-time P/L tracking and win rate monitoring

### Analysis Types
- **Rise/Fall Analysis** - Trend prediction
- **Matches/Differs Analysis** - Digit consistency tracking
- **Over/Under Analysis** - Digit range prediction (0-5 vs 6-9)
- **Even/Odd Analysis** - Digit parity tracking
- **Digit Frequency** - Last 20 ticks digit distribution

### Risk Management
- Configurable Stake & Duration
- Stop Loss & Take Profit Settings
- Max Stake Limits
- Lookback Period Configuration
- Edge % Filtering

## 📋 Requirements

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Deriv account (Demo or Real)
- Node.js 16+ (for local development)

## 🔧 Installation

### Local Development

```bash
# Clone the repository
git clone https://github.com/melianoeliano-byte/Digitflow-pro-meliano.git
cd Digitflow-pro-meliano

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Deploy to GitHub Pages
npm run deploy
```

### Browser Extension

1. Clone this repository
2. Open Chrome: `chrome://extensions/`
3. Enable "Developer mode" (top right)
4. Click "Load unpacked" and select the project folder
5. Open the extension popup to access the dashboard

## ⚙️ Configuration

### Trading Parameters

```javascript
// Time Frame
Timeframe: 100 ticks (configurable: 10-1000)

// Stake & Contracts
Stake: $0.5 (configurable)
Duration: 1 tick (configurable)

// Risk Management
Lookback: 100 ticks
Edge %: 100%
SL: $20
TP: $50
Predicted Digit: 5

// Martingale
Enabled: On/Off
Multiplier: 2x
Max Stake: $40

// Advanced
Stop on Dominance Flip: On/Off
Volatility Guard: 200%
```

### Scanner Configuration

```javascript
Scan Interval: 5 seconds
Min Differ Win Rate: 60%
Bulk Contracts: 30 per signal
Volatilities: All 10 indices
```

## 🎮 Usage

### Main Dashboard

1. **Analysis Tab**
   - View real-time digit frequency circles
   - Check pattern statistics (Matches/Differs percentages)
   - Monitor current volatility index

2. **Trading Controls**
   - Click **Start** to begin auto trading
   - Select volatility index to analyze
   - Monitor account balance and P/L

3. **Signals Tab**
   - View live trading signals
   - Check signal strength and type
   - Track signal history

4. **Trades Tab**
   - View complete trade history
   - Monitor statistics (wins, losses, win rate)
   - Track total profit/loss

5. **Scanner Tab**
   - Start differ scanner for all volatilities
   - View rarest digits per volatility
   - Monitor differ win rates

6. **Settings Tab**
   - Configure all trading parameters
   - Adjust risk management settings
   - Enable/disable features

## 📊 Trading Strategies

### Strategy 1: Auto Trader
```
Based on: Trend analysis + Volatility guard
Trigger: Rise/Fall signals with edge > 50%
Risk Management: Martingale, SL/TP, Max stake
```

### Strategy 2: Smart Auto Trader
```
Based on: Strongest of 8 patterns
Trigger: When single pattern > 55% strength
Confirmation: Optional 3-scan confirmation
Risk: Conservative with consecutive loss limit
```

### Strategy 3: Differ Scanner
```
Based on: Rarest digit + Differ rate
Trigger: Differs > 60% win rate + Rare digit
Execution: Bulk 30 contracts per signal
Scope: Scans all 10 volatilities
```

## 🔌 API Integration

### Deriv API Connection

```javascript
// Automatic WebSocket connection
- Endpoint: wss://ws.binaryws.com/websockets/v3
- Auth: Token-based authentication
- Data: Real-time tick streams
```

### Real-time Events

```javascript
// Available events
window.addEventListener('deriv:tick', (e) => {});
window.addEventListener('deriv:ohlc', (e) => {});
window.addEventListener('trade:executed', (e) => {});
window.addEventListener('differ:executed', (e) => {});
window.addEventListener('smarttrade:executed', (e) => {});
```

## 📁 Project Structure

```
Digitflow-pro-meliano/
├── src/
│   ├── main.js                 # Entry point
│   ├── App.js                  # Main app controller
│   ├── api.js                  # Deriv API handler
│   ├── websocket.js            # WebSocket manager
│   ├── dashboard.js            # UI component
│   ├── analyzer.js             # Pattern analyzer
│   ├── statistics.js           # Statistics tracker
│   ├── charts.js               # Chart.js integration
│   ├── settings.js             # Settings manager
│   ├── styles.css              # Main stylesheet
│   └── traders/
│       ├── autoTrader.js       # Auto trader bot
│       ├── differScanner.js    # Differ scanner
│       └── smartTrader.js      # Smart trader bot
├── public/
│   └── icon.png                # App icon
├── index.html                  # HTML entry
├── manifest.json               # Chrome extension config
├── vite.config.js              # Build configuration
├── package.json                # Dependencies
└── README.md                   # This file
```

## 🚀 Deployment

### GitHub Pages

```bash
# Automatic deployment
npm run deploy

# Manual steps
npm run build
gh-pages -d dist
```

**Live URL:** https://melianoeliano-byte.github.io/Digitflow-pro-meliano/

### Browser Extension

1. Build the project: `npm run build`
2. Upload to Chrome Web Store (requires developer account)
3. Or load unpacked in developer mode

## 📊 Statistics & Metrics

- **Total Trades**: Tracked per session
- **Win Rate**: Calculated in real-time
- **Average Win/Loss**: Per trade analysis
- **Account Equity**: Live balance tracking
- **Pattern Frequency**: Digit distribution

## ⚠️ Disclaimer

⚠️ **IMPORTANT NOTICE**

- This tool is provided **AS-IS** without warranty
- Past performance does not guarantee future results
- Trading involves risk of loss
- Use **DEMO account first** before real trading
- Never risk more than you can afford to lose
- Consult financial advisor before live trading

## 🔒 Security

- ✅ All API tokens stored locally in browser storage
- ✅ No server-side storage of credentials
- ✅ Encrypted WebSocket connections
- ✅ No tracking or telemetry

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

MIT License - see LICENSE file for details

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/melianoeliano-byte/Digitflow-pro-meliano/issues)
- **Discussions**: [GitHub Discussions](https://github.com/melianoeliano-byte/Digitflow-pro-meliano/discussions)
- **Documentation**: See inline code comments and settings panel

## 🎯 Roadmap

- [ ] Advanced chart visualizations
- [ ] Machine learning pattern detection
- [ ] Multi-symbol support
- [ ] Mobile app version
- [ ] Backtesting engine
- [ ] Strategy marketplace
- [ ] Community signals

## 👨‍💻 Author

**Meliano** - [@melianoeliano-byte](https://github.com/melianoeliano-byte)

## 🙏 Acknowledgments

- Deriv for their excellent API
- Chart.js for beautiful visualizations
- Vite for blazing-fast builds
- Community feedback and testing

---

**Made with ⚡ by Meliano**

*Last Updated: June 28, 2026*
