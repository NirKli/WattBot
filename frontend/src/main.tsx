import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const savedDarkMode = localStorage.getItem('darkMode');
if (savedDarkMode === 'true' || (!savedDarkMode && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
  document.documentElement.classList.add('dark');
} else {
  document.documentElement.classList.remove('dark');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
);
