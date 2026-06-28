/**
 * Deriv API Handler
 * Manages WebSocket connections and API requests to Deriv
 */

class DerivAPI {
  constructor() {
    this.ws = null;
    this.appId = '71291'; // Demo app ID - replace with your app ID
    this.token = localStorage.getItem('deriv_token') || null;
    this.accountId = null;
    this.requestId = 1;
    this.callbacks = {};
  }

  async connect() {
    return new Promise((resolve, reject) => {
      try {
        // Use Deriv demo WebSocket endpoint
        const wsUrl = 'wss://ws.binaryws.com/websockets/v3';
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('✅ Deriv WebSocket Connected');
          this.authorize(this.token).then(resolve).catch(reject);
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(JSON.parse(event.data));
        };

        this.ws.onerror = (error) => {
          console.error('❌ WebSocket Error:', error);
          reject(error);
        };

        this.ws.onclose = () => {
          console.warn('⚠️ WebSocket Closed');
          setTimeout(() => this.connect(), 3000);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  authorize(token) {
    return this.sendRequest({
      authorize: token || ''
    });
  }

  async getAccountInfo() {
    const response = await this.sendRequest({
      get_account_settings: 1
    });
    return response;
  }

  subscribeToTicks(symbol) {
    return this.sendRequest({
      ticks: symbol,
      subscribe: 1
    });
  }

  subscribeToOHLC(symbol, granularity) {
    return this.sendRequest({
      ticks_history: symbol,
      granularity: granularity,
      count: 100,
      subscribe: 1
    });
  }

  async placeTrade(params) {
    return this.sendRequest({
      buy: 1,
      subscribe: 1,
      ...params
    });
  }

  sendRequest(payload) {
    return new Promise((resolve, reject) => {
      const id = this.requestId++;
      payload.req_id = id;

      this.callbacks[id] = { resolve, reject, timestamp: Date.now() };

      // Timeout after 30 seconds
      setTimeout(() => {
        if (this.callbacks[id]) {
          delete this.callbacks[id];
          reject(new Error('Request timeout'));
        }
      }, 30000);

      this.ws.send(JSON.stringify(payload));
    });
  }

  handleMessage(data) {
    const id = data.req_id;
    
    if (id && this.callbacks[id]) {
      const { resolve } = this.callbacks[id];
      delete this.callbacks[id];
      resolve(data);
    }

    // Handle streaming data (ticks, ohlc, etc.)
    if (data.tick) {
      this.handleTick(data.tick);
    }
    if (data.ohlc) {
      this.handleOHLC(data.ohlc);
    }
  }

  handleTick(tick) {
    const event = new CustomEvent('deriv:tick', { detail: tick });
    window.dispatchEvent(event);
  }

  handleOHLC(ohlc) {
    const event = new CustomEvent('deriv:ohlc', { detail: ohlc });
    window.dispatchEvent(event);
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

export { DerivAPI };