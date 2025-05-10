import { useState, useEffect } from 'react'
import axios from 'axios'
import { ChevronRightIcon, XMarkIcon, CurrencyDollarIcon, CalendarIcon, ClockIcon } from '@heroicons/react/24/outline'

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

export default function ConsumptionHistory() {
  const [readings, setReadings] = useState<MonthlyConsumption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedReading, setSelectedReading] = useState<MonthlyConsumption | null>(null)

  useEffect(() => {
    fetchReadings()
  }, [])

  const fetchReadings = async () => {
    try {
      const response = await axios.get('http://localhost:8000/monthly-consumption')
      
      // Sort readings by date (newest first) with safe date parsing
      const sortedReadings = response.data.sort((a: MonthlyConsumption, b: MonthlyConsumption) => {
        const dateA = safeParseDate(a.date);
        const dateB = safeParseDate(b.date);
        
        if (!dateA && !dateB) return 0;
        if (!dateA) return 1; // null dates go to the end
        if (!dateB) return -1;
        
        return dateB.getTime() - dateA.getTime();
      })
      
      setReadings(sortedReadings)
    } catch (err) {
      setError('Failed to fetch consumption history')
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleReadingClick = (reading: MonthlyConsumption) => {
    setSelectedReading(reading)
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

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center py-6">
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

  if (readings.length === 0) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 p-4 text-center text-gray-500 dark:text-gray-400 rounded-lg border border-gray-200 dark:border-gray-700">
        <p className="text-sm">No readings available yet</p>
        <p className="text-xs mt-1">Upload your first meter reading to get started</p>
      </div>
    )
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Date
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                kWh
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Price
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {readings.map((reading) => (
              <tr
                key={reading.label_file}
                className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 cursor-pointer"
                onClick={() => handleReadingClick(reading)}
              >
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-left">
                  {reading.date ? formatDate(reading.date) : 'Date unknown'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100 text-center">
                  {reading.total_kwh_consumed.toFixed(2)} kWh
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 text-center">
                  ${reading.price.toFixed(2)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReadingClick(reading);
                    }}
                    className="inline-flex items-center px-3 py-1 border border-primary-100 dark:border-primary-700 text-xs font-medium rounded-full text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 hover:bg-primary-100 dark:hover:bg-primary-800/30 transition-colors duration-150 focus:outline-none"
                  >
                    Details
                    <ChevronRightIcon className="ml-1 h-4 w-4" style={{ width: '1rem', height: '1rem' }} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Reading details modal */}
      {selectedReading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden">
            <div className="bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-800 dark:to-primary-900 text-white flex items-center justify-between p-4">
              <h3 className="text-base font-medium">Reading Details</h3>
              <button
                onClick={() => setSelectedReading(null)}
                className="text-white hover:text-primary-100 transition-colors duration-150"
              >
                <XMarkIcon className="h-5 w-5" style={{ width: '1.25rem', height: '1.25rem' }} />
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto">
              <div className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/30 rounded-lg p-4 mb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-4">
                  <div>
                    <p className="text-sm text-primary-700 dark:text-primary-300 uppercase font-medium">Consumption</p>
                    <p className="text-3xl font-bold text-primary-900 dark:text-primary-200">{selectedReading.total_kwh_consumed.toFixed(2)} <span className="text-xl font-medium">kWh</span></p>
                  </div>
                  <div className="flex items-center justify-center bg-white dark:bg-gray-700 p-3 rounded-lg shadow-sm mx-auto sm:mx-0">
                    <div className="flex items-center">
                      <CurrencyDollarIcon className="h-5 w-5 text-green-600 dark:text-green-400 mr-1" style={{ width: '1.25rem', height: '1.25rem' }} />
                      <span className="text-xl font-bold text-green-600 dark:text-green-400">${selectedReading.price.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Reading Date</span>
                  <div className="flex items-center">
                    <CalendarIcon className="h-4 w-4 text-primary-600 dark:text-primary-400 mr-1" style={{ width: '1rem', height: '1rem' }} />
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{formatDate(selectedReading.date)}</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Processed On</span>
                  <div className="flex items-center">
                    <ClockIcon className="h-4 w-4 text-secondary-600 dark:text-secondary-400 mr-1" style={{ width: '1rem', height: '1rem' }} />
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{formatDate(selectedReading.modified_date)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 border rounded-lg overflow-hidden border-gray-200 dark:border-gray-700">
                <div className="bg-gray-50 dark:bg-gray-700 p-1 border-b border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-center text-gray-600 dark:text-gray-400">Processed Image</p>
                </div>
                <div className="p-2 bg-white dark:bg-gray-800 flex items-center justify-center" style={{ height: '180px' }}>
                  <img
                    src={`http://localhost:8000/monthly-consumption/file/${selectedReading.label_file}`}
                    alt="Processed meter reading"
                    className="object-contain max-h-full"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = 'https://placehold.co/400x300?text=Image+Not+Available';
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
} 