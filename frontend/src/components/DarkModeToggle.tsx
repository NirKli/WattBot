import {useEffect, useState} from 'react';
import {MoonIcon, SunIcon} from '@heroicons/react/24/outline';

type DarkModePreference = 'auto' | 'on' | 'off';

const DarkModeToggle = () => {
    const [isDark, setIsDark] = useState(false);

    const getStoredPreference = (): DarkModePreference => {
        const stored = localStorage.getItem('darkModePreference');
        if (stored === 'auto' || stored === 'on' || stored === 'off') {
            return stored;
        }
        return 'auto';
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
        applyDarkMode();

        // Listen for system preference changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e: MediaQueryListEvent) => {
            // Only apply system preference if user hasn't set a preference
            const currentPreference = getStoredPreference();
            if (currentPreference === 'auto') {
                setIsDark(e.matches);
                applyDarkMode();
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    const applyDarkMode = () => {
        const preference = getStoredPreference();
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const shouldBeDark = preference === 'on' || (preference === 'auto' && systemPrefersDark);
        document.documentElement.classList.toggle('dark', shouldBeDark);
    };

    const toggleDarkMode = () => {
        const currentPreference = getStoredPreference();
        let newPreference: DarkModePreference;

        if (currentPreference === 'auto') {
            newPreference = isDark ? 'off' : 'on';
        } else if (currentPreference === 'on') {
            newPreference = 'off';
        } else {
            newPreference = 'on';
        }

        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        // @ts-ignore
        const shouldBeDark = newPreference === 'on' || (newPreference === 'auto' && systemPrefersDark);

        setIsDark(shouldBeDark);
        applyDarkMode();
        localStorage.setItem('darkModePreference', newPreference);
    };

    return (
        <button
            onClick={toggleDarkMode}
            className="rounded-full w-6 h-6 flex items-center justify-center transition-all duration-300 ease-apple hover:bg-black/5 dark:hover:bg-white/10 focus:outline-none"
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
            {isDark ? (
                <SunIcon className="h-3.5 w-3.5 text-apple-blue"/>
            ) : (
                <MoonIcon className="h-3.5 w-3.5 text-apple-darkgray dark:text-gray-400"/>
            )}
        </button>
    );
};

export default DarkModeToggle;