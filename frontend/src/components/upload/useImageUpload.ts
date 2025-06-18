import { useState, useEffect } from 'react';
import { API_URL } from '../../config';
import type { MonthlyConsumption } from './types';

export function useImageUpload() {
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [latestReading, setLatestReading] = useState<MonthlyConsumption | null>(null);
    const [currency, setCurrency] = useState('USD');
    const [cropDialogOpen, setCropDialogOpen] = useState(false);
    const [imageToCrop, setImageToCrop] = useState<string | null>(null);

    useEffect(() => {
        fetchSettings();
        fetchLatestReading();
    }, []);

    useEffect(() => {
        const handleCurrencyChange = (e: CustomEvent) => {
            setCurrency(e.detail);
        };

        window.addEventListener('currencyChange' as any, handleCurrencyChange);
        return () => {
            window.removeEventListener('currencyChange' as any, handleCurrencyChange);
        };
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await fetch(`${API_URL}/settings`);
            const data = await response.json();
            setCurrency(data.currency);
        } catch (error) {
            console.error('Error fetching settings:', error);
        }
    };

    const handleFile = (file: File) => {
        if (file.type.startsWith('image/')) {
            setFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(`${API_URL}/monthly-consumption`, {
                method: 'POST',
                body: formData,
            });

            if (response.status === 422) {
                // Open crop dialog with preview image
                if (previewUrl) {
                    setImageToCrop(previewUrl);
                    setCropDialogOpen(true);
                }
                throw new Error('422: Meter not detected. Please crop the meter area.');
            }

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            setFile(null);
            setPreviewUrl(null);
            fetchLatestReading();
        } catch (error) {
            console.error('Error uploading file:', error);
        } finally {
            setIsUploading(false);
        }
    };

    // Handler for when cropping is complete
    const handleCropComplete = async (croppedBlob: Blob) => {
        setCropDialogOpen(false);
        
        // Use the original filename or a default one
        const fileName = file?.name || 'cropped.jpg';
        
        // Update state
        setFile(null); // Clear file, since we're uploading directly
        
        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(croppedBlob);

        // Upload the cropped blob as a file
        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', croppedBlob, fileName);
        console.log('Uploading cropped blob as file:', croppedBlob, 'with name:', fileName);
        try {
            const response = await fetch(`${API_URL}/monthly-consumption`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Upload failed after cropping');
            }

            setFile(null);
            setPreviewUrl(null);
            fetchLatestReading();
        } catch (error) {
            console.error('Error uploading cropped file:', error);
        } finally {
            setIsUploading(false);
        }
    };

    const handleCropDialogClose = () => {
        setCropDialogOpen(false);
    };

    const fetchLatestReading = async () => {
        try {
            const response = await fetch(`${API_URL}/monthly-consumption/latest`);
            const data = await response.json();
            setLatestReading(data);
        } catch (error) {
            console.error('Error fetching latest reading:', error);
        }
    };

    // Format date for display using user's OS/browser locale
    const formatDate = (dateStr?: string) => {
        if (!dateStr) return 'Not available';
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return 'Invalid date';
            return new Intl.DateTimeFormat(navigator.language, {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
            }).format(date);
        } catch (e) {
            return 'Invalid date';
        }
    };

    const getCurrencySymbol = (code: string): string => {
        const symbols: { [key: string]: string } = {
            USD: '$',
            EUR: '€',
            GBP: '£',
            ILS: '₪'
        };
        return symbols[code] || code;
    };

    return {
        file,
        previewUrl,
        isUploading,
        latestReading,
        currency,
        handleFileSelect,
        handleDragOver,
        handleDrop,
        handleUpload,
        formatDate,
        getCurrencySymbol,
        // Cropping
        cropDialogOpen,
        imageToCrop,
        handleCropComplete,
        handleCropDialogClose
    };
} 