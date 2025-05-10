import { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { ArrowUpTrayIcon, PhotoIcon } from '@heroicons/react/24/outline'
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
  const [fileName, setFileName] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [inputKey, setInputKey] = useState(Date.now())

  useEffect(() => {
    // Add styles to hide file inputs globally
    const style = document.createElement('style')
    style.innerHTML = `
      input[type="file"] {
        position: absolute !important;
        width: 1px !important;
        height: 1px !important;
        padding: 0 !important;
        margin: -1px !important;
        overflow: hidden !important;
        clip: rect(0, 0, 0, 0) !important;
        white-space: nowrap !important;
        border: 0 !important;
        opacity: 0.00001 !important;
        pointer-events: none !important;
        z-index: -9999 !important;
      }
      input[type="file"]::-webkit-file-upload-button {
        display: none !important;
      }
      input[type="file"]::file-selector-button {
        display: none !important;
      }
    `
    document.head.appendChild(style)
    
    // Capture any click events on the document and check if they're for native file inputs
    const preventNativeFileInputClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' && target.getAttribute('type') === 'file' && !target.hasAttribute('data-custom-upload')) {
        e.preventDefault()
        e.stopPropagation()
      }
    }
    
    document.addEventListener('click', preventNativeFileInputClick, true)
    
    return () => {
      document.head.removeChild(style)
      document.removeEventListener('click', preventNativeFileInputClick, true)
    }
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
      const response = await axios.post('http://localhost:8000/monthly-consumption', formData, {
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

  const resetFileInput = () => {
    setInputKey(Date.now())
  }

  const triggerFileInput = () => {
    // Use a custom event handling approach
    if (fileInputRef.current) {
      // Reset the input to clear previous selection
      resetFileInput()
      
      // Use a timeout to ensure DOM is updated
      setTimeout(() => {
        // Create a temporary clickable area for the file dialog only
        const dialogTrigger = document.createElement('input')
        dialogTrigger.type = 'file'
        dialogTrigger.accept = 'image/*'
        dialogTrigger.setAttribute('data-custom-upload', 'true')
        dialogTrigger.style.cssText = 'position:fixed;top:50%;left:50%;opacity:0;'
        
        // Add it to the DOM temporarily
        document.body.appendChild(dialogTrigger)
        
        // Handle file selection
        dialogTrigger.onchange = (e) => {
          const files = (e.target as HTMLInputElement).files
          if (files && files.length > 0) {
            // Manually trigger our handler with the selected file
            const changeEvent = {
              target: { files }
            } as unknown as React.ChangeEvent<HTMLInputElement>
            
            handleFileSelect(changeEvent)
          }
          
          // Remove the temporary input
          document.body.removeChild(dialogTrigger)
        }
        
        // Trigger click and handle cancellation
        dialogTrigger.click()
        
        // Clean up if dialog is canceled
        setTimeout(() => {
          if (document.body.contains(dialogTrigger)) {
            document.body.removeChild(dialogTrigger)
          }
        }, 1000)
      }, 10)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg w-full border border-gray-200 text-center">
      <div className="p-5 sm:p-6 text-center">
        <h2 className="text-xl font-semibold text-gray-800 text-center flex items-center justify-content-center gap-2">
          <PhotoIcon className="h-6 w-6 text-blue-500" style={{ width: '24px', height: '24px' }} />
          <span>Upload Meter Reading</span>
        </h2>
        
        <div className="mt-6 flex flex-col items-center justify-content-center w-full">
          {!preview ? (
            <div className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center bg-blue-50 flex flex-col items-center justify-content-center transition-all duration-200 hover:border-blue-400 hover:bg-blue-100 w-full">
              <div 
                className="cursor-pointer transition-all duration-300 hover:scale-110 bg-white rounded-full p-4 shadow-md mx-auto" 
                onClick={triggerFileInput}
                aria-label="Upload image"
                style={{ cursor: 'pointer' }}
              >
                <ArrowUpTrayIcon 
                  className="h-10 w-10 text-blue-500 hover:text-blue-600" 
                  style={{ width: '40px', height: '40px', cursor: 'pointer' }} 
                />
              </div>
              
              <p className="text-sm font-medium text-gray-700 mt-4 mb-2 text-center">Select an image to upload</p>
              <p className="text-xs text-gray-500 mb-4 text-center">JPG, PNG or JPEG</p>
              
              <input
                key={inputKey}
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="absolute -left-[9999px] opacity-0 invisible"
                tabIndex={-1}
                aria-hidden="true"
              />
            </div>
          ) : (
            <div className="rounded-lg overflow-hidden shadow-md w-full flex flex-col">
              <div className="relative rounded-lg overflow-hidden bg-gradient-to-b from-gray-100 to-gray-200 flex items-center justify-content-center" style={{ minHeight: '200px' }}>
                {preview && (
                  <>
                    <img
                      src={preview}
                      alt="Preview"
                      className="object-contain max-w-full mx-auto"
                      style={{ maxHeight: '200px', width: 'auto' }}
                      onError={(e) => {
                        console.error('Image failed to load');
                        setError('Failed to load image preview');
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://placehold.co/400x300?text=Preview+Error';
                      }}
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 backdrop-blur-sm text-white px-4 py-3 text-sm font-medium text-center">
                      {fileName}
                    </div>
                  </>
                )}
                {!preview && (
                  <div className="text-gray-500 text-center">Image preview unavailable</div>
                )}
                <button 
                  onClick={() => {
                    setPreview(null);
                    setSelectedFile(null);
                    setFileName(null);
                  }}
                  className="absolute top-3 right-3 bg-white bg-opacity-80 backdrop-blur-sm rounded-full p-1.5 text-gray-700 hover:text-gray-900 hover:bg-white shadow-sm transition-all duration-200"
                >
                  <XMarkIcon className="h-5 w-5" style={{ width: '20px', height: '20px' }} />
                </button>
              </div>

              <button
                onClick={handleUpload}
                disabled={loading}
                className={`w-full py-3 px-4 font-medium flex items-center justify-content-center transition-all duration-200 ${
                  loading 
                    ? 'bg-gray-300 text-gray-700 cursor-not-allowed' 
                    : 'bg-blue-500 text-white hover:bg-blue-600 shadow-md hover:shadow-lg'
                }`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 mr-3" style={{ width: '20px', height: '20px' }} viewBox="0 0 24 24">
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
            <div className="mt-4 bg-red-50 text-red-700 p-4 rounded-md flex items-center justify-content-center border border-red-200 shadow-sm text-center w-full">
              <ExclamationCircleIcon className="h-5 w-5 text-red-500 flex-shrink-0" style={{ width: '20px', height: '20px' }} />
              <p className="text-sm ml-3 text-center">{error}</p>
            </div>
          )}

          {result && (
            <div className="mt-6 rounded-lg overflow-hidden shadow-lg text-center w-full">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-5 py-4">
                <div className="flex items-center justify-content-center">
                  <CheckCircleIcon className="h-6 w-6 text-white flex-shrink-0" style={{ width: '24px', height: '24px' }} />
                  <h3 className="font-medium ml-2 text-lg">Reading Detected</h3>
                </div>
              </div>
              
              <div className="bg-white px-5 py-6 border-x border-b border-gray-200 rounded-b-lg text-center">
                <div className="flex flex-col gap-4 items-center justify-content-center">
                  <div className="bg-gray-50 rounded-md p-6 border border-gray-200 text-center w-full">
                    <p className="text-3xl font-bold text-gray-800 mb-2 text-center">{result.total_kwh_consumed?.toFixed(2) || "0.00"} <span className="text-lg font-medium text-gray-600">kWh</span></p>
                    <p className="text-lg text-gray-600 mb-2 text-center">${result.price?.toFixed(2) || "0.00"}</p>
                    <p className="text-sm text-gray-500 text-center">
                      {result.date ? new Date(result.date).toLocaleString() : 'Date unknown'}
                    </p>
                  </div>
                  
                  {/* Image preview section if available */}
                  {result.label_file && (
                    <div className="border rounded-lg overflow-hidden shadow-sm w-full">
                      <div className="bg-gradient-to-b from-gray-50 to-gray-100 relative flex items-center justify-content-center" style={{ height: '200px' }}>
                        <div className="p-2 w-full h-full flex items-center justify-content-center">
                          <img 
                            src={`http://localhost:8000/monthly-consumption/file/${result.label_file}`}
                            alt="Processed meter reading"
                            className="object-contain mx-auto"
                            style={{ maxHeight: '180px', width: 'auto' }}
                            onError={(e) => {
                              console.error('Processed image failed to load');
                              const target = e.target as HTMLImageElement;
                              target.onerror = null;
                              target.src = 'https://placehold.co/600x400?text=Image+Not+Available';
                            }}
                          />
                        </div>
                      </div>
                      <div className="p-3 bg-gray-50 border-t text-center">
                        <p className="text-xs text-gray-500">File: <span className="font-mono">{result.label_file}</span></p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 