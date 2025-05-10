import { useState, useRef, useEffect } from 'react'
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
    <div className="w-full">
      <div className="flex flex-col items-center justify-center w-full">
        {!preview ? (
          <div className="border-2 border-dashed border-accent-300 dark:border-accent-700 rounded-lg p-6 text-center bg-gradient-to-br from-accent-50 to-accent-100/50 dark:from-accent-900/30 dark:to-accent-800/20 flex flex-col items-center justify-center transition-all duration-200 hover:border-accent-400 dark:hover:border-accent-600 hover:bg-accent-100/60 dark:hover:bg-accent-900/40 w-full">
            <div 
              className="cursor-pointer transition-all duration-300 hover:scale-110 bg-white dark:bg-gray-700 rounded-full p-4 shadow-md hover:shadow-accent-200 dark:hover:shadow-accent-900/50" 
              onClick={triggerFileInput}
              aria-label="Upload image"
            >
              <ArrowUpTrayIcon 
                className="h-8 w-8 text-accent-500 hover:text-accent-600 dark:text-accent-400" 
                style={{ width: '2rem', height: '2rem' }}
              />
            </div>
            
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-4 mb-1">Select an image to upload</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">JPG, PNG or JPEG</p>
            
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
          <div className="rounded-lg overflow-hidden shadow w-full flex flex-col">
            <div className="flex flex-col relative">
              <div className="bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center relative" style={{ height: '200px' }}>
                {preview && (
                  <img
                    src={preview}
                    alt="Preview"
                    className="object-contain h-full p-2 max-w-full"
                    style={{ zIndex: 1 }}
                    onError={(e) => {
                      console.error('Image failed to load');
                      setError('Failed to load image preview');
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://placehold.co/400x300?text=Preview+Error';
                    }}
                  />
                )}
              </div>
              
              <button 
                onClick={() => {
                  setPreview(null);
                  setSelectedFile(null);
                  setFileName(null);
                }}
                className="absolute top-2 right-2 bg-white dark:bg-gray-700 bg-opacity-90 backdrop-blur-sm rounded-full p-1.5 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-white dark:hover:bg-gray-600 shadow-sm transition-all duration-200"
                style={{ zIndex: 50 }}
                aria-label="Remove image"
              >
                <XMarkIcon className="h-4 w-4" style={{ width: '1rem', height: '1rem' }} />
              </button>
              
              {fileName && (
                <div className="bg-gray-100 dark:bg-gray-700 px-3 py-2 text-xs font-medium text-gray-800 dark:text-gray-200 border-t border-gray-200 dark:border-gray-600 truncate">
                  {fileName}
                </div>
              )}
            </div>

            <button
              onClick={handleUpload}
              disabled={loading}
              className={`w-full py-3 px-4 font-medium flex items-center justify-center transition-all duration-200 ${
                loading 
                  ? 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-accent-500 to-primary-500 hover:from-accent-600 hover:to-primary-600 dark:from-accent-600 dark:to-primary-600 dark:hover:from-accent-700 dark:hover:to-primary-700 text-white shadow hover:shadow-md'
              }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-gray-700 dark:text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" style={{ width: '1.25rem', height: '1.25rem' }}>
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                'Process Image'
              )}
            </button>
          </div>
        )}

        {error && (
          <div className="mt-3 flex items-center justify-center text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2 w-full">
            <ExclamationCircleIcon className="h-4 w-4 mr-1" style={{ width: '1rem', height: '1rem' }} />
            {error}
          </div>
        )}

        {result && (
          <div className="mt-4 w-full">
            <div className="flex items-center justify-center mb-2 text-green-600 dark:text-green-400">
              <CheckCircleIcon className="h-5 w-5 mr-1" style={{ width: '1.25rem', height: '1.25rem' }} />
              <span className="font-medium text-sm">Reading processed successfully!</span>
            </div>
            
            <div className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-gray-600 dark:text-gray-400 text-left font-medium">Reading Date:</div>
                <div className="text-primary-600 dark:text-primary-400 font-semibold text-right">{result.date}</div>
                
                <div className="text-gray-600 dark:text-gray-400 text-left font-medium">Consumption:</div>
                <div className="text-accent-600 dark:text-accent-400 font-semibold text-right">{result.total_kwh_consumed} kWh</div>
                
                <div className="text-gray-600 dark:text-gray-400 text-left font-medium">Estimated Price:</div>
                <div className="text-green-600 dark:text-green-400 font-semibold text-right">${result.price?.toFixed(2)}</div>
              </div>
            </div>
            
            <button
              onClick={() => {
                setPreview(null);
                setSelectedFile(null);
                setFileName(null);
                setResult(null);
              }}
              className="mt-3 py-2 px-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-600 dark:hover:to-gray-700 transition-colors duration-200 w-full font-medium shadow-sm text-sm"
            >
              Upload Another Image
            </button>
          </div>
        )}
      </div>
    </div>
  )
} 