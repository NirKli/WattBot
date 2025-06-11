import React, {useEffect, useRef, useState} from 'react';
import axios from 'axios';
import {API_URL} from '../config';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import {AccessTime, Add, CheckCircle, CloudUpload, Delete, ElectricBolt, Money, PhotoCamera} from '@mui/icons-material';

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
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [latestReading, setLatestReading] = useState<MonthlyConsumption | null>(null);
    const [latestLoading, setLatestLoading] = useState(true);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [currency, setCurrency] = useState('USD');
    const [debugMode, setDebugMode] = useState(false);

    useEffect(() => {
        fetchLatestReading();
        fetchSettings();

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
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await axios.get(`${API_URL}/settings`);
            if (response.data) {
                if (response.data.currency) {
                    setCurrency(response.data.currency);
                }
                if (response.data.debug_mode !== undefined) {
                    setDebugMode(response.data.debug_mode);
                }
            }
        } catch (err) {
            console.error('Error fetching settings:', err);
        }
    };

    const handleFile = (file: File) => {
        if (!file.type.startsWith('image/')) {
            return;
        }
        setSelectedFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
    };

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

    const handleUpload = async () => {
        if (!selectedFile) return;
        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            await axios.post(`${API_URL}/monthly-consumption`, formData, {
                headers: {'Content-Type': 'multipart/form-data'},
            });
            fetchLatestReading();
            setSelectedFile(null);
            setPreviewUrl(null);
        } catch {
            // Handle upload error
        } finally {
            setIsUploading(false);
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
        return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}`;
    };

    const getCurrencySymbol = (code: string): string => {
        switch (code.toLowerCase()) {
            case 'usd':
                return '$';
            case 'eur':
                return '€';
            case 'ils':
                return '₪';
            case 'gbp':
                return '£';
            default:
                return code.toUpperCase();
        }
    };

    return (
        <Box sx={{width: '100%', maxWidth: 600, mx: 'auto'}}>
            <Grid container spacing={3}>
                <Grid sx={{width: '100%'}}>
                    <Paper
                        elevation={3}
                        sx={{
                            p: 6,
                            borderRadius: 4,
                            border: 2,
                            borderStyle: 'dashed',
                            borderColor: selectedFile ? 'primary.light' : 'divider',
                            bgcolor: selectedFile ? 'primary.lighter' : 'background.paper',
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                                borderColor: 'primary.main',
                                bgcolor: selectedFile ? 'primary.lighter' : 'action.hover'
                            }
                        }}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                    >
                        <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3}}>
                            <Box
                                sx={{
                                    width: 96,
                                    height: 96,
                                    borderRadius: 3,
                                    bgcolor: selectedFile ? 'primary.light' : 'action.hover',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.2s ease-in-out'
                                }}
                            >
                                {selectedFile ? (
                                    <CheckCircle sx={{fontSize: 48, color: 'primary.main'}}/>
                                ) : (
                                    <PhotoCamera sx={{fontSize: 48, color: 'text.secondary'}}/>
                                )}
                            </Box>

                            <Box sx={{textAlign: 'center'}}>
                                <Typography variant="h6" color="text.primary" gutterBottom>
                                    {selectedFile ? 'Image Selected' : 'Drag & Drop or Click to Upload'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {selectedFile ? selectedFile.name : 'Upload your electricity meter reading image'}
                                </Typography>
                            </Box>

                            <Box sx={{width: '100%', display: 'flex', flexDirection: 'column', gap: 2}}>
                                <Button
                                    component="label"
                                    variant="contained"
                                    startIcon={<Add/>}
                                    sx={{
                                        py: 1.5,
                                        borderRadius: 2,
                                        textTransform: 'none',
                                        fontSize: '1rem'
                                    }}
                                >
                                    {selectedFile ? 'Change Image' : 'Select Image'}
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileSelect}
                                        hidden
                                    />
                                </Button>

                                {selectedFile && (
                                    <>
                                        <Box
                                            sx={{
                                                position: 'relative',
                                                mx: 'auto',
                                                my: 2,
                                                borderRadius: 2,
                                                overflow: 'hidden',
                                                border: 1,
                                                borderColor: 'divider',
                                                display: 'flex',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            <img
                                                src={previewUrl || ''}
                                                alt="Preview"
                                                style={{
                                                    maxWidth: 300,
                                                    width: '100%',
                                                    height: 'auto',
                                                    objectFit: 'contain'
                                                }}
                                            />
                                            <IconButton
                                                onClick={() => {
                                                    setSelectedFile(null);
                                                    setPreviewUrl(null);
                                                }}
                                                sx={{
                                                    position: 'absolute',
                                                    top: 8,
                                                    right: 8,
                                                    bgcolor: 'background.paper',
                                                    '&:hover': {bgcolor: 'background.paper'}
                                                }}
                                            >
                                                <Delete/>
                                            </IconButton>
                                        </Box>
                                        <Button
                                            onClick={handleUpload}
                                            disabled={isUploading}
                                            variant="contained"
                                            color="success"
                                            startIcon={isUploading ? <CircularProgress size={20} color="inherit"/> :
                                                <CloudUpload/>}
                                            sx={{
                                                py: 1.5,
                                                borderRadius: 2,
                                                textTransform: 'none',
                                                fontSize: '1rem'
                                            }}
                                        >
                                            {isUploading ? 'Processing...' : 'Upload Reading'}
                                        </Button>
                                    </>
                                )}
                            </Box>
                        </Box>
                    </Paper>
                </Grid>

                <Grid sx={{width: '100%'}}>
                    <Paper elevation={3} sx={{p: 4, borderRadius: 4}}>
                        <Typography variant="h6" color="text.primary" gutterBottom>
                            Latest Reading
                        </Typography>

                        {latestLoading ? (
                            <Box sx={{display: 'flex', justifyContent: 'center', py: 4}}>
                                <CircularProgress/>
                            </Box>
                        ) : latestReading ? (
                            <Box>
                                <Grid container spacing={3}>
                                    <Grid sx={{width: {xs: '100%', md: '50%'}}}>
                                        <Box sx={{
                                            p: 2,
                                            bgcolor: 'primary.lighter',
                                            borderRadius: 2,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 2
                                        }}>
                                            <ElectricBolt color="primary"/>
                                            <Box>
                                                <Typography variant="body2" color="text.secondary">
                                                    Consumption
                                                </Typography>
                                                <Typography variant="h5" color="primary" fontWeight="bold">
                                                    {latestReading.total_kwh_consumed.toFixed(2)} kWh
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Grid>

                                    <Grid sx={{width: {xs: '100%', md: '50%'}}}>
                                        <Box sx={{
                                            p: 2,
                                            bgcolor: 'success.lighter',
                                            borderRadius: 2,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 2
                                        }}>
                                            <Money color="success"/>
                                            <Box>
                                                <Typography variant="body2" color="text.secondary">
                                                    Cost
                                                </Typography>
                                                <Typography variant="h5" color="success.main" fontWeight="bold">
                                                    {getCurrencySymbol(currency)} {latestReading.price.toFixed(2)}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Grid>
                                </Grid>

                                <Box sx={{mt: 3}}>
                                    <Box sx={{display: 'flex', alignItems: 'center', gap: 1, mb: 2}}>
                                        <AccessTime fontSize="small"/>
                                        <Typography variant="body2">
                                            Last updated: {formatDate(latestReading.date)}
                                        </Typography>
                                    </Box>

                                    {debugMode ? (
                                        latestReading.label_file && (
                                            <Box sx={{
                                                position: 'relative',
                                                borderRadius: 2,
                                                overflow: 'hidden',
                                                border: 1,
                                                borderColor: 'divider'
                                            }}>
                                                <img
                                                    src={`${API_URL}/monthly-consumption/file/${latestReading.label_file}`}
                                                    alt="Latest Reading (Debug)"
                                                    style={{
                                                        width: '100%',
                                                        height: 'auto',
                                                        objectFit: 'contain',
                                                        maxHeight: 300
                                                    }}
                                                />
                                            </Box>
                                        )
                                    ) : (
                                        latestReading.original_file && (
                                            <Box sx={{
                                                position: 'relative',
                                                borderRadius: 2,
                                                overflow: 'hidden',
                                                border: 1,
                                                borderColor: 'divider'
                                            }}>
                                                <img
                                                    src={`${API_URL}/monthly-consumption/file/${latestReading.original_file}`}
                                                    alt="Latest Reading"
                                                    style={{
                                                        width: '100%',
                                                        height: 'auto',
                                                        objectFit: 'contain',
                                                        maxHeight: 300
                                                    }}
                                                />
                                            </Box>
                                        )
                                    )}
                                </Box>
                            </Box>
                        ) : (
                            <Box sx={{
                                textAlign: 'center',
                                py: 4,
                                color: 'text.secondary'
                            }}>
                                <Typography variant="body1" gutterBottom>
                                    No readings available yet
                                </Typography>
                                <Typography variant="body2">
                                    Upload your first meter reading to get started
                                </Typography>
                            </Box>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}