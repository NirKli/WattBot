import { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import { MdOutlineUploadFile, MdClose, MdAddPhotoAlternate, MdRestartAlt, MdDone, MdInfo, MdCalendarMonth, MdElectricalServices, MdAttachMoney } from 'react-icons/md'
import { API_URL } from '../config'

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

export default function ImageUpload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [result, setResult] = useState<MonthlyConsumption | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [inputKey, setInputKey] = useState(Date.now())
  const [currency, setCurrency] = useState('USD')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Clean up preview URL
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview)
      }
    }
  }, [preview])

  useEffect(() => {
    // Get currency from localStorage
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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setFileName(file.name)
      
      try {
        const previewUrl = URL.createObjectURL(file)
        setPreview(previewUrl)
        setResult(null)
        setError(null)
      } catch (err) {
        console.error('Error creating preview:', err)
        setError('Failed to create image preview')
      }
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append('file', selectedFile)

    try {
      console.log('Sending request to backend...')
      const response = await axios.post(`${API_URL}/monthly-consumption`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      console.log('Response received:', response.data)
      
      // Backend now returns proper JSON
      setResult(response.data)
    } catch (err) {
      console.error('Upload error:', err)
      setError('Failed to process image. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const resetSelection = () => {
    if (preview) {
      URL.revokeObjectURL(preview)
    }
    setPreview(null)
    setSelectedFile(null)
    setFileName(null)
    setError(null)
    // Reset the input by changing its key
    setInputKey(Date.now())
  }

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  // Format date helper for display
  function formatDate(dateString: string): string {
    if (!dateString) return 'N/A'
    
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return 'Invalid date'
      }
      
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(date)
    } catch (e) {
      console.error('Error formatting date:', e)
      return 'Invalid date'
    }
  }

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

  return (
    <div className="text-center w-full">
      {!preview && !result ? (
        <>
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded p-6 mb-4 border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-primary dark:text-blue-400 mb-1">
              Select an image to upload
            </p>
            <p className="text-xs text-muted dark:text-gray-400 mb-4">
              PNG or JPG format
            </p>
            <button
              onClick={triggerFileInput}
              className="btn btn-primary inline-flex items-center text-sm py-3 px-6 rounded-full"
            >
              <MdAddPhotoAlternate className="mr-2" size={24} /> Browse Files
            </button>
            <input
              key={inputKey}
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
          <div className="text-xs text-muted dark:text-gray-400 italic">
            Supported meter types: Digital, Analog
          </div>
        </>
      ) : (
        <div className="w-full max-w-sm mx-auto">
          {preview && !result && (
            <div className="mb-6">
              <div className="relative rounded overflow-hidden shadow bg-gray-100 dark:bg-gray-700">
                <img 
                  src={preview} 
                  alt="Preview" 
                  className="w-full object-contain max-h-48" 
                />
                <button
                  onClick={() => {
                    resetSelection();
                  }}
                  className="absolute top-2 right-2 bg-white dark:bg-gray-800 shadow text-danger rounded-full p-1.5 text-sm border border-gray-200 dark:border-gray-700"
                >
                  <MdClose size={16} />
                </button>
              </div>
              {fileName && (
                <p className="mt-3 text-center text-sm text-primary dark:text-blue-400 flex items-center justify-center bg-gray-100 dark:bg-gray-700 py-2 px-4 rounded-full mx-auto w-fit">
                  <MdOutlineUploadFile className="mr-2" size={20} /> {fileName}
                </p>
              )}
              <div className="flex flex-col sm:flex-row gap-2 mt-4">
                <button
                  onClick={handleUpload}
                  disabled={loading}
                  className={`flex-1 py-3 text-sm rounded-full flex items-center justify-center transition-all ${
                    loading 
                      ? 'bg-gray-400 text-white cursor-not-allowed' 
                      : 'btn-primary'
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <MdOutlineUploadFile className="mr-2" size={24} /> Process Image
                    </span>
                  )}
                </button>
                <button
                  onClick={() => {
                    resetSelection();
                    triggerFileInput();
                  }}
                  disabled={loading}
                  className="py-3 px-4 text-sm rounded-full flex items-center justify-center transition-all btn-outline-secondary"
                >
                  <MdAddPhotoAlternate className="mr-2" size={20} /> Choose Different
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-3 p-4 text-sm bg-danger/10 border border-danger/30 text-danger rounded">
              <p className="flex items-center justify-center">
                <span className="bg-danger/20 rounded-full p-1 mr-2">
                  <MdClose className="text-danger" size={20} />
                </span>
                {error}
              </p>
              <button
                onClick={() => {
                  resetSelection();
                  triggerFileInput();
                }}
                className="mt-3 px-4 py-2 text-sm rounded-full flex items-center justify-center mx-auto btn-outline-secondary"
              >
                <MdAddPhotoAlternate className="mr-2" size={20} /> Select Another Image
              </button>
            </div>
          )}

          {result && (
            <div className="mt-4 bg-success/10 p-6 rounded border border-success/30">
              <div className="flex items-center justify-center text-success mb-3">
                <div className="bg-success text-white rounded-full p-2 mr-2">
                  <MdDone size={28} />
                </div>
                <p className="text-lg font-medium">Processing Complete</p>
              </div>
              
              {/* New: Display response details */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 my-4 border border-gray-200 dark:border-gray-700">
                <h3 className="text-primary dark:text-blue-400 font-medium mb-3 text-sm uppercase flex items-center justify-center">
                  <MdInfo className="mr-1" /> Reading Details
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300 flex items-center">
                      <MdCalendarMonth className="mr-1.5 text-primary dark:text-blue-400" /> Date
                    </span>
                    <span className="font-medium">{formatDate(result.date)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300 flex items-center">
                      <MdElectricalServices className="mr-1.5 text-primary dark:text-blue-400" /> Consumption
                    </span>
                    <span className="font-medium">{result.total_kwh_consumed} kWh</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300 flex items-center">
                      <MdAttachMoney className="mr-1.5 text-primary dark:text-blue-400" /> Cost
                    </span>
                    <span className="font-medium">{getCurrencySymbol(currency)}{result.price.toFixed(2)}</span>
                  </div>
                </div>
                <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
                  Saved successfully to your consumption history
                </div>
              </div>
              
              <button
                onClick={() => {
                  resetSelection();
                  triggerFileInput();
                }}
                className="mt-3 py-3 px-6 text-sm btn-primary rounded-full flex items-center justify-center mx-auto"
              >
                <MdRestartAlt className="mr-2" size={24} /> Upload Another Image
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
} 