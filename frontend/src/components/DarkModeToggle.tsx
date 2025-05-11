import { useState, useEffect } from 'react';
import { MoonIcon, SunIcon } from '@heroicons/react/24/outline';

const DarkModeToggle = () => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Check for system preference first
    const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Then check if user has a saved preference
    const savedPreference = localStorage.getItem('darkMode');
    const isDarkMode = savedPreference !== null ? savedPreference === 'true' : systemPrefersDark;
    
    // Update state and apply dark mode
    setDarkMode(isDarkMode);
    applyDarkMode(isDarkMode);
    
    // Listen for system preference changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      // Only apply system preference if user hasn't set a preference
      if (localStorage.getItem('darkMode') === null) {
        setDarkMode(e.matches);
        applyDarkMode(e.matches);
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const applyDarkMode = (isDark: boolean) => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    applyDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
  };

  return (
    <button 
      onClick={toggleDarkMode}
      className="rounded-full w-6 h-6 flex items-center justify-center transition-all duration-300 ease-apple hover:bg-black/5 dark:hover:bg-white/10 focus:outline-none"
      aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      {darkMode ? (
        <SunIcon className="h-3.5 w-3.5 text-apple-blue" />
      ) : (
        <MoonIcon className="h-3.5 w-3.5 text-apple-darkgray dark:text-gray-400" />
      )}
    </button>
  );
};

export default DarkModeToggle; 