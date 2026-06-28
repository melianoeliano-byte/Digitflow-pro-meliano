/**
 * WebSocket Manager
 * Handles real-time data streams from Deriv API
 */

import { DerivAPI } from './api.js';

let wsConnection = null;
let activeSubscriptions = new Map();

export async function initWebSocket(app) {
  wsConnection = app.api;

  // Listen for tick events
  window.addEventListener('deriv:tick', (event) => {
    const tick = event.detail;
    app.updateTicks([tick]);
    broadcastTickUpdate(tick);
  });

  // Listen for OHLC events
  window.addEventListener('deriv:ohlc', (event) => {
    const ohlc = event.detail;
    broadcastOHLCUpdate(ohlc);
  });

  console.log('✅ WebSocket listeners initialized');
}

export function subscribeTick(symbol) {
  if (!activeSubscriptions.has(symbol)) {
    wsConnection.subscribeToTicks(symbol);
    activeSubscriptions.set(symbol, { type: 'tick', timestamp: Date.now() });
  }
}

export function subscribeOHLC(symbol, granularity = 60) {
  const key = `${symbol}_${granularity}`;
  if (!activeSubscriptions.has(key)) {
    wsConnection.subscribeToOHLC(symbol, granularity);
    activeSubscriptions.set(key, { type: 'ohlc', granularity, timestamp: Date.now() });
  }
}

export function unsubscribe(symbol) {
  activeSubscriptions.delete(symbol);
}

function broadcastTickUpdate(tick) {
  const event = new CustomEvent('tick:update', { detail: tick });
  document.dispatchEvent(event);
}

function broadcastOHLCUpdate(ohlc) {
  const event = new CustomEvent('ohlc:update', { detail: ohlc });
  document.dispatchEvent(event);
}

export function getActiveSubscriptions() {
  return Array.from(activeSubscriptions.keys());
}