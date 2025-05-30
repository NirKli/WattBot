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
      <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-xl shadow text-center">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Upload Image</h2>

        <div className="mb-6 border-2 border-dashed border-gray-300 dark:border-gray-700 p-4 rounded-lg cursor-pointer">
          <label
              htmlFor="fileInput"
              className="block text-center cursor-pointer text-gray-600 dark:text-gray-300"
          >
            <p className="mb-2">Drag & drop or click to upload</p>
            <span className="text-blue-600 dark:text-blue-400 font-medium">Select Image</span>
          </label>
          <input
              id="fileInput"
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
          />
          {preview && (
              <div className="w-full flex justify-center mt-4">
                <div className="max-w-[20rem] max-h-[20rem] overflow-hidden rounded shadow border">
                  <img
                      src={preview}
                      alt="Preview"
                      className="w-full h-auto object-contain"
                  />
                </div>
              </div>
          )}
          {selectedFile && (
              <button
                  onClick={handleUpload}
                  disabled={loading}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {loading ? 'Uploading...' : 'Upload'}
              </button>
          )}
        </div>


        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Latest Reading</h3>
        {latestLoading ? (
            <p className="text-gray-500 dark:text-gray-400">Loading...</p>
        ) : latestReading && labelImageUrl ? (
            <>
              <div className="flex flex-col items-center space-y-1">
                <button onClick={() => setIsPreviewOpen(true)} className="focus:outline-none">
                  <img
                      src={`${API_URL}/monthly-consumption/file/${settings.debug_mode ? latestReading.label_file : latestReading.original_file}`}
                      alt="Detected"
                      className="mx-auto rounded border border-gray-300 dark:border-gray-600 shadow hover:opacity-90 transition max-w-[8rem] max-h-32 object-contain"
                  />
                </button>
                <div className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                  {latestReading.total_kwh_consumed.toFixed(2)} kWh
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDate(latestReading.date)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Monthly Cost: {getCurrencySymbol(settings.currency)}{latestReading.price.toFixed(2)}
                </div>
              </div>
              {isPreviewOpen && (
                  <div
                      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
                      onClick={() => setIsPreviewOpen(false)}
                  >
                    <img
                        src={`${API_URL}/monthly-consumption/file/${settings.debug_mode ? latestReading.label_file : latestReading.original_file}`}
                        alt="Full Preview"
                        className="max-w-[90vw] max-h-[90vh] object-contain rounded shadow-lg"
                        style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                        }}
                    />
                  </div>
              )}
            </>
        ) : (
            <p className="text-gray-500 dark:text-gray-400">No reading available.</p>
        )}
        {error && <p className="mt-4 text-red-500">{error}</p>}
      </div>
  );
}