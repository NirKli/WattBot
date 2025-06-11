import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Check for dark mode preference
const darkModePreference = localStorage.getItem('darkModePreference') || 'auto';
const isDarkMode = darkModePreference === 'on' ||
    (darkModePreference === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);

if (isDarkMode) {
    document.documentElement.classList.add('dark');
} else {
    document.documentElement.classList.remove('dark');
}

// Listen for system preference changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    const currentPreference = localStorage.getItem('darkModePreference') || 'auto';
    if (currentPreference === 'auto') {
        document.documentElement.classList.toggle('dark', e.matches);
    }
});

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App/>
    </React.StrictMode>,
);
