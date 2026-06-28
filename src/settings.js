/**
 * Settings Manager
 * Handles user preferences and configuration storage
 */

const DEFAULT_SETTINGS = {
  // Trading Settings
  timeframe: 100,
  stake: 0.5,
  duration: 1,
  lookback: 100,
  edgePercent: 100,
  slAmount: 20,
  tpAmount: 50,
  predictedDigit: 5,
  
  // Martingale Settings
  martingaleEnabled: false,
  multiplier: 2,
  maxStake: 40,
  
  // Auto Trader Settings
  autoTraderEnabled: false,
  stopOnDominanceFlip: false,
  volatilityGuard: 200,
  
  // Differ Scanner Settings
  differScannerEnabled: false,
  minDifferWinRate: 60,
  bulkContracts: 30,
  
  // Smart Trader Settings
  smartTraderEnabled: false,
  confirmDigit: false,
  confirmDigitScans: 3,
  
  // Account Settings
  accountType: 'DEMO',
  theme: 'dark',
  notificationsEnabled: true
};

export async function loadSettings() {
  try {
    const stored = localStorage.getItem('digitflow_settings');
    return stored ? JSON.parse(stored) : DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Error loading settings:', error);
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings) {
  try {
    localStorage.setItem('digitflow_settings', JSON.stringify(settings));
    window.dispatchEvent(new CustomEvent('settings:updated', { detail: settings }));
    return true;
  } catch (error) {
    console.error('Error saving settings:', error);
    return false;
  }
}

export function getSetting(key) {
  const settings = JSON.parse(localStorage.getItem('digitflow_settings') || JSON.stringify(DEFAULT_SETTINGS));
  return settings[key];
}

export function updateSetting(key, value) {
  const settings = JSON.parse(localStorage.getItem('digitflow_settings') || JSON.stringify(DEFAULT_SETTINGS));
  settings[key] = value;
  saveSettings(settings);
}