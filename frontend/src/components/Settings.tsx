import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import { 
  MdDarkMode, 
  MdLightMode, 
  MdCurrencyExchange, 
  MdSave, 
  MdSettings,
  MdCheck,
  MdClose,
  MdWarning,
  MdInfo
} from 'react-icons/md';

const Settings = () => {
  // Settings state
  const [darkMode, setDarkMode] = useState(false);
  const [currency, setCurrency] = useState('USD');
  const [calculatePrice, setCalculatePrice] = useState(true);
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  
  const currencies = [
    { value: 'USD', label: 'US Dollar ($)' },
    { value: 'EUR', label: 'Euro (€)' },
    { value: 'GBP', label: 'British Pound (£)' },
    { value: 'ILS', label: 'Israeli Shekel (₪)' },
    { value: 'JPY', label: 'Japanese Yen (¥)' },
    { value: 'CNY', label: 'Chinese Yuan (¥)' },
    { value: 'INR', label: 'Indian Rupee (₹)' },
    { value: 'BTC', label: 'Bitcoin (₿)' }
  ];

  // Fetch settings from API
  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`${API_URL}/settings`);
      const settings = response.data;
      
      // Apply settings from API - convert from snake_case to camelCase
      setDarkMode(settings.dark_mode);
      setCurrency(settings.currency || 'USD');
      setCalculatePrice(settings.calculate_price !== undefined ? settings.calculate_price : true);
      
      // Apply dark mode
      if (settings.dark_mode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
      // Save settings to localStorage for persistence
      localStorage.setItem('darkMode', settings.dark_mode.toString());
      localStorage.setItem('currency', settings.currency || 'USD');
      localStorage.setItem('calculatePrice', settings.calculate_price !== undefined ? settings.calculate_price.toString() : 'true');
      
      // Dispatch currency event for other components
      window.dispatchEvent(new CustomEvent('currencyChange', { 
        detail: { currency: settings.currency || 'USD' } 
      }));
      
      setInfoMessage('Settings loaded from server');
      setTimeout(() => setInfoMessage(null), 3000);
      
    } catch (err) {
      console.error('Failed to fetch settings:', err);
      setError('Failed to load settings from server. Using local settings.');
      
      // Use localStorage as fallback
      const savedDarkMode = localStorage.getItem('darkMode');
      if (savedDarkMode) {
        setDarkMode(savedDarkMode === 'true');
      } else {
        // Use system preference as last resort
        const systemPrefersDark = window.matchMedia && 
          window.matchMedia('(prefers-color-scheme: dark)').matches;
        setDarkMode(systemPrefersDark);
      }
      
      // Load currency from localStorage
      const savedCurrency = localStorage.getItem('currency');
      if (savedCurrency) {
        setCurrency(savedCurrency);
      }
      
      // Load calculate price from localStorage
      const savedCalculatePrice = localStorage.getItem('calculatePrice');
      if (savedCalculatePrice) {
        setCalculatePrice(savedCalculatePrice === 'true');
      }
      
      // Apply dark mode
      if ((savedDarkMode === 'true') || 
          (!savedDarkMode && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } finally {
      setLoading(false);
    }
  };

  // Load settings on component mount
  useEffect(() => {
    fetchSettings();
  }, []);

  // Apply dark mode when it changes
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Dispatch event for dark mode change
    window.dispatchEvent(new CustomEvent('darkModeChange', { 
      detail: { darkMode: darkMode } 
    }));
  }, [darkMode]);

  // Handle currency change
  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCurrency = e.target.value;
    setCurrency(newCurrency);
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Toggle calculate price
  const toggleCalculatePrice = () => {
    setCalculatePrice(!calculatePrice);
  };

  // Save settings to localStorage
  const saveSettings = async () => {
    try {
      setSaving(true);
      setError(null);
      
      
      // Try to save to API first - convert from camelCase to snake_case for backend
      try {
        await axios.put(`${API_URL}/settings`, {
          dark_mode: darkMode,
          currency: currency,
          calculate_price: calculatePrice
        });
        setInfoMessage('Settings saved to server');
      } catch (apiError) {
        console.error('Failed to save to API, falling back to localStorage:', apiError);
        // Show a warning but don't fail - we'll still save to localStorage
        setInfoMessage('Settings could not be saved to server, using local storage instead');
      }
      
      // Always save to localStorage as backup
      localStorage.setItem('darkMode', darkMode.toString());
      localStorage.setItem('currency', currency);
      localStorage.setItem('calculatePrice', calculatePrice.toString());
      
      // Dispatch currency event
      window.dispatchEvent(new CustomEvent('currencyChange', { 
        detail: { currency } 
      }));
      
      // Show success message
      setSuccessMessage('Settings saved successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      
    } catch (err) {
      console.error('Failed to save settings:', err);
      setError('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="settings-container">
      {loading ? (
        <div className="card p-6 shadow-md flex justify-center items-center min-h-[300px]">
          <div className="animate-pulse text-primary">
            <div className="h-10 bg-primary/10 rounded mb-8 w-48"></div>
            <div className="space-y-4">
              <div className="h-14 bg-primary/5 rounded w-full"></div>
              <div className="h-14 bg-primary/5 rounded w-full"></div>
            </div>
          </div>
        </div>
      ) : (
        <div className="card p-6 shadow-md">
          <h2 className="text-xl font-bold mb-6 text-primary dark:text-text-light flex items-center justify-center">
            <MdSettings className="mr-2" />
            Settings
          </h2>
          
          {/* Success message */}
          {successMessage && (
            <div className="bg-green-100 border border-green-300 text-green-800 rounded-lg p-4 mb-6 flex items-center justify-between">
              <div className="flex items-center">
                <MdCheck className="text-green-500 mr-2" size={20} />
                {successMessage}
              </div>
              <button 
                onClick={() => setSuccessMessage(null)}
                className="text-green-700 hover:text-green-900"
              >
                <MdClose size={18} />
              </button>
            </div>
          )}
          
          {/* Info message */}
          {infoMessage && (
            <div className="bg-blue-100 border border-blue-300 text-blue-800 rounded-lg p-4 mb-6 flex items-center justify-between">
              <div className="flex items-center">
                <MdInfo className="text-blue-500 mr-2" size={20} />
                {infoMessage}
              </div>
              <button 
                onClick={() => setInfoMessage(null)}
                className="text-blue-700 hover:text-blue-900"
              >
                <MdClose size={18} />
              </button>
            </div>
          )}
          
          {/* Error message */}
          {error && (
            <div className="bg-red-100 border border-red-300 text-red-800 rounded-lg p-4 mb-6 flex items-center justify-between">
              <div className="flex items-center">
                <MdWarning className="text-red-500 mr-2" size={20} />
                {error}
              </div>
              <button 
                onClick={() => setError(null)}
                className="text-red-700 hover:text-red-900"
              >
                <MdClose size={18} />
              </button>
            </div>
          )}
          
          {/* Appearance Section */}
          <div className="setting-section mb-6">
            <h3 className="text-lg font-semibold mb-3 dark:text-text-light flex items-center">
              <span className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mr-2">
                <span className="text-primary text-xs font-bold">1</span>
              </span>
              Appearance
            </h3>
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                {darkMode ? 
                  <MdDarkMode className="mr-3 text-indigo-400" size={22} /> : 
                  <MdLightMode className="mr-3 text-amber-500" size={22} />
                }
                <div>
                  <span className="font-medium dark:text-text-light block">{darkMode ? 'Dark Mode' : 'Light Mode'}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{darkMode ? 'Using dark color scheme' : 'Using light color scheme'}</span>
                </div>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={darkMode}
                  onChange={toggleDarkMode}
                />
                <span className="slider round"></span>
              </label>
            </div>
          </div>
          
          {/* Currency Selection */}
          <div className="setting-section mb-6">
            <h3 className="text-lg font-semibold mb-3 dark:text-text-light flex items-center">
              <span className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mr-2">
                <span className="text-primary text-xs font-bold">2</span>
              </span>
              Currency
            </h3>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center mb-3">
                <MdCurrencyExchange className="mr-3 text-primary" size={22} />
                <p className="text-sm text-gray-600 dark:text-gray-300">Select your preferred currency for prices and calculations</p>
              </div>
              <select
                value={currency}
                onChange={handleCurrencyChange}
                className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-primary dark:text-white focus:outline-none"
              >
                {currencies.map(curr => (
                  <option key={curr.value} value={curr.value}>
                    {curr.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Calculate Price Option */}
          <div className="setting-section mb-6">
            <h3 className="text-lg font-semibold mb-3 dark:text-text-light flex items-center">
              <span className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mr-2">
                <span className="text-primary text-xs font-bold">3</span>
              </span>
              Calculation Settings
            </h3>
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <MdCurrencyExchange className="mr-3 text-primary" size={22} />
                <div>
                  <span className="font-medium dark:text-text-light block">Auto-calculate Price</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {calculatePrice ? 'Automatically calculate price when adding new readings' : 'Manual price entry for new readings'}
                  </span>
                </div>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={calculatePrice}
                  onChange={toggleCalculatePrice}
                />
                <span className="slider round"></span>
              </label>
            </div>
          </div>
          
          {/* Buttons */}
          <div className="mt-8 flex justify-center">
            <button 
              id="save-settings-button"
              onClick={saveSettings}
              disabled={saving}
              className={`flex items-center px-8 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-full transition-all duration-300 font-medium shadow-lg hover:shadow-xl hover:scale-105 ${saving ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {saving ? (
                <div className="flex items-center">
                  <div className="animate-spin mr-3 h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Saving Changes...</span>
                </div>
              ) : (
                <div className="flex items-center">
                  <div className="bg-white/20 rounded-full p-1.5 mr-3">
                    <MdSave className="text-white" size={18} />
                  </div>
                  <span>Apply Settings</span>
                </div>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings; 