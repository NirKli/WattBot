import  { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../config';

// Optional: Move this to a separate file if reused
function useToast() {
  const [message, setMessage] = useState<string | null>(null);

  const showToast = (msg: string, duration = 3000) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), duration);
  };

  const Toast = () =>
      message ? (
          <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-4 py-2 rounded shadow-lg animate-fade-in-out">
            {message}
          </div>
      ) : null;

  return { showToast, Toast };
}

interface SettingsData {
  dark_mode_preference: 'auto' | 'on' | 'off';
  currency: string;
  calculate_price: boolean;
  debug_mode: boolean;
}

export default function Settings() {
  const [settings, setSettings] = useState<SettingsData>({
    dark_mode_preference: 'auto',
    currency: 'USD',
    calculate_price: true,
    debug_mode: false
  });

  const [loading, setLoading] = useState(true);
  const { showToast, Toast } = useToast();

  useEffect(() => {
    axios.get(`${API_URL}/settings`)
        .then(res => {
          setSettings({
            ...res.data,
            dark_mode_preference: res.data.dark_mode_preference || 'auto'
          });
          // Dispatch currency change event when settings are loaded
          window.dispatchEvent(new CustomEvent('currencyChange', { detail: { currency: res.data.currency } }));
        })
        .catch(() => {})
        .finally(() => setLoading(false));
  }, []);

  const handleUpdate = (partial: Partial<SettingsData>) => {
    setSettings(prev => ({ ...prev, ...partial }));
  };

  const applySettings = () => {
    axios.put(`${API_URL}/settings`, settings)
        .then(() => {
          showToast('✅ Settings saved!');
          // Dispatch currency change event when settings are saved
          window.dispatchEvent(new CustomEvent('currencyChange', { detail: { currency: settings.currency } }));
          
          // Apply dark mode based on preference
          const isDarkMode = settings.dark_mode_preference === 'on' || 
            (settings.dark_mode_preference === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
          
          document.documentElement.classList.toggle('dark', isDarkMode);
          localStorage.setItem('darkMode', isDarkMode.toString());
          localStorage.setItem('darkModePreference', settings.dark_mode_preference);
        })
        .catch(() => alert('Failed to save settings.'));
  };

  if (loading) return <p className="text-center text-gray-500 dark:text-gray-400">Loading settings...</p>;

  return (
      <div className="max-w-xl mx-auto mt-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-6">⚙️ Settings</h2>

        <div className="space-y-6">
          {/* Appearance */}
          <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-700">
            <div className="mb-4">
              <p className="font-semibold text-gray-700 dark:text-gray-300">🌙 Appearance</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Choose your preferred theme mode</p>
            </div>
            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input
                    type="radio"
                    name="darkMode"
                    value="auto"
                    checked={settings.dark_mode_preference === 'auto'}
                    onChange={() => handleUpdate({ dark_mode_preference: 'auto' })}
                    className="w-4 h-4 accent-blue-600"
                />
                <span className="text-gray-700 dark:text-gray-300">Automatic (Follow system)</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                    type="radio"
                    name="darkMode"
                    value="on"
                    checked={settings.dark_mode_preference === 'on'}
                    onChange={() => handleUpdate({ dark_mode_preference: 'on' })}
                    className="w-4 h-4 accent-blue-600"
                />
                <span className="text-gray-700 dark:text-gray-300">Always Dark</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                    type="radio"
                    name="darkMode"
                    value="off"
                    checked={settings.dark_mode_preference === 'off'}
                    onChange={() => handleUpdate({ dark_mode_preference: 'off' })}
                    className="w-4 h-4 accent-blue-600"
                />
                <span className="text-gray-700 dark:text-gray-300">Always Light</span>
              </label>
            </div>
          </div>

          {/* Currency */}
          <div className="flex justify-between items-center p-4 border rounded-lg bg-gray-50 dark:bg-gray-700">
            <div>
              <p className="font-semibold text-gray-700 dark:text-gray-300">💱 Currency</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Select preferred currency</p>
            </div>
            <select
                value={settings.currency}
                onChange={e => handleUpdate({ currency: e.target.value })}
                className="bg-gray-100 dark:bg-gray-600 text-sm rounded border px-3 py-1"
            >
              <option value="USD">USD ($)</option>
              <option value="ILS">ILS (₪)</option>
              <option value="EUR">EUR (€)</option>
            </select>
          </div>

          {/* Auto Calculate */}
          <div className="flex justify-between items-center p-4 border rounded-lg bg-gray-50 dark:bg-gray-700">
            <div>
              <p className="font-semibold text-gray-700 dark:text-gray-300">🧮 Auto-calculate</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Enable automatic price calculation</p>
            </div>
            <input
                type="checkbox"
                checked={settings.calculate_price}
                onChange={() => handleUpdate({ calculate_price: !settings.calculate_price })}
                className="w-5 h-5 accent-blue-600"
            />
          </div>

          {/* Debug Mode */}
          <div className="flex justify-between items-center p-4 border rounded-lg bg-gray-50 dark:bg-gray-700">
            <div>
              <p className="font-semibold text-gray-700 dark:text-gray-300">🛠️ Debug Mode</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Use raw label output for debugging</p>
            </div>
            <input
                type="checkbox"
                checked={settings.debug_mode}
                onChange={() => handleUpdate({ debug_mode: !settings.debug_mode })}
                className="w-5 h-5 accent-blue-600"
            />
          </div>

          {/* Save button */}
          <div className="text-center">
            <button
                onClick={applySettings}
                className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              💾 Apply Settings
            </button>
          </div>
        </div>

        <Toast />
      </div>
  );
}
