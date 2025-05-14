import { useState, useEffect } from 'react'
import axios from 'axios'
// Import Material Design icons
import { MdArrowUpward, MdOutlineElectricMeter } from "react-icons/md";
import { FaCalendarAlt, FaClock, FaDollarSign } from "react-icons/fa";

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
      const apiBaseUrl = 'http://localhost:8000';
      const imageUrl = `${apiBaseUrl}/monthly-consumption/file/${latestReading.label_file}`;
      setLabelImageUrl(imageUrl);
    }
  }, [latestReading])

  const fetchLatestReading = async () => {
    try {
      const response = await axios.get('http://localhost:8000/monthly-consumption')
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
    <div className="flex flex-col items-center text-center w-full">
      {/* Display meter icon or labeled meter image */}
      {labelImageUrl ? (
        <div className="mb-6 w-full max-w-[240px] shadow rounded overflow-hidden">
          <img 
            src={labelImageUrl} 
            alt="Latest meter reading" 
            className="w-full object-contain"
          />
        </div>
      ) : (
        <div className="mb-6 w-full max-w-[240px] flex items-center justify-center h-[180px] bg-light rounded shadow-sm">
          <MdOutlineElectricMeter className="text-primary w-24 h-24 opacity-50" />
        </div>
      )}
      
      <div className="flex items-center justify-center mb-4 bg-light rounded-full py-2 px-4 shadow-sm">
        <MdArrowUpward className="text-primary mr-2 text-xl" />
        <p className="text-3xl font-medium text-primary">
          {latestReading.total_kwh_consumed.toFixed(2)}
        </p>
      </div>
      
      <p className="text-base text-muted mb-5 flex items-center justify-center">
        <MdOutlineElectricMeter className="text-muted mr-1" /> kWh
      </p>
      
      <div className="flex items-center justify-center mb-5 mt-2">
        <div className="w-6 h-6 rounded-full bg-success text-white flex items-center justify-center mr-2">
          <span className="text-white text-xs font-bold">{getCurrencySymbol(currency)}</span>
        </div>
        <p className="text-2xl font-medium text-primary">
          {parseFloat(latestReading.price.toFixed(2)).toFixed(2)}
        </p>
      </div>
      
      <div className="flex flex-col gap-2 mt-2">
        <p className="text-base text-muted flex items-center justify-center bg-light py-1 px-4 rounded-full shadow-sm">
          <FaCalendarAlt className="text-muted mr-2" />
          {formatDate(latestReading.date)}
        </p>
        
        <p className="text-base text-muted flex items-center justify-center bg-light py-1 px-4 rounded-full shadow-sm">
          <FaClock className="text-muted mr-2" />
          09:35 PM
        </p>
      </div>
    </div>
  )
} 