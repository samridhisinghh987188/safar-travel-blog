import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { initStorage } from './initStorage';

// Initialize storage when the app starts (non-blocking)
initStorage().catch(error => {
  console.warn('Storage initialization skipped:', error);
  // Don't throw error - app should still work without storage
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
