import { useState, useEffect } from 'react';
import { MoonIcon, SunIcon } from '@heroicons/react/24/outline';

type DarkModePreference = 'auto' | 'on' | 'off';

const DarkModeToggle = () => {
  const [isDark, setIsDark] = useState(false);

  const getStoredPreference = (): DarkModePreference => {
    const stored = localStorage.getItem('darkModePreference');
    return (stored === 'auto' || stored === 'on' || stored === 'off') ? stored : 'auto';
  };

  useEffect(() => {
    // Check for system preference first
    const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Then check if user has a saved preference
    const savedPreference = getStoredPreference();
    const shouldBeDark = savedPreference === 'on' || 
      (savedPreference === 'auto' && systemPrefersDark);
    
    // Update state and apply dark mode
    setIsDark(shouldBeDark);
    applyDarkMode(shouldBeDark);
    
    // Listen for system preference changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      // Only apply system preference if user hasn't set a preference
      const currentPreference = getStoredPreference();
      if (currentPreference === 'auto') {
        setIsDark(e.matches);
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
    const currentPreference = getStoredPreference();
    let newPreference: DarkModePreference;
    
    if (currentPreference === 'auto') {
      newPreference = isDark ? 'off' : 'on';
    } else {
      newPreference = currentPreference === 'on' ? 'off' : 'on';
    }
    
    const shouldBeDark = newPreference === 'on' || 
      (newPreference === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    setIsDark(shouldBeDark);
    applyDarkMode(shouldBeDark);
    localStorage.setItem('darkModePreference', newPreference);
  };

  return (
    <button 
      onClick={toggleDarkMode}
      className="rounded-full w-6 h-6 flex items-center justify-center transition-all duration-300 ease-apple hover:bg-black/5 dark:hover:bg-white/10 focus:outline-none"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? (
        <SunIcon className="h-3.5 w-3.5 text-apple-blue" />
      ) : (
        <MoonIcon className="h-3.5 w-3.5 text-apple-darkgray dark:text-gray-400" />
      )}
    </button>
  );
};

export default DarkModeToggle; 