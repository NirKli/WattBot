import { useState, useEffect } from 'react'
import axios from 'axios'
import { ChevronRightIcon, XMarkIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline'

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
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-opacity-25 border-t-blue-500" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="bg-red-50 text-red-700 p-4 rounded-md">
          <p className="text-sm font-medium">{error}</p>
        </div>
      </div>
    )
  }

  if (readings.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Consumption History</h2>
        <div className="bg-gray-50 p-6 text-center text-gray-500 rounded-md">
          <p>No readings available yet</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Consumption History</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  kWh
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {readings.map((reading) => (
                <tr
                  key={reading.file_name}
                  className="hover:bg-gray-50 cursor-pointer"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {reading.date ? formatDate(reading.date) : 'Date unknown'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {reading.total_kwh_consumed.toFixed(2)} kWh
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    ${reading.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <button 
                      onClick={() => handleReadingClick(reading)}
                      className="inline-flex items-center px-2.5 py-1.5 border border-blue-100 text-xs font-medium rounded text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Details
                      <ChevronRightIcon className="ml-1.5 h-4 w-4" style={{ width: '16px', height: '16px' }} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reading details modal */}
      {selectedReading && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-medium text-gray-900">Reading Details</h3>
              <button
                onClick={() => setSelectedReading(null)}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-5 w-5" style={{ width: '20px', height: '20px' }} />
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto">
              <div className="bg-blue-50 rounded-md p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-700 uppercase font-medium">Consumption</p>
                    <p className="text-3xl font-bold text-blue-900">{selectedReading.total_kwh_consumed.toFixed(2)} kWh</p>
                  </div>
                  <div className="flex items-center bg-blue-100 p-2 rounded-lg">
                    <CurrencyDollarIcon className="h-5 w-5 text-blue-700 mr-1" style={{ width: '20px', height: '20px' }} />
                    <span className="text-xl font-bold text-blue-800">${selectedReading.price.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium">
                    {selectedReading.date ? formatDate(selectedReading.date) : 'Date unknown'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Time</p>
                  <p className="font-medium">
                    {selectedReading.date ? 
                      (safeParseDate(selectedReading.date)?.toLocaleTimeString() || 'Time unknown') : 
                      'Time unknown'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Last Modified</p>
                  <p className="font-medium">
                    {selectedReading.modified_date ? 
                      (safeParseDate(selectedReading.modified_date)?.toLocaleString() || 'Unknown') : 
                      'Unknown'}
                  </p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-700 font-medium mb-2">Meter Image</p>
                <div className="border rounded-md overflow-hidden bg-gray-50">
                  <img
                    src={`http://localhost:8000/monthly-consumption/file/${selectedReading.file_name}`}
                    alt="Meter reading"
                    className="w-full object-contain max-h-60"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = 'https://placehold.co/600x400?text=Image+Not+Available';
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">File: {selectedReading.file_name}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
} 