# Digitflow Pro - Development Guide

## Project Setup

### Prerequisites
- Node.js 16+ or higher
- npm or yarn package manager
- Git

### Local Development

```bash
# Clone repository
git clone https://github.com/melianoeliano-byte/Digitflow-pro-meliano.git
cd Digitflow-pro-meliano

# Install dependencies
npm install

# Start dev server (opens at http://localhost:3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Architecture

### Core Modules

#### 1. **API Module** (`src/api.js`)
- Handles WebSocket connection to Deriv
- Manages API requests and responses
- Event dispatching for real-time data

**Key Methods:**
```javascript
connect()              // Establish WebSocket connection
authorize(token)       // Authenticate with API token
subscribeToTicks(symbol)     // Stream tick data
placeTrade(params)     // Execute trades
```

#### 2. **WebSocket Manager** (`src/websocket.js`)
- Real-time subscription management
- Event broadcasting
- Active subscription tracking

#### 3. **Analyzer** (`src/analyzer.js`)
- Digit frequency analysis
- Pattern recognition (8 types)
- Rarest digit detection

**Analysis Types:**
- Rise/Fall
- Matches/Differs
- Even/Odd
- Over/Under

#### 4. **Dashboard UI** (`src/dashboard.js`)
- HTML generation
- Event listeners
- Tab management
- Live updates

#### 5. **Trading Bots** (`src/traders/`)

**AutoTrader.js**
- Main trading bot
- Configurable parameters
- Martingale support
- Trade execution

**SmartTrader.js**
- Multi-pattern analysis
- Strongest signal detection
- Confirmation system
- Consecutive loss detection

**DifferScanner.js**
- Multi-volatility scanning
- Rarest digit identification
- Bulk contract execution
- History tracking

## Configuration

### Trading Parameters

Edit settings in the dashboard "Settings" tab or modify `src/settings.js`:

```javascript
DEFAULT_SETTINGS = {
  // Time Frame
  timeframe: 100,           // Number of ticks to analyze
  
  // Stake & Contracts
  stake: 0.5,              // $ per trade
  duration: 1,             // Ticks duration
  
  // Risk Management
  lookback: 100,           // Historical ticks for analysis
  edgePercent: 100,        // Minimum edge percentage
  slAmount: 20,            // Stop loss in dollars
  tpAmount: 50,            // Take profit in dollars
  predictedDigit: 5,       // Predicted digit (0-9)
  
  // Martingale
  martingaleEnabled: false,
  multiplier: 2,           // Martingale multiplier
  maxStake: 40,            // Max stake limit
  
  // Advanced
  stopOnDominanceFlip: false,
  volatilityGuard: 200     // Volatility threshold %
};
```

## Adding New Features

### Adding a New Trading Strategy

1. Create new file in `src/traders/myStrategy.js`:

```javascript
class MyStrategy {
  constructor() {
    this.isRunning = false;
    this.config = {};
  }

  start(state) {
    this.isRunning = true;
    this.execute(state);
  }

  stop() {
    this.isRunning = false;
  }

  async execute(state) {
    // Strategy logic here
  }
}

export default MyStrategy;
```

2. Import in `src/App.js`:

```javascript
import MyStrategy from './traders/myStrategy.js';

class App {
  constructor() {
    // ...
    this.myStrategy = new MyStrategy();
  }
}
```

3. Add UI controls in `src/dashboard.js`

### Adding a New Analysis Type

1. Add analysis method in `src/analyzer.js`:

```javascript
analyzeNewPattern(digits) {
  // Analysis logic
  return { pattern: data };
}
```

2. Add to pattern analysis in `analyzePatterns()` method

3. Update UI in dashboard to display new analysis

## Event System

The app uses custom events for communication:

```javascript
// Dispatch event
const event = new CustomEvent('eventName', { detail: data });
window.dispatchEvent(event);

// Listen to event
window.addEventListener('eventName', (e) => {
  console.log(e.detail);
});
```

### Available Events

| Event | Source | Detail |
|-------|--------|--------|
| `deriv:tick` | API | Tick data |
| `deriv:ohlc` | API | OHLC data |
| `trade:executed` | AutoTrader | Trade details |
| `differ:executed` | DifferScanner | Differ trade |
| `smarttrade:executed` | SmartTrader | Smart trade |
| `dashboard:start` | Dashboard | - |
| `dashboard:stop` | Dashboard | - |
| `settings:updated` | Settings | Settings object |

## Styling Guide

The app uses CSS custom properties (variables) for theming:

```css
:root {
  --primary: #1a1a2e;
  --secondary: #16213e;
  --accent: #0f3460;
  --success: #00ff00;
  --danger: #ff0000;
  --warning: #ffaa00;
  --text: #e0e0e0;
  --text-muted: #888;
  --border: #333;
}
```

Modify these to change the entire theme.

## API Integration

### Connecting to Deriv API

1. Get your app ID from Deriv
2. Update in `src/api.js`:

```javascript
this.appId = 'YOUR_APP_ID';
```

3. Get your API token and store in browser localStorage:

```javascript
localStorage.setItem('deriv_token', 'YOUR_TOKEN');
```

### API Endpoints Used

- `authorize` - Authenticate user
- `ticks` - Subscribe to tick stream
- `ticks_history` - Get historical ticks
- `buy` - Place trade
- `get_account_settings` - Get account info

## Testing

### Manual Testing Checklist

- [ ] API connection established
- [ ] Ticks streaming correctly
- [ ] Digit analysis updating live
- [ ] Auto Trader starting/stopping
- [ ] Settings persisting after refresh
- [ ] Trades recording correctly
- [ ] Statistics calculating accurately
- [ ] All UI tabs functional
- [ ] Scanner working on all volatilities
- [ ] Responsive on different screen sizes

## Debugging

### Browser Console

```javascript
// Check API connection
window.app.api.ws.readyState

// View current state
window.app.state

// Check analyzer results
window.app.analyzer.getAnalysis()

// Get bot stats
window.app.autoTrader.getStats()
window.app.smartTrader.getStats()
```

### Enable Debug Logging

Add to `src/main.js`:

```javascript
window.DEBUG = true;

if (window.DEBUG) {
  console.log('Debug mode enabled');
}
```

## Performance Optimization

### Current Optimizations
- Event-driven architecture (no continuous polling)
- Debounced UI updates
- Efficient digit frequency tracking
- Limited history (keeps last 100 ticks)

### Further Improvements
- Web Workers for analysis
- IndexedDB for historical data
- Canvas rendering for charts
- Service Worker caching

## Deployment Checklist

- [ ] All tests passing
- [ ] No console errors
- [ ] Production build created
- [ ] GitHub Pages configured
- [ ] API token handling secure
- [ ] Responsive design tested
- [ ] Performance optimized
- [ ] Documentation updated

## Troubleshooting

### WebSocket Connection Failed
- Check internet connection
- Verify Deriv API is accessible
- Check browser console for errors
- Try different browser

### Ticks Not Updating
- Verify WebSocket connection (check Network tab)
- Check if token is valid
- Ensure symbol is correct
- Restart application

### Settings Not Saving
- Check browser localStorage limits
- Clear cache and try again
- Check browser console for errors
- Try incognito mode

### Trades Not Executing
- Verify account has sufficient balance
- Check trade parameters
- Verify API permissions
- Check console for error messages

## Resources

- [Deriv API Documentation](https://api.deriv.com)
- [Chart.js Documentation](https://www.chartjs.org)
- [Vite Documentation](https://vitejs.dev)
- [Web Components](https://developer.mozilla.org/en-US/docs/Web/Web_Components)

## Contributing

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request
5. Code review by maintainers

## License

MIT - See LICENSE file
