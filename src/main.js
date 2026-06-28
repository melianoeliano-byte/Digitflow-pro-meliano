import App from './App.js';
import { initWebSocket } from './websocket.js';
import { loadSettings } from './settings.js';

// Initialize application
document.addEventListener('DOMContentLoaded', async () => {
  const app = new App();
  await app.init();
  
  // Load saved settings
  const settings = await loadSettings();
  app.applySettings(settings);
  
  // Initialize WebSocket connection
  await initWebSocket(app);
  
  // Render main dashboard
  app.render(document.getElementById('app'));
  
  console.log('✅ Digitflow Pro Dashboard Initialized');
});

export default App;