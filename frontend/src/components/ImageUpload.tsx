import { useState } from 'react'
import axios from 'axios'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { ArrowUpTrayIcon } from '@heroicons/react/24/outline'
import { CheckCircleIcon } from '@heroicons/react/24/solid'
import { ExclamationCircleIcon } from '@heroicons/react/24/outline'

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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setPreview(URL.createObjectURL(file))
      setResult(null)
      setError(null)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append('file', selectedFile)

    try {
      const response = await axios.post('http://localhost:8000/monthly-consumption', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      setResult(response.data)
    } catch (err) {
      setError('Failed to process image. Please try again.')
      console.error('Upload error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden max-w-md mx-auto">
      <div className="p-4 sm:p-6">
        <h2 className="text-xl font-semibold text-gray-800 text-center">Upload Meter Reading</h2>
        
        <div className="mt-6">
          {!preview ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 mb-4">
                <ArrowUpTrayIcon className="h-5 w-5 text-blue-500" style={{ width: '20px', height: '20px' }} />
              </div>
              
              <p className="text-sm font-medium text-gray-700 mb-2">Select an image to upload</p>
              <p className="text-xs text-gray-500 mb-4">JPG, PNG or JPEG</p>
              
              <button
                onClick={() => document.getElementById('file-upload')?.click()}
                className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-md hover:bg-blue-600 focus:outline-none inline-flex items-center"
              >
                <ArrowUpTrayIcon className="h-4 w-4 mr-2" style={{ width: '16px', height: '16px' }} />
                Choose File
              </button>
              
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          ) : (
            <div>
              <div className="relative rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={preview}
                  alt="Preview"
                  className="object-contain w-full max-h-[300px]"
                />
                <button 
                  onClick={() => {
                    setPreview(null);
                    setSelectedFile(null);
                  }}
                  className="absolute top-2 right-2 bg-white bg-opacity-70 rounded-full p-1 text-gray-700 hover:text-gray-900"
                >
                  <XMarkIcon className="h-4 w-4" style={{ width: '16px', height: '16px' }} />
                </button>
              </div>

              <button
                onClick={handleUpload}
                disabled={loading}
                className={`mt-4 w-full py-2 px-4 rounded-md font-medium flex items-center justify-center ${
                  loading 
                    ? 'bg-gray-300 text-gray-700 cursor-not-allowed' 
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 mr-2" style={{ width: '16px', height: '16px' }} viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing...
                  </>
                ) : 'Process Image'}
              </button>
            </div>
          )}

          {error && (
            <div className="mt-4 bg-red-50 text-red-700 p-4 rounded-md flex">
              <ExclamationCircleIcon className="h-5 w-5 text-red-500 flex-shrink-0" style={{ width: '20px', height: '20px' }} />
              <p className="text-sm ml-3">{error}</p>
            </div>
          )}

          {result && (
            <div className="mt-4 bg-green-50 rounded-md p-4 flex">
              <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0" style={{ width: '20px', height: '20px' }} />
              <div className="ml-3">
                <h3 className="font-medium text-green-800">Reading Detected</h3>
                <div className="mt-2">
                  <p className="text-2xl font-bold text-green-900">{result.total_kwh_consumed} kWh</p>
                  <p className="text-base text-green-800">${result.price.toFixed(2)}</p>
                  <p className="text-sm text-green-700 mt-1">
                    {result.date ? new Date(result.date).toLocaleString() : 'Date unknown'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 