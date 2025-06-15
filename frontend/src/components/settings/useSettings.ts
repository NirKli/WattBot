import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../config';

export interface SettingsData {
  dark_mode_preference: 'auto' | 'on' | 'off';
  currency: string;
  calculate_price: boolean;
  debug_mode: boolean;
}

export function useSettings() {
  const [settings, setSettings] = useState<SettingsData>({
    dark_mode_preference: 'auto',
    currency: 'USD',
    calculate_price: true,
    debug_mode: false
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API_URL}/settings`);
      setSettings(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch settings');
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<SettingsData>) => {
    try {
      // Create a complete settings object by merging current settings with new settings
      const updatedSettings = {
        ...settings,
        ...newSettings
      };

      const response = await axios.put(`${API_URL}/settings`, updatedSettings);
      setSettings(response.data);
      setError(null);

      // Handle dark mode preference changes
      if (newSettings.dark_mode_preference) {
        const darkModePreference = newSettings.dark_mode_preference;
        if (darkModePreference === 'on') {
          document.documentElement.classList.add('dark');
        } else if (darkModePreference === 'off') {
          document.documentElement.classList.remove('dark');
        } else {
          // 'auto' mode
          const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
          document.documentElement.classList.toggle('dark', prefersDarkMode);
        }
        localStorage.setItem('darkModePreference', darkModePreference);
        window.dispatchEvent(new CustomEvent('themeChange', { 
          detail: { darkModePreference } 
        }));
      }

      // Dispatch currency change event if currency was updated
      if (newSettings.currency) {
        window.dispatchEvent(new CustomEvent('currencyChange', {
          detail: { currency: newSettings.currency }
        }));
      }
    } catch (err) {
      setError('Failed to update settings');
      console.error('Error updating settings:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    loading,
    error,
    updateSettings
  };
} 