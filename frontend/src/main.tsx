import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Apply dark mode on initial load before React renders
const applyInitialDarkMode = () => {
  // Check if user has a saved preference
  const savedPreference = localStorage.getItem('darkMode');
  
  // If no saved preference, check system preference
  if (savedPreference === null) {
    const systemPrefersDark = window.matchMedia && 
      window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (systemPrefersDark) {
      document.documentElement.classList.add('dark');
    }
  } else if (savedPreference === 'true') {
    document.documentElement.classList.add('dark');
  }
};

// Apply dark mode before React renders
applyInitialDarkMode();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
