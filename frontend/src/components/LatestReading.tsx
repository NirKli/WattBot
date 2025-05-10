import { useState, useEffect } from 'react'
import axios from 'axios'
import { CalendarIcon, ClockIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline'
import { BoltIcon } from '@heroicons/react/24/solid'

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

  useEffect(() => {
    fetchLatestReading()
  }, [])

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

  // Update the formatDate function
  const formatDate = (dateString: string | undefined): string => {
    const date = safeParseDate(dateString);
    if (!date) return 'Invalid date';
    
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  // Update the formatTime function
  const formatTime = (dateString: string | undefined): string => {
    const date = safeParseDate(dateString);
    if (!date) return 'Invalid time';
    
    return date.toLocaleTimeString([], { 
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center py-6">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-opacity-25 border-t-primary-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg border border-red-200 dark:border-red-800 text-center">
        <p className="text-sm">{error}</p>
      </div>
    )
  }

  if (!latestReading) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 p-4 text-center text-gray-500 dark:text-gray-400 rounded-lg border border-gray-200 dark:border-gray-700">
        <p className="text-sm">No readings available yet</p>
        <p className="text-xs mt-1">Upload your first meter reading to get started</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Reading Value and Price */}
      <div className="bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/30 dark:to-secondary-900/30 rounded-lg p-3 text-center shadow-sm">
        <div className="text-2xl font-bold text-primary-900 dark:text-primary-200">
          {latestReading?.total_kwh_consumed.toFixed(2) || "-"} 
          <span className="text-lg font-medium ml-1">kWh</span>
        </div>
        <div className="flex items-center justify-center text-gray-700 dark:text-gray-300 mt-1">
          <div className="p-1 bg-green-100 dark:bg-green-900/30 rounded-full mr-1">
            <CurrencyDollarIcon className="h-4 w-4 text-green-600 dark:text-green-400" style={{ width: '1rem', height: '1rem' }} />
          </div>
          <span className="text-base font-medium text-green-600 dark:text-green-400">${latestReading?.price.toFixed(2) || "-"}</span>
        </div>
        <div className="flex items-center justify-center text-sm mt-2 bg-white dark:bg-gray-800 px-3 py-1 rounded-full shadow-sm mx-auto w-fit">
          <CalendarIcon className="h-4 w-4 mr-1 text-primary-600 dark:text-primary-400" style={{ width: '1rem', height: '1rem' }} />
          {latestReading?.date ? formatDate(latestReading.date) : 'Date unknown'}
        </div>
      </div>

      {/* Reading Image */}
      <div className="border rounded-lg overflow-hidden shadow-sm border-gray-200 dark:border-gray-700">
        <div className="bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center" style={{ height: '140px' }}>
          {latestReading ? (
            <img
              src={`http://localhost:8000/monthly-consumption/file/${latestReading.label_file}`}
              alt="Latest meter reading"
              className="object-contain mx-auto h-full p-2"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = 'https://placehold.co/400x300?text=Image+Not+Available';
              }}
            />
          ) : (
            <div className="text-gray-500 dark:text-gray-400 text-center text-sm">No image available</div>
          )}
        </div>
        {latestReading && (
          <div className="p-1 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-t border-gray-200 dark:border-gray-700 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{latestReading.file_name || latestReading.label_file}</p>
          </div>
        )}
      </div>
    </div>
  )
} 