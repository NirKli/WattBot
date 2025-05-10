import { useState, useEffect } from 'react'
import axios from 'axios'
import { ChevronRightIcon, XMarkIcon, CurrencyDollarIcon, CalendarIcon, ClockIcon, DocumentTextIcon } from '@heroicons/react/24/outline'

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
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 text-center w-full">
        <div className="flex justify-content-center items-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-opacity-25 border-t-blue-500" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 text-center w-full">
        <div className="bg-red-50 text-red-700 p-4 rounded-md border border-red-200 text-center w-full">
          <p className="text-sm font-medium">{error}</p>
        </div>
      </div>
    )
  }

  if (readings.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 text-center w-full">
        <div className="flex items-center justify-content-center mb-4">
          <DocumentTextIcon className="h-6 w-6 text-blue-500 mr-2" style={{ width: '24px', height: '24px' }} />
          <h2 className="text-xl font-semibold text-gray-800">Consumption History</h2>
        </div>
        <div className="bg-gray-50 p-6 text-center text-gray-500 rounded-md border border-gray-200 w-full">
          <p className="text-lg">No readings available yet</p>
          <p className="text-sm mt-2">Upload your first meter reading to get started</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 text-center w-full">
        <div className="p-4 border-b border-gray-200 flex items-center justify-content-center">
          <DocumentTextIcon className="h-6 w-6 text-blue-500 mr-2" style={{ width: '24px', height: '24px' }} />
          <h2 className="text-xl font-semibold text-gray-800">Consumption History</h2>
        </div>
        
        <div className="overflow-x-auto p-4">
          <table className="min-w-full divide-y divide-gray-200 text-center">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  kWh
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {readings.map((reading) => (
                <tr
                  key={reading.label_file}
                  className="hover:bg-blue-50 transition-colors duration-150 cursor-pointer"
                  onClick={() => handleReadingClick(reading)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                    {reading.date ? formatDate(reading.date) : 'Date unknown'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-center">
                    {reading.total_kwh_consumed.toFixed(2)} kWh
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-center">
                    ${reading.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex justify-content-center">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReadingClick(reading);
                        }}
                        className="inline-flex items-center px-3 py-1.5 border border-blue-100 text-xs font-medium rounded-full text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Details
                        <ChevronRightIcon className="ml-1 h-4 w-4" style={{ width: '16px', height: '16px' }} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reading details modal */}
      {selectedReading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-content-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden text-center">
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white flex items-center justify-between p-5">
              <h3 className="text-lg font-medium">Reading Details</h3>
              <button
                onClick={() => setSelectedReading(null)}
                className="text-white hover:text-blue-100 transition-colors duration-150"
              >
                <XMarkIcon className="h-6 w-6" style={{ width: '24px', height: '24px' }} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto text-center">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-5 mb-6 text-center">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-content-center gap-4 text-center">
                  <div className="text-center">
                    <p className="text-sm text-blue-700 uppercase font-medium">Consumption</p>
                    <p className="text-4xl font-bold text-blue-900">{selectedReading.total_kwh_consumed.toFixed(2)} <span className="text-xl font-medium">kWh</span></p>
                  </div>
                  <div className="flex items-center justify-content-center bg-white p-3 rounded-lg shadow-sm mx-auto sm:mx-0 text-center">
                    <CurrencyDollarIcon className="h-6 w-6 text-green-600 mr-2" style={{ width: '24px', height: '24px' }} />
                    <span className="text-2xl font-bold text-gray-800">${selectedReading.price.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-center">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-center">
                  <div className="flex items-center justify-content-center text-blue-700 mb-2">
                    <CalendarIcon className="h-5 w-5 mr-2" style={{ width: '20px', height: '20px' }} />
                    <p className="text-sm font-medium">Date</p>
                  </div>
                  <p className="font-medium text-gray-800 text-center">
                    {selectedReading.date ? formatDate(selectedReading.date) : 'Date unknown'}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-center">
                  <div className="flex items-center justify-content-center text-blue-700 mb-2">
                    <ClockIcon className="h-5 w-5 mr-2" style={{ width: '20px', height: '20px' }} />
                    <p className="text-sm font-medium">Time</p>
                  </div>
                  <p className="font-medium text-gray-800 text-center">
                    {selectedReading.date ? 
                      (safeParseDate(selectedReading.date)?.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) || 'Time unknown') : 
                      'Time unknown'}
                  </p>
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-gray-700 font-medium mb-3 flex items-center justify-content-center">
                  <DocumentTextIcon className="h-5 w-5 text-blue-600 mr-2" style={{ width: '20px', height: '20px' }} />
                  Meter Image
                </p>
                <div className="border rounded-lg overflow-hidden shadow-sm mx-auto">
                  <div className="bg-gradient-to-b from-gray-50 to-gray-100 p-3 flex items-center justify-content-center" style={{ height: '180px' }}>
                    <img
                      src={`http://localhost:8000/monthly-consumption/file/${selectedReading.label_file}`}
                      alt="Meter reading"
                      className="object-contain mx-auto"
                      style={{ maxHeight: '160px', width: 'auto' }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = 'https://placehold.co/600x400?text=Image+Not+Available';
                      }}
                    />
                  </div>
                  <div className="bg-gray-50 px-3 py-2 border-t text-center">
                    <p className="text-xs text-gray-500">File ID: <span className="font-mono">{selectedReading.label_file}</span></p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-200 p-4 flex justify-content-center bg-gray-50">
              <button 
                onClick={() => setSelectedReading(null)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
} 