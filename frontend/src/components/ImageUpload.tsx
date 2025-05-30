import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';


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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [latestReading, setLatestReading] = useState<MonthlyConsumption | null>(null);
  const [latestLoading, setLatestLoading] = useState(true);
  const [labelImageUrl, setLabelImageUrl] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [settings, setSettings] = useState<{ currency: string; debug_mode: boolean }>({
    currency: 'ils',
    debug_mode: false,
  });

  // Add drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const getCurrencySymbol = (code: string): string => {
    switch (code.toLowerCase()) {
      case 'usd': return '$';
      case 'eur': return '€';
      case 'ils': return '₪';
      case 'gbp': return '£';
      default: return code.toUpperCase();
    }
  };



  useEffect(() => {
    fetchLatestReading();
  }, []);

  useEffect(() => {
    if (latestReading?.label_file) {
      setLabelImageUrl(`${API_URL}/monthly-consumption/file/${latestReading.label_file}`);
    }
  }, [latestReading]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsPreviewOpen(false);
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, []);

  useEffect(() => {
    axios.get(`${API_URL}/settings`)
        .then(response => {
          setSettings({
            currency: response.data.currency || 'ils',
            debug_mode: response.data.debug_mode || false
          });
        })
        .catch(() => {
          console.warn('Failed to fetch currency setting');
        });
  }, []);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed.');
      return;
    }
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
    setError(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      await axios.post(`${API_URL}/monthly-consumption`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      fetchLatestReading();
      setSelectedFile(null);
      setPreview(null);
    } catch {
      setError('Failed to process image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchLatestReading = async () => {
    setLatestLoading(true);
    try {
      const response = await axios.get(`${API_URL}/monthly-consumption`);
      const readings = response.data;
      if (readings.length > 0) {
        const sorted = readings.sort((a: MonthlyConsumption, b: MonthlyConsumption) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setLatestReading(sorted[0]);
      }
    } catch {
      setLatestReading(null);
    } finally {
      setLatestLoading(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
      <div className="max-w-3xl mx-auto p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-lg">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Upload Meter Reading</h2>
          {latestReading && (
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Last updated: {formatDate(latestReading.date)}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="space-y-6">
            <div 
              className={`relative border-2 border-dashed rounded-xl transition-all duration-200 ${
                selectedFile 
                  ? 'border-primary/50 bg-primary/5 dark:bg-primary/10' 
                  : 'border-gray-200 dark:border-gray-700 hover:border-primary/30'
              }`}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <div className="p-8">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-colors ${
                    selectedFile 
                      ? 'bg-primary/20 dark:bg-primary/30' 
                      : 'bg-gray-100 dark:bg-gray-800'
                  }`}>
                    <svg className={`w-10 h-10 ${selectedFile ? 'text-primary' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                      {selectedFile ? 'Image Selected' : 'Drop your image here'}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {selectedFile ? selectedFile.name : 'or click to browse'}
                    </p>
                  </div>

                  <label
                    htmlFor="fileInput"
                    className="inline-flex items-center px-4 py-2 bg-gray-800 dark:bg-gray-700 text-white rounded-lg text-sm font-medium hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Select Image
                  </label>
                  <input
                    id="fileInput"
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>

                {preview && (
                  <div className="mt-6">
                    <div className="relative max-w-[20rem] mx-auto rounded-lg overflow-hidden shadow-lg">
                      <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-auto object-contain"
                      />
                      <button
                        onClick={() => {
                          setSelectedFile(null);
                          setPreview(null);
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-white/90 dark:bg-gray-800/90 rounded-full shadow hover:bg-white dark:hover:bg-gray-800 transition-colors"
                        aria-label="Remove image"
                      >
                        <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    
                    <button
                      onClick={handleUpload}
                      disabled={loading}
                      className="mt-4 w-full inline-flex items-center justify-center px-6 py-3 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Processing...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                          Upload Reading
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Latest Reading Section */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Latest Reading</h3>
            {latestLoading ? (
              <div className="flex items-center justify-center py-12">
                <svg className="animate-spin h-8 w-8 text-primary" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
            ) : latestReading && labelImageUrl ? (
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6">
                <div className="flex flex-col items-center space-y-6">
                  <button onClick={() => setIsPreviewOpen(true)} className="group">
                    <div className="relative">
                      <img
                        src={`${API_URL}/monthly-consumption/file/${settings.debug_mode ? latestReading.label_file : latestReading.original_file}`}
                        alt="Detected"
                        className="rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 max-w-[16rem] max-h-64 object-contain group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg" />
                    </div>
                  </button>

                  <div className="w-full space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Consumption</div>
                        <div className="text-2xl font-bold text-primary">
                          {latestReading.total_kwh_consumed.toFixed(2)} kWh
                        </div>
                      </div>
                      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Cost</div>
                        <div className="text-2xl font-bold text-primary">
                          {getCurrencySymbol(settings.currency)}{latestReading.price.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-8 text-center">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">No reading available</p>
                <p className="text-sm text-gray-400 dark:text-gray-500">Upload your first meter reading to get started</p>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        {isPreviewOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/90"
            onClick={() => setIsPreviewOpen(false)}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div 
                className="relative max-w-[90vw] max-h-[90vh]"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <img
                  src={`${API_URL}/monthly-consumption/file/${settings.debug_mode ? latestReading?.label_file : latestReading?.original_file}`}
                  alt="Full Preview"
                  className="w-full h-full object-contain rounded-xl shadow-2xl"
                />
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsPreviewOpen(false);
                  }}
                  className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
  );
}