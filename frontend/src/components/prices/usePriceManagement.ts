import {useState, useEffect} from 'react';
import axios from 'axios';
import {API_URL} from '../../config';
import type {ElectricityPrice, SortConfig} from './types';

export function usePriceManagement() {
    const [prices, setPrices] = useState<ElectricityPrice[]>([]);
    const [loading, setLoading] = useState(true);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const [newPrice, setNewPrice] = useState<Partial<ElectricityPrice>>({
        price: 0,
        date: new Date().toISOString().split('T')[0],
        is_default: false
    });
    const [sortConfig, setSortConfig] = useState<SortConfig>({
        key: 'date',
        direction: 'descending'
    });
    const [currency, setCurrency] = useState('USD');

    useEffect(() => {
        fetchPrices();
        fetchSettings();
    }, []);

    useEffect(() => {
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

    const fetchPrices = async () => {
        try {
            const response = await axios.get(`${API_URL}/electricity-prices`);
            setPrices(response.data);
        } catch (err) {
            console.error('Error fetching prices:', err);
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
            console.error('Error fetching settings:', err);
        }
    };

    const handleSort = (key: 'date' | 'price') => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'ascending' ? 'descending' : 'ascending'
        }));
    };

    const handleEditClick = (price: ElectricityPrice) => {
        setEditingId(price._id);
        setNewPrice(price);
    };

    const handleNewPriceChange = (field: keyof ElectricityPrice, value: string | number | boolean) => {
        setNewPrice(prev => ({
            ...prev,
            [field]: field === 'price' ? parseFloat(String(value)) || 0 : value
        }));
    };

    const handleAddSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/electricity-prices`, newPrice);
            setSuccessMessage('Price added successfully');
            fetchPrices();
            setNewPrice({
                price: 0,
                date: new Date().toISOString().split('T')[0],
                is_default: false
            });
        } catch (err) {
            console.error('Error adding price:', err);
        }
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingId) return;

        try {
            await axios.put(`${API_URL}/electricity-prices/${editingId}`, newPrice);
            setSuccessMessage('Price updated successfully');
            fetchPrices();
            setEditingId(null);
        } catch (err) {
            console.error('Error updating price:', err);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await axios.delete(`${API_URL}/electricity-prices/${id}`);
            setSuccessMessage('Price deleted successfully');
            fetchPrices();
            setDeleteConfirmId(null);
        } catch (err) {
            console.error('Error deleting price:', err);
        }
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setNewPrice({
            price: 0,
            date: new Date().toISOString().split('T')[0],
            is_default: false
        });
    };

    const getCurrencySymbol = (currencyCode: string): string => {
        const symbols: { [key: string]: string } = {
            'USD': '$',
            'EUR': '€',
            'GBP': '£',
            'ILS': '₪',
            'JPY': '¥',
            'CNY': '¥',
            'INR': '₹',
            'BTC': '₿'
        };

        return symbols[currencyCode] || currencyCode;
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Sort prices according to sortConfig
    const sortedPrices = [...prices].sort((a, b) => {
        if (sortConfig.key === 'date') {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            return sortConfig.direction === 'ascending' ? dateA - dateB : dateB - dateA;
        } else if (sortConfig.key === 'price') {
            return sortConfig.direction === 'ascending' ? a.price - b.price : b.price - a.price;
        }
        return 0;
    });

    return {
        loading,
        successMessage,
        editingId,
        deleteConfirmId,
        newPrice,
        sortConfig,
        currency,
        sortedPrices,
        setSuccessMessage,
        setDeleteConfirmId,
        handleSort,
        handleEditClick,
        handleNewPriceChange,
        handleAddSubmit,
        handleEditSubmit,
        handleDelete,
        handleCancelEdit,
        getCurrencySymbol,
        formatDate
    };
} 