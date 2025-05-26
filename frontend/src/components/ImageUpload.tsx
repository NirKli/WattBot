import { useRef, useState, useEffect } from 'react'
import { MdAddPhotoAlternate, MdClose, MdOutlineUploadFile } from 'react-icons/md'
import axios from 'axios'
import { API_URL } from '../config'

export default function ImageUpload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Clean up preview URL
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview)
      }
    }
  }, [preview])

  // Handle file selection (from input or drop)
  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed.');
      return;
    }
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
    setError(null);
  };

  // Handle file input change
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  // Handle drag and drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  // Remove selected image
  const removeImage = () => {
    if (preview) URL.revokeObjectURL(preview)
    setSelectedFile(null)
    setPreview(null)
    setError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // Upload image
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
      removeImage()
    } catch (err) {
      console.error('Upload error:', err)
      setError('Failed to process image. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full flex flex-col items-center p-4">
      {/* Upload Area */}
      {!preview ? (
        <div
          className="w-full max-w-md h-72 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-2xl bg-white dark:bg-gray-800 cursor-pointer transition-shadow hover:shadow-lg hover:bg-primary/10 focus:outline-none"
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          tabIndex={0}
          style={{ minHeight: 288 }}
        >
          <MdAddPhotoAlternate size={128} className="text-primary mb-4 transform scale-150" />
          <p className="text-primary font-medium mb-1 text-center">Select or drag an image to upload</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      ) : (
        <div className="w-full max-w-2xl flex flex-col items-center">
          <div className="relative w-full flex flex-col items-center">
            <img
              src={preview}
              alt="Preview"
              className="rounded-xl object-cover w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
              style={{ height: '600px' }}
            />
            <button
              onClick={removeImage}
              className="absolute top-2 right-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full p-1.5 shadow text-danger"
              aria-label="Remove image"
            >
              <MdClose size={18} />
            </button>
          </div>
          <button
            onClick={handleUpload}
            disabled={!selectedFile || loading}
            className={`mt-4 w-full py-3 rounded-full flex items-center justify-center text-white font-semibold transition-all ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-primary-dark'}`}
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading...
              </span>
            ) : (
              <span className="flex items-center">
                <MdOutlineUploadFile className="mr-2" size={24} /> Upload Image
              </span>
            )}
          </button>
        </div>
      )}
      {error && (
        <div className="mt-3 text-danger text-sm text-center bg-danger/10 border border-danger/30 rounded p-2">
          {error}
        </div>
      )}
      <div className="text-xs text-muted dark:text-gray-400 italic mt-2 text-center">
        Supported meter type: Digital only
      </div>
    </div>
  )
} 