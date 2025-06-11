import React, {useEffect, useState} from 'react'
import axios from 'axios'
import {API_URL} from '../config'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import Snackbar from '@mui/material/Snackbar'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Grid from '@mui/material/Grid'
import {Add, Close, Delete, Edit, Save} from '@mui/icons-material'
import {Alert, Dialog, DialogActions, DialogContent, DialogTitle} from '@mui/material'

interface ElectricityPrice {
    _id: string;
    price: number;
    date: string;
    is_default: boolean;
}

interface SortConfig {
    key: 'date' | 'price';
    direction: 'ascending' | 'descending';
}

export default function PriceManagement() {
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

    function formatDate(dateString: string): string {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

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

    const getSortIcon = (key: 'date' | 'price') => {
        if (sortConfig.key !== key) return null;
        return sortConfig.direction === 'ascending' ? '↑' : '↓';
    };

    const handleEditClick = (price: ElectricityPrice) => {
        setEditingId(price._id);
        setNewPrice(price);
    };

    const handleNewPriceChange = (field: keyof ElectricityPrice, value: any) => {
        setNewPrice(prev => ({
            ...prev,
            [field]: field === 'price' ? parseFloat(value) || 0 : value
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

    // Loading UI
    if (loading) {
        return (
            <Container maxWidth="md" sx={{mt: 6}}>
                <Paper elevation={2} sx={{p: 4, textAlign: 'center'}}>
                    <Typography variant="h6" color="text.secondary">Loading prices...</Typography>
                </Paper>
            </Container>
        )
    }

    return (
        <Box>
            <Paper sx={{p: 3, mb: 4}}>
                <Typography variant="h6" gutterBottom>
                    Add New Price
                </Typography>
                <Box component="form" onSubmit={handleAddSubmit}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid sx={{width: {xs: '100%', md: '41.66%'}}}>
                            <TextField
                                fullWidth
                                label="Date"
                                type="date"
                                value={newPrice.date}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleNewPriceChange('date', e.target.value)}
                                InputLabelProps={{shrink: true}}
                            />
                        </Grid>
                        <Grid sx={{width: {xs: '100%', md: '41.66%'}}}>
                            <TextField
                                fullWidth
                                label={`Price (${getCurrencySymbol(currency)}/kWh)`}
                                type="number"
                                value={newPrice.price}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleNewPriceChange('price', e.target.value)}
                                inputProps={{step: 0.0001}}
                            />
                        </Grid>
                        <Grid sx={{width: {xs: '100%', md: '16.66%'}}}>
                            <Button
                                fullWidth
                                variant="contained"
                                color="primary"
                                type="submit"
                                startIcon={<Add/>}
                            >
                                Add
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            </Paper>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>
                                <Button
                                    color="inherit"
                                    onClick={() => handleSort('date')}
                                    endIcon={getSortIcon('date')}
                                >
                                    Date
                                </Button>
                            </TableCell>
                            <TableCell>
                                <Button
                                    color="inherit"
                                    onClick={() => handleSort('price')}
                                    endIcon={getSortIcon('price')}
                                >
                                    Price ({getCurrencySymbol(currency)}/kWh)
                                </Button>
                            </TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sortedPrices.map((price) => (
                            <React.Fragment key={price._id}>
                                <TableRow>
                                    <TableCell>{formatDate(price.date)}</TableCell>
                                    <TableCell>{price.price.toFixed(4)}</TableCell>
                                    <TableCell align="right">
                                        <IconButton
                                            size="small"
                                            onClick={() => handleEditClick(price)}
                                            color="primary"
                                        >
                                            <Edit/>
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            onClick={() => setDeleteConfirmId(price._id)}
                                            color="error"
                                        >
                                            <Delete/>
                                        </IconButton>
                                    </TableCell>
                                </TableRow>

                                {editingId === price._id && (
                                    <TableRow>
                                        <TableCell colSpan={3}>
                                            <Box component="form" onSubmit={handleEditSubmit}>
                                                <Grid container spacing={2} alignItems="center">
                                                    <Grid sx={{width: {xs: '100%', md: '41.66%'}}}>
                                                        <TextField
                                                            fullWidth
                                                            label="Date"
                                                            type="date"
                                                            value={newPrice.date}
                                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleNewPriceChange('date', e.target.value)}
                                                            InputLabelProps={{shrink: true}}
                                                        />
                                                    </Grid>
                                                    <Grid sx={{width: {xs: '100%', md: '41.66%'}}}>
                                                        <TextField
                                                            fullWidth
                                                            label={`Price (${getCurrencySymbol(currency)}/kWh)`}
                                                            type="number"
                                                            value={newPrice.price}
                                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleNewPriceChange('price', e.target.value)}
                                                            inputProps={{step: 0.0001}}
                                                        />
                                                    </Grid>
                                                    <Grid sx={{width: {xs: '100%', md: '16.66%'}}}>
                                                        <Box sx={{display: 'flex', gap: 1}}>
                                                            <Button
                                                                variant="contained"
                                                                color="primary"
                                                                type="submit"
                                                                startIcon={<Save/>}
                                                            >
                                                                Save
                                                            </Button>
                                                            <Button
                                                                variant="outlined"
                                                                onClick={handleCancelEdit}
                                                                startIcon={<Close/>}
                                                            >
                                                                Cancel
                                                            </Button>
                                                        </Box>
                                                    </Grid>
                                                </Grid>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </React.Fragment>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog
                open={!!deleteConfirmId}
                onClose={() => setDeleteConfirmId(null)}
            >
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete this price? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteConfirmId(null)}>Cancel</Button>
                    <Button onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)} color="error"
                            variant="contained">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={!!successMessage}
                autoHideDuration={3000}
                onClose={() => setSuccessMessage(null)}
            >
                <Alert severity="success" onClose={() => setSuccessMessage(null)}>
                    {successMessage}
                </Alert>
            </Snackbar>
        </Box>
    )
} 