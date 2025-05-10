import { useState, useEffect } from 'react'
import axios from 'axios'
import { CalendarIcon, ClockIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline'

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
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-opacity-25 border-t-blue-500" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Latest Reading</h2>
        <div className="bg-red-50 text-red-700 p-4 rounded-md">
          <p className="text-sm">{error}</p>
        </div>
      </div>
    )
  }

  if (!latestReading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Latest Reading</h2>
        <div className="bg-gray-50 p-6 text-center text-gray-500 rounded-md">
          <p>No readings available yet</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 sm:p-6 border-b">
        <h2 className="text-xl font-semibold text-gray-800">Latest Reading</h2>
      </div>
      
      <div className="p-4 sm:p-6">
        {/* Reading Value */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <div className="text-4xl font-bold text-blue-900 mb-1">
            {latestReading?.total_kwh_consumed.toFixed(2) || "-"} kWh
          </div>
          <div className="flex items-center text-blue-700 mb-2">
            <CurrencyDollarIcon className="h-4 w-4 mr-1" style={{ width: '16px', height: '16px' }} />
            <span className="text-lg font-medium">${latestReading?.price.toFixed(2) || "-"}</span>
          </div>
          <div className="flex items-center space-x-4 text-blue-700">
            <div className="flex items-center text-sm">
              <CalendarIcon className="h-4 w-4 mr-1" style={{ width: '16px', height: '16px' }} />
              {latestReading?.date ? formatDate(latestReading.date) : 'Date unknown'}
            </div>
            <div className="flex items-center text-sm">
              <ClockIcon className="h-4 w-4 mr-1" style={{ width: '16px', height: '16px' }} />
              {latestReading?.date ? formatTime(latestReading.date) : 'Time unknown'}
            </div>
          </div>
        </div>

        {/* Reading Image */}
        <div className="border rounded-lg overflow-hidden">
          <div className="aspect-video bg-gray-100 relative">
            {latestReading ? (
              <img
                src={`http://localhost:8000/monthly-consumption/file/${latestReading.file_name}`}
                alt="Latest meter reading"
                className="object-contain w-full h-full"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = 'https://placehold.co/600x400?text=Image+Not+Available';
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">No image available</p>
              </div>
            )}
          </div>
          {latestReading && (
            <div className="p-3 bg-gray-50 border-t">
              <p className="text-xs text-gray-500">File: <span className="font-mono">{latestReading.file_name}</span></p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 