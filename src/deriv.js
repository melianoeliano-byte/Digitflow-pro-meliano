const APP_ID_DEFAULT = 1089;
const REQUEST_TIMEOUT_MS = 10000;

class DerivWS {
  constructor({ appId = APP_ID_DEFAULT, autoReconnect = true } = {}) {
    this.appId = appId;
    this.autoReconnect = autoReconnect;
    this.socket = null;
    this.subscriptions = new Set();
    this._tickHandlers = [];
    this._openHandlers = [];
    this._closeHandlers = [];
    this._errorHandlers = [];
    this._backoff = 1000;
    this._maxBackoff = 30000;

    // request/response tracking
    this._pending = {}; // req_id => { resolve, reject, timeout }
    this._nextReqId = 1;

    this._connect();
  }

  _connect() {
    const url = `wss://ws.derivws.com/websockets/v3?app_id=${this.appId}`;
    this.socket = new WebSocket(url);

    this.socket.onopen = () => {
      this._backoff = 1000;
      this._openHandlers.forEach((h) => h());
      // re-subscribe
      this.subscriptions.forEach((s) => {
        try {
          this.subscribe(s);
        } catch (e) {}
      });
    };

    this.socket.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data);

        // If the message echoes a req_id we added, resolve the pending promise
        const echoReq = data.echo_req || data.echoReq;
        if (echoReq && echoReq.req_id) {
          const rid = echoReq.req_id;
          const pending = this._pending[rid];
          if (pending) {
            clearTimeout(pending.timeout);
            delete this._pending[rid];
            return pending.resolve(data);
          }
        }

        // Generic tick handler
        if (data.tick) {
          const symbol = data.tick.symbol || (data.echo_req && data.echo_req.ticks);
          this._tickHandlers.forEach((h) => h(symbol, data.tick));
          return;
        }

        // Fallback: if message contains proposal or buy, try to resolve by matching proposal id inside response
        // Some Deriv responses may include 'proposal' or 'buy' without echo_req; attempt best-effort matching
        if (data.proposal && data.proposal.id) {
          // try to resolve pending by searching for a pending with matching proposal id in request (best-effort not implemented)
        }

      } catch (e) {
        console.error("Invalid WS message", e);
      }
    };

    this.socket.onerror = (err) => {
      this._errorHandlers.forEach((h) => h(err));
    };

    this.socket.onclose = () => {
      this._closeHandlers.forEach((h) => h());
      if (this.autoReconnect) {
        setTimeout(() => {
          this._backoff = Math.min(this._backoff * 1.5, this._maxBackoff);
          this._connect();
        }, this._backoff);
      }
    };
  }

  _ensureOpen() {
    return this.socket && this.socket.readyState === WebSocket.OPEN;
  }

  _sendRequest(obj) {
    if (!this.socket) return Promise.reject(new Error("Socket not initialized"));
    if (!this._ensureOpen()) return Promise.reject(new Error("Socket not ready"));

    const reqId = `r${Date.now()}_${this._nextReqId++}`;
    // attach req_id inside echo_req so server will echo it back in echo_req
    obj.req_id = reqId;
    if (!obj.echo_req) obj.echo_req = {};
    obj.echo_req.req_id = reqId;

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        delete this._pending[reqId];
        reject(new Error("Request timeout"));
      }, REQUEST_TIMEOUT_MS);

      this._pending[reqId] = { resolve, reject, timeout };

      try {
        this.socket.send(JSON.stringify(obj));
      } catch (err) {
        clearTimeout(timeout);
        delete this._pending[reqId];
        reject(err);
      }
    });
  }

  onTick(fn) {
    this._tickHandlers.push(fn);
  }

  onOpen(fn) {
    this._openHandlers.push(fn);
  }

  onClose(fn) {
    this._closeHandlers.push(fn);
  }

  onError(fn) {
    this._errorHandlers.push(fn);
  }

  subscribe(symbol = "R_100") {
    this.subscriptions.add(symbol);
    if (!this._ensureOpen()) return;
    try {
      this.socket.send(
        JSON.stringify({
          ticks: symbol
        })
      );
    } catch (e) {
      console.warn("subscribe send failed", e);
    }
  }

  unsubscribe(symbol) {
    this.subscriptions.delete(symbol);
    if (!this._ensureOpen()) return;
    try {
      this.socket.send(
        JSON.stringify({
          forget: symbol
        })
      );
    } catch (e) {}
  }

  // Authorize via API token; returns a promise that resolves with the authorize response
  authorize(token) {
    if (!this._ensureOpen()) return Promise.reject(new Error("Socket not ready"));
    return this._sendRequest({ authorize: token });
  }

  // Buy a contract: does proposal -> buy flow.
  // params: { amount, basis, contract_type, currency, duration, duration_unit, symbol, barrier, price (optional) }
  async buyContract(params = {}) {
    if (!this._ensureOpen()) {
      return Promise.reject(new Error("Socket not ready"));
    }

    const proposalReq = {
      proposal: 1,
      amount: params.amount,
      basis: params.basis || "stake",
      contract_type: params.contract_type,
      currency: params.currency || "USD",
      duration: params.duration,
      duration_unit: params.duration_unit || "t",
      symbol: params.symbol,
      barrier: typeof params.barrier !== "undefined" ? params.barrier : undefined
    };

    Object.keys(proposalReq).forEach((k) => proposalReq[k] === undefined && delete proposalReq[k]);

    let proposalResp;
    try {
      proposalResp = await this._sendRequest(proposalReq);
    } catch (err) {
      return Promise.reject(new Error("Proposal request failed: " + (err.message || err)));
    }

    const proposal = proposalResp.proposal || proposalResp.proposal_open_contract || null;
    if (!proposal || !proposal.id) {
      const id = proposalResp.proposal && (proposalResp.proposal.id || proposalResp.proposal.proposal_id);
      if (!id) return Promise.reject(new Error("Invalid proposal response, missing id"));
      proposal.id = id;
    }

    const askPrice = (proposal.ask_price || proposal.askPrice || proposal.ask_price) || params.amount || params.price;
    const price = params.price || askPrice;

    if (typeof price === "undefined") {
      return Promise.reject(new Error("Cannot determine buy price from proposal or params"));
    }

    const buyReq = {
      buy: proposal.id,
      price: price
    };

    Object.keys(buyReq).forEach((k) => buyReq[k] === undefined && delete buyReq[k]);

    let buyResp;
    try {
      buyResp = await this._sendRequest(buyReq);
    } catch (err) {
      return Promise.reject(new Error("Buy request failed: " + (err.message || err)));
    }

    if (!buyResp.buy) {
      return buyResp;
    }

    return buyResp.buy;
  }

  destroy() {
    if (this.socket) {
      try {
        this.socket.close();
      } catch (e) {}
      this.socket = null;
    }
  }
}

export default DerivWS;
