import {useState, useEffect} from 'react';
import axios from 'axios';
import {API_URL} from '../../config';
import type {MonthlyConsumption, ConsumptionStats, ImageTab} from './types';

export function useConsumptionHistory() {
    const [readings, setReadings] = useState<MonthlyConsumption[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [currency, setCurrency] = useState('ILS');
    const [activeImageTab, setActiveImageTab] = useState<ImageTab>('original');
    const [editedReading, setEditedReading] = useState<Partial<MonthlyConsumption> | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const [actionMenuAnchor, setActionMenuAnchor] = useState<null | HTMLElement>(null);
    const [actionMenuId, setActionMenuId] = useState<string | null>(null);

    useEffect(() => {
        fetchReadings();
        fetchSettings();

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

    const fetchReadings = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/monthly-consumption`);
            const sortedReadings = response.data.sort((a: MonthlyConsumption, b: MonthlyConsumption) => {
                const dateA = safeParseDate(a.date);
                const dateB = safeParseDate(b.date);

                if (!dateA && !dateB) return 0;
                if (!dateA) return 1;
                if (!dateB) return -1;

                return dateB.getTime() - dateA.getTime();
            });

            const readingsWithIds = sortedReadings.map((reading: MonthlyConsumption) => {
                if (!reading._id) {
                    console.warn('Reading missing _id, using fallback:', reading);
                    return {
                        ...reading,
                        _id: reading.label_file || reading.file_name || `reading-${reading.date}-${Math.random().toString(36).substr(2, 9)}`
                    };
                }
                return reading;
            });

            setReadings(readingsWithIds);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const fetchSettings = async () => {
        try {
            const response = await axios.get(`${API_URL}/settings`);
            if (response.data && response.data.currency) {
                setCurrency(response.data.currency);
            }
        } catch (err) {
            console.error('Failed to fetch settings:', err);
        }
    };

    const safeParseDate = (dateString: string | undefined): Date | null => {
        if (!dateString) return null;
        try {
            const date = new Date(dateString);
            return isNaN(date.getTime()) ? null : date;
        } catch (e) {
            console.error('Error parsing date:', e);
            return null;
        }
    };

    const handleDetailClick = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
        setEditingId(null);
    };

    const handleEdit = (id: string) => {
        const reading = readings.find(r => r._id === id);
        if (reading) {
            setEditingId(id);
            setEditedReading(reading);
        }
    };

    const handleEditFormChange = (field: keyof MonthlyConsumption, value: any) => {
        setEditedReading(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                [field]: field === 'total_kwh_consumed' || field === 'price'
                    ? parseFloat(value) || 0
                    : value
            };
        });
    };

    const handleEditSubmit = async () => {
        if (!editingId || !editedReading) return;

        try {
            await axios.put(`${API_URL}/monthly-consumption/${editingId}`, editedReading);
            await fetchReadings();
            setEditedReading(null);
            setEditingId(null);
        } catch (error) {
            console.error('Error updating reading:', error);
        }
    };

    const handleEditCancel = () => {
        setEditingId(null);
        setEditedReading(null);
    };

    const handleDelete = async (id: string) => {
        try {
            await axios.delete(`${API_URL}/monthly-consumption/${id}`);
            setReadings(prev => prev.filter(reading => reading._id !== id));
            setSuccessMessage('Reading deleted successfully');
            setDeleteConfirmId(null);
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete reading');
        }
    };

    const handleDeleteConfirm = async () => {
        if (editingId) {
            await handleDelete(editingId);
            setEditingId(null);
        }
    };

    const handleDeleteCancel = () => {
        setDeleteConfirmId(null);
    };

    const handleActionMenuOpen = (event: React.MouseEvent<HTMLElement>, id: string) => {
        setActionMenuAnchor(event.currentTarget);
        setActionMenuId(id);
    };

    const handleActionMenuClose = () => {
        setActionMenuAnchor(null);
        setActionMenuId(null);
    };

    const getFileUrl = (fileId: string | undefined): string => {
        if (!fileId) return '';
        return `${API_URL}/monthly-consumption/file/${fileId}`;
    };

    const getCurrencySymbol = (currencyCode: string): string => {
        const symbols: Record<string, string> = {
            USD: '$',
            EUR: '€',
            GBP: '£',
            ILS: '₪',
            JPY: '¥',
            CNY: '¥',
            INR: '₹',
            BTC: '₿'
        };
        return symbols[currencyCode] || currencyCode;
    };

    const formatDate = (dateString: string | null | undefined): string => {
        if (!dateString) return 'Not available';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Invalid date';
            return new Intl.DateTimeFormat('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }).format(date);
        } catch (e) {
            console.error('Error formatting date:', e);
            return 'Invalid date';
        }
    };

    const formatTimestamp = (dateString: string | null | undefined): string => {
        if (!dateString) return 'Not available';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Invalid date';
            return new Intl.DateTimeFormat('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            }).format(date);
        } catch (e) {
            console.error('Error formatting timestamp:', e);
            return 'Invalid date';
        }
    };

    const calculateStats = (): ConsumptionStats => {
        if (readings.length === 0) {
            return {
                totalReadings: 0,
                lastReadingDate: null,
                averageConsumption: 0,
                totalSpending: 0,
                averageMonthlySpending: 0,
                totalConsumption: 0,
                averageCost: 0,
                highestConsumption: 0,
                lowestConsumption: 0,
                highestCost: 0,
                lowestCost: 0
            };
        }

        const totalConsumption = readings.reduce((sum, reading) => sum + reading.total_kwh_consumed, 0);
        const totalSpending = readings.reduce((sum, reading) => sum + reading.price, 0);
        const highestConsumption = Math.max(...readings.map(r => r.total_kwh_consumed));
        const lowestConsumption = Math.min(...readings.map(r => r.total_kwh_consumed));
        const highestCost = Math.max(...readings.map(r => r.price));
        const lowestCost = Math.min(...readings.map(r => r.price));

        return {
            totalReadings: readings.length,
            lastReadingDate: readings[0].date,
            averageConsumption: totalConsumption / readings.length,
            totalSpending,
            averageMonthlySpending: totalSpending / readings.length,
            totalConsumption,
            averageCost: totalSpending / totalConsumption,
            highestConsumption,
            lowestConsumption,
            highestCost,
            lowestCost
        };
    };

    const stats = calculateStats();

    return {
        readings,
        loading,
        error,
        expandedId,
        editingId,
        successMessage,
        currency,
        activeImageTab,
        editedReading,
        deleteConfirmId,
        actionMenuAnchor,
        actionMenuId,
        setSuccessMessage,
        setActiveImageTab,
        handleDetailClick,
        handleEdit,
        handleEditFormChange,
        handleEditSubmit,
        handleEditCancel,
        handleDelete,
        handleDeleteConfirm,
        handleDeleteCancel,
        handleActionMenuOpen,
        handleActionMenuClose,
        getFileUrl,
        getCurrencySymbol,
        formatDate,
        formatTimestamp,
        stats,
        isDeleteDialogOpen: !!deleteConfirmId,
        deleteReadingId: deleteConfirmId
    };
} 