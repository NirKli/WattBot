import { useState, useEffect } from 'react'
import axios from 'axios'
import { API_URL } from '../config'
// Import Material Design icons
import { MdOutlineElectricMeter } from "react-icons/md";
import { FaCalendarAlt, FaClock } from "react-icons/fa";

interface MonthlyConsumption {
  modified_date: string;
  date: string;
  total_kwh_consumed: number;
  price: number;
  original_file: any;
  file_name: string;
  label_file: any;
  file_label_name: any;
}

export default function LatestReading() {
  const [latestReading, setLatestReading] = useState<MonthlyConsumption | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [labelImageUrl, setLabelImageUrl] = useState<string | null>(null)
  const [currency, setCurrency] = useState('USD')

  useEffect(() => {
    fetchLatestReading()
    
    // Get initial currency from localStorage
    const savedCurrency = localStorage.getItem('currency');
    if (savedCurrency) {
      setCurrency(savedCurrency);
    }
    
    // Listen for currency changes
    const handleCurrencyChange = (e: CustomEvent) => {
      if (e.detail && e.detail.currency) {
        setCurrency(e.detail.currency);
      }
    };
    
    window.addEventListener('currencyChange', handleCurrencyChange as EventListener);
    return () => {
      window.removeEventListener('currencyChange', handleCurrencyChange as EventListener);
    };
  }, [])

  useEffect(() => {
    // If we have a latest reading with a label file, fetch the image
    if (latestReading?.label_file) {
      const imageUrl = `${API_URL}/monthly-consumption/file/${latestReading.label_file}`;
      setLabelImageUrl(imageUrl);
    }
  }, [latestReading])

  const fetchLatestReading = async () => {
    try {
      const response = await axios.get(`${API_URL}/monthly-consumption`)
      const readings = response.data
      if (readings.length > 0) {
        // Sort by date in descending order and get the latest with safe date parsing
        const sortedReadings = readings.sort(
          (a: MonthlyConsumption, b: MonthlyConsumption) => {
            const dateA = safeParseDate(a.date);
            const dateB = safeParseDate(b.date);
            
            if (!dateA && !dateB) return 0;
            if (!dateA) return 1; // null dates go to the end
            if (!dateB) return -1;
            
            return dateB.getTime() - dateA.getTime();
          }
        )
        setLatestReading(sortedReadings[0])
      }
    } catch (err) {
      setError('Failed to fetch latest reading')
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Add a helper to safely parse dates
  const safeParseDate = (dateString: string | undefined): Date | null => {
    if (!dateString) return null;
    
    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return null;
      }
      return date;
    } catch (e) {
      console.error('Error parsing date:', e);
      return null;
    }
  };

  // Format the date
  const formatDate = (dateString: string | undefined): string => {
    const date = safeParseDate(dateString);
    if (!date) return 'Invalid date';
    
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  // Get currency symbol based on selected currency
  const getCurrencySymbol = (currencyCode: string): string => {
    const symbols: {[key: string]: string} = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'ILS': '₪',
      'JPY': '¥',
      'CNY': '¥',
      'INR': '₹',
      'BTC': '₿'
    };
    
    return symbols[currencyCode] || currencyCode;
  };

  if (loading) {
    return (
      <div className="py-8 text-center">
        <div className="flex justify-center items-center space-x-2">
          <div className="h-3 w-3 bg-primary rounded-full animate-pulse"></div>
          <div className="h-3 w-3 bg-primary rounded-full animate-pulse delay-150"></div>
          <div className="h-3 w-3 bg-primary rounded-full animate-pulse delay-300"></div>
        </div>
        <p className="text-muted text-sm mt-3">Loading data...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-danger text-xs bg-danger/10 p-4 rounded border border-danger/30">
        {error}
      </div>
    )
  }

  if (!latestReading) {
    return (
      <div className="text-center text-muted text-xs p-4">
        No readings available yet
      </div>
    )
  }

  return (
    <div className="max-w-xs mx-auto rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 flex flex-col items-center space-y-4">
      {/* Icon or Image */}
      <div className="w-24 h-24 rounded-lg overflow-hidden shadow bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
        {labelImageUrl ? (
          <img 
            src={labelImageUrl} 
            alt="Latest meter reading" 
            className="object-cover w-full h-full"
          />
        ) : (
          <MdOutlineElectricMeter className="text-primary w-16 h-16 opacity-60" />
        )}
      </div>

      {/* Main Value */}
      <div className="flex flex-col items-center">
        <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">{latestReading.total_kwh_consumed.toFixed(2)}</span>
        <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center"><MdOutlineElectricMeter className="mr-1" />kWh</span>
      </div>

      {/* Sub Value */}
      <div className="flex items-center space-x-2">
        <span className="w-6 h-6 rounded-full bg-success text-white flex items-center justify-center text-xs font-bold">{getCurrencySymbol(currency)}</span>
        <span className="text-blue-600 dark:text-blue-400 font-semibold text-lg">{parseFloat(latestReading.price.toFixed(2)).toFixed(2)}</span>
      </div>

      {/* Date & Time Pills */}
      <div className="flex flex-col items-center space-y-1">
        <span className="flex items-center px-3 py-1 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-xs font-medium">
          <FaCalendarAlt className="w-4 h-4 mr-1 text-gray-500 dark:text-gray-400" />
          {formatDate(latestReading.date)}
        </span>
        <span className="flex items-center px-3 py-1 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-xs font-medium">
          <FaClock className="w-4 h-4 mr-1 text-gray-500 dark:text-gray-400" />
          09:35 PM
        </span>
      </div>
    </div>
  )
} 