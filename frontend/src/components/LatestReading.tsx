import { useState, useEffect } from 'react'
import axios from 'axios'
import { CalendarIcon, ClockIcon, CurrencyDollarIcon, BoltIcon } from '@heroicons/react/24/outline'

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
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 text-center w-full">
        <div className="flex items-center justify-content-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-opacity-25 border-t-blue-500" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 text-center w-full">
        <div className="flex items-center justify-content-center mb-4">
          <BoltIcon className="h-6 w-6 text-blue-500 mr-2" style={{ width: '24px', height: '24px' }} />
          <h2 className="text-xl font-semibold text-gray-800">Latest Reading</h2>
        </div>
        <div className="bg-red-50 text-red-700 p-4 rounded-md border border-red-200 text-center w-full">
          <p className="text-sm">{error}</p>
        </div>
      </div>
    )
  }

  if (!latestReading) {
    return (
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 text-center w-full">
        <div className="flex items-center justify-content-center mb-4">
          <BoltIcon className="h-6 w-6 text-blue-500 mr-2" style={{ width: '24px', height: '24px' }} />
          <h2 className="text-xl font-semibold text-gray-800">Latest Reading</h2>
        </div>
        <div className="bg-gray-50 p-6 text-center text-gray-500 rounded-md border border-gray-200 w-full">
          <p className="text-lg">No readings available yet</p>
          <p className="text-sm mt-2">Upload your first meter reading to get started</p>
        </div>
      </div>
    )
  }

  return (
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 text-center w-full h-full flex flex-col justify-content-center">
      <div className="p-4 border-b border-gray-200 flex items-center justify-content-center">
        <BoltIcon className="h-6 w-6 text-blue-500 mr-2" style={{ width: '24px', height: '24px' }} />
        <h2 className="text-xl font-semibold text-gray-800">Latest Reading</h2>
      </div>
      
      <div className="p-4 text-center">
        {/* Reading Value */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 mb-4 text-center w-full">
          <div className="text-3xl font-bold text-blue-900 mb-2 text-center">
            {latestReading?.total_kwh_consumed.toFixed(2) || "-"} 
            <span className="text-xl font-medium ml-1">kWh</span>
          </div>
          <div className="flex items-center justify-content-center text-gray-700 mb-4">
            <CurrencyDollarIcon className="h-5 w-5 mr-1 text-green-600" style={{ width: '20px', height: '20px' }} />
            <span className="text-lg font-medium">${latestReading?.price.toFixed(2) || "-"}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-content-center sm:space-x-4 text-gray-600 text-center">
            <div className="flex items-center justify-content-center text-sm mb-1 sm:mb-0">
              <CalendarIcon className="h-4 w-4 mr-1 text-blue-600" style={{ width: '16px', height: '16px' }} />
              {latestReading?.date ? formatDate(latestReading.date) : 'Date unknown'}
            </div>
            <div className="flex items-center justify-content-center text-sm">
              <ClockIcon className="h-4 w-4 mr-1 text-blue-600" style={{ width: '16px', height: '16px' }} />
              {latestReading?.date ? formatTime(latestReading.date) : 'Time unknown'}
            </div>
          </div>
        </div>

        {/* Reading Image */}
        <div className="border rounded-lg overflow-hidden shadow-sm w-full">
          <div className="bg-gradient-to-b from-gray-50 to-gray-100 relative flex items-center justify-content-center" style={{ height: '180px' }}>
            {latestReading ? (
              <div className="p-2 w-full h-full flex items-center justify-content-center">
                <img
                  src={`http://localhost:8000/monthly-consumption/file/${latestReading.label_file}`}
                  alt="Latest meter reading"
                  className="object-contain mx-auto"
                  style={{ maxHeight: '160px', width: 'auto' }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = 'https://placehold.co/600x400?text=Image+Not+Available';
                  }}
                />
              </div>
            ) : (
              <div className="flex items-center justify-content-center h-full text-center">
                <p className="text-gray-500">No image available</p>
              </div>
            )}
          </div>
          {latestReading && (
            <div className="p-2 bg-gray-50 border-t text-center">
              <p className="text-xs text-gray-500">File: <span className="font-mono">{latestReading.label_file}</span></p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 