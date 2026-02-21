import React from 'react'
import ReactDOM from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import App from './App.jsx'
import './index.css'

// Import auth utilities for debugging (available in browser console)
import './utils/clearAuthStorage.js'

ReactDOM.createRoot(document.getElementById('root')).render(
  // StrictMode temporarily disabled to prevent double-mounting issues in development
  // <React.StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  // </React.StrictMode>,
)
