import {useEffect, useState} from 'react';
import axios from 'axios';
import {API_URL} from '../../config';
import type {ConsumptionStats, ImageTab, MonthlyConsumption, YearlyTotal} from './types';

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

    const handleEditFormChange = (field: keyof MonthlyConsumption, value: string | number) => {
        setEditedReading(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                [field]: field === 'total_kwh_consumed' || field === 'price'
                    ? parseFloat(String(value)) || 0
                    : value
            };
        });
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
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

        // Calculate consumption deltas (differences between consecutive readings)
        const consumptionDeltas: number[] = [];
        for (let i = 1; i < readings.length; i++) {
            const current = readings[i - 1].total_kwh_consumed; // More recent reading
            const previous = readings[i].total_kwh_consumed; // Older reading
            const delta = current - previous;
            if (delta >= 0) { // Only include positive deltas (meter readings should increase)
                consumptionDeltas.push(delta);
            }
        }

        // Calculate statistics
        const totalConsumption = readings.reduce((sum, reading) => sum + reading.total_kwh_consumed, 0);
        const totalSpending = readings.reduce((sum, reading) => sum + reading.price, 0);
        const highestConsumption = Math.max(...readings.map(r => r.total_kwh_consumed));
        const lowestConsumption = Math.min(...readings.map(r => r.total_kwh_consumed));
        const highestCost = Math.max(...readings.map(r => r.price));
        const lowestCost = Math.min(...readings.map(r => r.price));

        // Calculate average consumption from deltas
        const averageConsumption = consumptionDeltas.length > 0 
            ? consumptionDeltas.reduce((sum, delta) => sum + delta, 0) / consumptionDeltas.length
            : 0;

        return {
            totalReadings: readings.length,
            lastReadingDate: readings[0].date,
            averageConsumption,
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

    const calculateYearlyTotals = (): YearlyTotal[] => {
        if (readings.length === 0) return [];

        const yearlyMap = new Map<number, { readings: MonthlyConsumption[] }>();

        // Group readings by year
        readings.forEach((reading) => {
            if (!reading.date) return;
            
            const date = safeParseDate(reading.date);
            if (!date) return;
            
            const year = date.getFullYear();
            const existing = yearlyMap.get(year) || { readings: [] };
            existing.readings.push(reading);
            yearlyMap.set(year, existing);
        });

        // Calculate totals for each year
         // Sort by year descending
        return Array.from(yearlyMap.entries())
            .map(([year, data]) => {
                // Sort readings for this year by date (oldest first)
                const yearReadings = data.readings.sort((a, b) => {
                    const dateA = safeParseDate(a.date);
                    const dateB = safeParseDate(b.date);
                    if (!dateA && !dateB) return 0;
                    if (!dateA) return 1;
                    if (!dateB) return -1;
                    return dateA.getTime() - dateB.getTime();
                });

                // Calculate total consumption for the year
                // Since readings are cumulative meter readings, we can simply do:
                // Last reading of year - Baseline (which is 0 if this is the first year, or last reading from previous year)
                let totalConsumption = 0;

                if (yearReadings.length > 0) {
                    const lastReadingOfYear = yearReadings[yearReadings.length - 1];

                    // Find baseline: check if there's a reading from previous year
                    const previousYearReadings = readings
                        .filter(r => {
                            const rDate = safeParseDate(r.date);
                            return rDate && rDate.getFullYear() < year;
                        })
                        .sort((a, b) => {
                            const dateA = safeParseDate(a.date);
                            const dateB = safeParseDate(b.date);
                            if (!dateA && !dateB) return 0;
                            if (!dateA) return 1;
                            if (!dateB) return -1;
                            return dateA.getTime() - dateB.getTime();
                        });

                    let baselineValue: number;

                    if (previousYearReadings.length > 0) {
                        // Use last reading from previous year as baseline
                        const baselineReading = previousYearReadings[previousYearReadings.length - 1];
                        baselineValue = baselineReading.total_kwh_consumed;
                    } else {
                        // No previous year readings, baseline is 0 (this is the first year of tracking)
                        // Total consumption = last reading of year - 0
                        baselineValue = 0;
                    }

                    const delta = lastReadingOfYear.total_kwh_consumed - baselineValue;

                    if (delta >= 0) {
                        totalConsumption = delta;
                    } else {
                        totalConsumption = 0;
                    }
                }

                // Sum all spending for the year
                const totalSpending = data.readings.reduce((sum, reading) => sum + reading.price, 0);

                return {
                    year,
                    totalConsumption,
                    totalSpending,
                    readingCount: data.readings.length
                };
            })
            .sort((a, b) => b.year - a.year);
    };

    const yearlyTotals = calculateYearlyTotals();

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
        yearlyTotals,
        isDeleteDialogOpen: !!deleteConfirmId,
        deleteReadingId: deleteConfirmId
    };
} 