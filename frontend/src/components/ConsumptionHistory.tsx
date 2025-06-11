import React, {useEffect, useState} from 'react'
import axios from 'axios'
import {API_URL} from '../config'
import Container from '@mui/material/Container'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
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
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import {BarChart, Delete, Edit, ElectricBolt, Image, Info, Label, Save, TrendingUp} from '@mui/icons-material'
import MoreVert from '@mui/icons-material/MoreVert'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import useMediaQuery from '@mui/material/useMediaQuery'
import {useTheme} from '@mui/material/styles'

interface MonthlyConsumption {
    modified_date: string;
    date: string;
    total_kwh_consumed: number;
    price: number;
    original_file: any;
    file_name: string;
    label_file: any;
    file_label_name: any;
    _id: string;
}

export default function ConsumptionHistory() {
    const [readings, setReadings] = useState<MonthlyConsumption[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [expandedId, setExpandedId] = useState<string | null>(null)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)
    const [currency, setCurrency] = useState('USD')
    const [activeImageTab, setActiveImageTab] = useState<'original' | 'labeled' | 'text'>('original')

    // Form states
    const [editingReading, setEditingReading] = useState<MonthlyConsumption | null>(null)
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

    const [actionMenuAnchor, setActionMenuAnchor] = useState<null | HTMLElement>(null);
    const [actionMenuId, setActionMenuId] = useState<string | null>(null);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    useEffect(() => {
        fetchReadings()

        // Get initial currency from settings API
        axios.get(`${API_URL}/settings`)
            .then(res => {
                if (res.data && res.data.currency) {
                    setCurrency(res.data.currency);
                }
            })
            .catch(err => {
                console.error('Error fetching settings:', err);
            });

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
    }, [])

    // Format date for display
    const formatDate = (dateString: string | undefined): string => {
        if (!dateString) return 'Not available';

        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return 'Invalid date';
            }

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

    const fetchReadings = async () => {
        try {
            const response = await axios.get(`${API_URL}/monthly-consumption`)

            // Sort readings by date (newest first) with safe date parsing
            const sortedReadings = response.data.sort((a: MonthlyConsumption, b: MonthlyConsumption) => {
                const dateA = safeParseDate(a.date);
                const dateB = safeParseDate(b.date);

                if (!dateA && !dateB) return 0;
                if (!dateA) return 1; // null dates go to the end
                if (!dateB) return -1;

                return dateB.getTime() - dateA.getTime();
            })

            // Ensure each reading has a unique _id
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
            setError('Failed to fetch consumption history')
            console.error('Fetch error:', err)
        } finally {
            setLoading(false)
        }
    }

    // Add a helper to safely parse dates
    const safeParseDate = (dateString: string | undefined): Date | null => {
        if (!dateString) return null;

        try {
            const date = new Date(dateString);
            // Check if date is valid
            if (isNaN(date.getTime())) {
                return null;
            }
            return date;
        } catch (e) {
            console.error('Error parsing date:', e);
            return null;
        }
    };

    // Handle details view toggle
    const handleDetailClick = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
        setEditingId(null);
    }

    // Handle edit mode toggle
    const handleEditClick = (id: string) => {
        const reading = readings.find(r => r._id === id);
        if (reading) {
            setEditingReading({...reading});
            setEditingId(id);
            setExpandedId(null);
        }
    }

    // Handle form field changes
    const handleEditFormChange = (field: keyof MonthlyConsumption, value: any) => {
        setEditingReading(prev => {
            if (!prev) return prev;

            return {
                ...prev,
                [field]: field === 'total_kwh_consumed' || field === 'price'
                    ? parseFloat(value) || 0
                    : value
            };
        });
    }

    // Handle form submission
    const handleEditSubmit = async (e: React.FormEvent, id: string) => {
        e.preventDefault();

        if (!editingReading) return;

        try {
            await axios.put(`${API_URL}/monthly-consumption/${id}`, editingReading);

            // Update the local state with the edited reading
            setReadings(prev => prev.map(reading =>
                reading._id === id ? {...editingReading} : reading
            ));

            setSuccessMessage('Reading updated successfully');
            setEditingId(null);
            setEditingReading(null);

            // Clear success message after 3 seconds
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            setError('Failed to update reading');
            console.error('Update error:', err);
        }
    }

    // Handle canceling edit mode
    const handleCancelEdit = () => {
        setEditingId(null);
        setEditingReading(null);
    }

    // Format timestamp for display
    const formatTimestamp = (dateString: string | undefined): string => {
        if (!dateString) return 'Not available';

        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return 'Invalid date';
            }

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

    // Get currency symbol based on selected currency
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

    // Handle delete confirmation
    const handleDeleteClick = (id: string) => {
        setDeleteConfirmId(id);
        setExpandedId(null);
        setEditingId(null);
    }

    // Handle actual deletion
    const handleDeleteConfirm = async (id: string) => {
        try {
            await axios.delete(`${API_URL}/monthly-consumption/${id}`);

            // Update the local state by removing the deleted reading
            setReadings(prev => prev.filter(reading => reading._id !== id));

            setSuccessMessage('Reading deleted successfully');
            setDeleteConfirmId(null);

            // Clear success message after 3 seconds
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            setError('Failed to delete reading');
            console.error('Delete error:', err);
        }
    }

    // Handle cancel delete
    const handleCancelDelete = () => {
        setDeleteConfirmId(null);
    }

    // Function to fetch file from the server
    const getFileUrl = (fileId: string | undefined): string => {
        if (!fileId) return '';
        return `${API_URL}/monthly-consumption/file/${fileId}`;
    };

    // Action menu handlers for mobile
    const handleActionMenuOpen = (event: React.MouseEvent<HTMLElement>, id: string) => {
        setActionMenuAnchor(event.currentTarget);
        setActionMenuId(id);
    };
    const handleActionMenuClose = () => {
        setActionMenuAnchor(null);
        setActionMenuId(null);
    };

    if (loading) {
        return (
            <Container maxWidth="md" sx={{mt: 6}}>
                <Paper elevation={2} sx={{p: 4, textAlign: 'center'}}>
                    <Typography variant="h6" color="text.secondary">Loading history...</Typography>
                </Paper>
            </Container>
        )
    }

    if (error) {
        return (
            <Container maxWidth="md" sx={{mt: 6}}>
                <Paper elevation={2} sx={{p: 4, textAlign: 'center'}}>
                    <Typography color="error">{error}</Typography>
                </Paper>
            </Container>
        )
    }

    if (readings.length === 0) {
        return (
            <Container maxWidth="md" sx={{mt: 6}}>
                <Paper elevation={2} sx={{p: 4, textAlign: 'center'}}>
                    <Typography variant="h6" color="primary">No readings available yet</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{mt: 1}}>Upload your first meter reading to
                        get started</Typography>
                </Paper>
            </Container>
        )
    }

    // Create a copy of readings in ascending order (oldest first) for calculations
    const sortedReadings = [...readings].reverse();

    // Calculate average monthly consumption by looking at differences between consecutive readings
    let totalMonthlyConsumption = 0;
    let validDifferences = 0;

    for (let i = 1; i < sortedReadings.length; i++) {
        const currentReading = sortedReadings[i].total_kwh_consumed;
        const previousReading = sortedReadings[i - 1].total_kwh_consumed;
        const difference = currentReading - previousReading;

        // Only count positive differences (meter readings should increase)
        if (difference > 0) {
            totalMonthlyConsumption += difference;
            validDifferences++;
        }
    }

    const averageKwh = validDifferences > 0 ? totalMonthlyConsumption / validDifferences : 0;

    // Calculate total spending
    const totalSpending = readings.reduce((acc, reading) => acc + reading.price, 0);

    // Calculate average monthly spending
    const averageMonthlySpending = readings.length > 0 ? totalSpending / readings.length : 0;

    if (isMobile) {
        // Mobile: Card/List layout
        return (
            <Container maxWidth="md" sx={{mt: 6}}>
                <Paper elevation={3} sx={{p: {xs: 2, sm: 4}, borderRadius: 3}}>
                    <Typography variant="h5" align="center" fontWeight={700} gutterBottom>
                        Consumption History
                    </Typography>
                    <Grid container spacing={2} sx={{mb: 3}}>
                        <Grid sx={{width: '100%'}}>
                            <Paper elevation={1} sx={{p: 2, mb: 2}}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>Total
                                    Readings</Typography>
                                <Box display="flex" alignItems="center" gap={1} mb={1}>
                                    <BarChart color="primary"/>
                                    <Typography variant="h4" color="primary.main"
                                                fontWeight={700}>{readings.length}</Typography>
                                </Box>
                                <Typography variant="body2" color="text.secondary">energy consumption
                                    records</Typography>
                                <Typography variant="caption" color="text.secondary">Last
                                    reading: {formatDate(readings[0]?.date)}</Typography>
                            </Paper>
                        </Grid>
                        <Grid sx={{width: '100%'}}>
                            <Paper elevation={1} sx={{p: 2, mb: 2}}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>Avg.
                                    Consumption</Typography>
                                <Box display="flex" alignItems="center" gap={1} mb={1}>
                                    <ElectricBolt color="primary"/>
                                    <Typography variant="h4" color="primary.main"
                                                fontWeight={700}>{averageKwh.toFixed(1)}</Typography>
                                </Box>
                                <Typography variant="body2" color="text.secondary">kWh per reading</Typography>
                                <Typography variant="caption" color="text.secondary">Based
                                    on {readings.length} readings</Typography>
                            </Paper>
                        </Grid>
                        <Grid sx={{width: '100%'}}>
                            <Paper elevation={1} sx={{p: 2, mb: 2}}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>Total
                                    Spending</Typography>
                                <Box display="flex" alignItems="center" gap={1} mb={1}>
                                    <TrendingUp color="primary"/>
                                    <Typography variant="h4" color="primary.main"
                                                fontWeight={700}>{getCurrencySymbol(currency)} {totalSpending.toFixed(2)}</Typography>
                                </Box>
                                <Typography variant="body2" color="text.secondary">on electricity</Typography>
                                <Typography variant="caption"
                                            color="text.secondary">Avg: {getCurrencySymbol(currency)} {averageMonthlySpending.toFixed(2)}/month</Typography>
                            </Paper>
                        </Grid>
                    </Grid>
                    <Box>
                        {readings.map((reading) => (
                            <Paper key={reading._id} elevation={2} sx={{p: 2, mb: 2, borderRadius: 2}}>
                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                    <Typography variant="subtitle2"
                                                color="text.secondary">{formatDate(reading.date)}</Typography>
                                    <IconButton size="small" onClick={e => handleActionMenuOpen(e, reading._id)}>
                                        <MoreVert/>
                                    </IconButton>
                                    <Menu
                                        anchorEl={actionMenuAnchor}
                                        open={actionMenuId === reading._id}
                                        onClose={handleActionMenuClose}
                                        anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
                                        transformOrigin={{vertical: 'top', horizontal: 'right'}}
                                    >
                                        <MenuItem onClick={() => {
                                            handleEditClick(reading._id);
                                            handleActionMenuClose();
                                        }}>
                                            <Edit fontSize="small" sx={{mr: 1}}/> Edit
                                        </MenuItem>
                                        <MenuItem onClick={() => {
                                            handleDetailClick(reading._id);
                                            handleActionMenuClose();
                                        }}>
                                            <Info fontSize="small" sx={{mr: 1}}/> Details
                                        </MenuItem>
                                        <MenuItem onClick={() => {
                                            handleDeleteClick(reading._id);
                                            handleActionMenuClose();
                                        }}>
                                            <Delete fontSize="small" sx={{mr: 1}} color="error"/> Delete
                                        </MenuItem>
                                    </Menu>
                                </Box>
                                <Box mb={1}>
                                    <Typography variant="body2" color="text.secondary">Consumption</Typography>
                                    <Typography variant="h6" color="primary"
                                                fontWeight={600}>{reading.total_kwh_consumed.toFixed(2)} kWh</Typography>
                                </Box>
                                <Box mb={1}>
                                    <Typography variant="body2" color="text.secondary">Price</Typography>
                                    <Typography variant="h6" color="primary"
                                                fontWeight={600}>{getCurrencySymbol(currency)} {reading.price.toFixed(2)}</Typography>
                                </Box>
                                {/* Details view for mobile */}
                                {expandedId === reading._id && (
                                    <Paper elevation={1} sx={{p: 2, mb: 2}}>
                                        <Typography variant="subtitle1" color="primary" fontWeight={600} mb={2}><Info
                                            sx={{mr: 1}}/> Reading Details</Typography>
                                        <Grid container spacing={2}>
                                            <Grid>
                                                <Typography variant="body2" color="text.secondary">Reading
                                                    Date</Typography>
                                                <Typography>{formatDate(reading.date)}</Typography>
                                                <Typography variant="body2"
                                                            color="text.secondary">Consumption</Typography>
                                                <Typography>{reading.total_kwh_consumed.toFixed(2)} kWh</Typography>
                                                <Typography variant="body2" color="text.secondary">Price</Typography>
                                                <Typography>{getCurrencySymbol(currency)} {reading.price.toFixed(2)}</Typography>
                                                <Typography variant="body2" color="text.secondary">Last
                                                    Modified</Typography>
                                                <Typography>{formatTimestamp(reading.modified_date)}</Typography>
                                                <Typography variant="body2" color="text.secondary">File
                                                    Name</Typography>
                                                <Typography>{reading.file_name || 'Not available'}</Typography>
                                            </Grid>
                                            <Grid>
                                                <Tabs
                                                    value={activeImageTab}
                                                    onChange={(_, v) => setActiveImageTab(v)}
                                                    textColor="primary"
                                                    indicatorColor="primary"
                                                    variant="fullWidth"
                                                    sx={{mb: 2}}
                                                >
                                                    <Tab
                                                        icon={<Image sx={{fontSize: isMobile ? 28 : 20}}/>}
                                                        label="Original"
                                                        value="original"
                                                        sx={{
                                                            minWidth: isMobile ? 60 : undefined,
                                                            py: isMobile ? 2 : undefined
                                                        }}
                                                    />
                                                    <Tab
                                                        icon={<Label sx={{fontSize: isMobile ? 28 : 20}}/>}
                                                        label="Labeled"
                                                        value="labeled"
                                                        sx={{
                                                            minWidth: isMobile ? 60 : undefined,
                                                            py: isMobile ? 2 : undefined
                                                        }}
                                                    />
                                                </Tabs>
                                                <Box sx={{
                                                    minHeight: 120,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}>
                                                    {activeImageTab === 'original' && (
                                                        reading.original_file ? (
                                                            <img
                                                                src={getFileUrl(reading.original_file)}
                                                                alt="Original Meter Reading"
                                                                style={{
                                                                    maxWidth: '100%',
                                                                    maxHeight: 300,
                                                                    objectFit: 'contain',
                                                                    borderRadius: 8
                                                                }}
                                                            />
                                                        ) : (
                                                            <Typography color="text.secondary">No original image
                                                                available</Typography>
                                                        )
                                                    )}
                                                    {activeImageTab === 'labeled' && (
                                                        reading.label_file ? (
                                                            <img
                                                                src={getFileUrl(reading.label_file)}
                                                                alt="Labeled Meter Reading"
                                                                style={{
                                                                    maxWidth: '100%',
                                                                    maxHeight: 300,
                                                                    objectFit: 'contain',
                                                                    borderRadius: 8
                                                                }}
                                                            />
                                                        ) : (
                                                            <Typography color="text.secondary">No labeled image
                                                                available</Typography>
                                                        )
                                                    )}
                                                </Box>
                                            </Grid>
                                        </Grid>
                                    </Paper>
                                )}
                                {/* Edit mode for mobile */}
                                {editingId === reading._id && editingReading && (
                                    <Paper elevation={1} sx={{p: 2, mb: 2}}>
                                        <Typography variant="subtitle1" color="primary" fontWeight={600} mb={2}><Edit
                                            sx={{mr: 1}}/> Edit Reading</Typography>
                                        <Box component="form" onSubmit={e => handleEditSubmit(e, reading._id)}
                                             display="flex" flexWrap="wrap" gap={2} alignItems="center">
                                            <TextField
                                                label="Reading Date"
                                                type="date"
                                                value={editingReading?.date.split('T')[0]}
                                                onChange={e => handleEditFormChange('date', e.target.value)}
                                                sx={{flex: 1, minWidth: 120}}
                                                size="small"
                                                slotProps={{
                                                    inputLabel: {
                                                        shrink: true,
                                                    },
                                                }}
                                            />

                                            <TextField
                                                label="Consumption (kWh)"
                                                value={editingReading?.total_kwh_consumed}
                                                onChange={e => handleEditFormChange('total_kwh_consumed', e.target.value)}
                                                sx={{flex: 1, minWidth: 120}}
                                                size="small"
                                                type="number"
                                                slotProps={{
                                                    input: {
                                                        inputProps: {
                                                            min: 0,
                                                            step: 0.01,
                                                        },
                                                    },
                                                }}
                                            />

                                            <TextField
                                                label={`Price (${getCurrencySymbol(currency)})`}
                                                type="number"
                                                value={editingReading?.price}
                                                onChange={e => handleEditFormChange('price', e.target.value)}
                                                sx={{flex: 1, minWidth: 120}}
                                                size="small"
                                                slotProps={{
                                                    input: {
                                                        inputProps: {
                                                            min: 0,
                                                            step: 0.0001
                                                        },
                                                    },
                                                }}
                                            />
                                            <Box display="flex" gap={1} ml="auto">
                                                <Button onClick={handleCancelEdit} variant="outlined">Cancel</Button>
                                                <Button type="submit" variant="contained" color="primary"
                                                        startIcon={<Save/>}>Save</Button>
                                            </Box>
                                        </Box>
                                    </Paper>
                                )}
                            </Paper>
                        ))}
                    </Box>
                    <Snackbar
                        open={!!successMessage}
                        autoHideDuration={3000}
                        onClose={() => setSuccessMessage(null)}
                        message={successMessage}
                        anchorOrigin={{vertical: 'top', horizontal: 'center'}}
                    />
                </Paper>
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{mt: 6}}>
            <Paper elevation={3} sx={{p: {xs: 2, sm: 4}, borderRadius: 3}}>
                <Typography variant="h5" align="center" fontWeight={700} gutterBottom>
                    Consumption History
                </Typography>
                <Grid container spacing={3} sx={{mb: 3}}>
                    <Grid sx={{width: {xs: '100%', md: '33.33%'}}}>
                        <Paper elevation={1} sx={{p: 2, height: '100%'}}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>Total
                                Readings</Typography>
                            <Box display="flex" alignItems="center" gap={1} mb={1}>
                                <BarChart color="primary"/>
                                <Typography variant="h4" color="primary.main"
                                            fontWeight={700}>{readings.length}</Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary">energy consumption records</Typography>
                            <Typography variant="caption" color="text.secondary">Last
                                reading: {formatDate(readings[0]?.date)}</Typography>
                        </Paper>
                    </Grid>

                    <Grid sx={{width: {xs: '100%', md: '33.33%'}}}>
                        <Paper elevation={1} sx={{p: 2, height: '100%'}}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>Avg.
                                Consumption</Typography>
                            <Box display="flex" alignItems="center" gap={1} mb={1}>
                                <ElectricBolt color="primary"/>
                                <Typography variant="h4" color="primary.main"
                                            fontWeight={700}>{averageKwh.toFixed(1)}</Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary">kWh per reading</Typography>
                            <Typography variant="caption" color="text.secondary">Based
                                on {readings.length} readings</Typography>
                        </Paper>
                    </Grid>

                    <Grid sx={{width: {xs: '100%', md: '33.33%'}}}>
                        <Paper elevation={1} sx={{p: 2, height: '100%'}}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>Total
                                Spending</Typography>
                            <Box display="flex" alignItems="center" gap={1} mb={1}>
                                <TrendingUp color="primary"/>
                                <Typography variant="h4" color="primary.main"
                                            fontWeight={700}>{getCurrencySymbol(currency)} {totalSpending.toFixed(2)}</Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary">on electricity</Typography>
                            <Typography variant="caption"
                                        color="text.secondary">Avg: {getCurrencySymbol(currency)} {averageMonthlySpending.toFixed(2)}/month</Typography>
                        </Paper>
                    </Grid>
                </Grid>
                <TableContainer component={Paper} sx={{mt: 2}}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Date</TableCell>
                                <TableCell>Consumption (kWh)</TableCell>
                                <TableCell>Price</TableCell>
                                <TableCell align="right">Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {readings.map((reading) => (
                                <React.Fragment key={reading._id}>
                                    <TableRow>
                                        <TableCell>{formatDate(reading.date)}</TableCell>
                                        <TableCell>
                                            <Typography component="span" color="primary"
                                                        fontWeight={600}>{reading.total_kwh_consumed.toFixed(2)}</Typography>
                                            <Typography component="span" variant="caption" color="text.secondary"
                                                        sx={{ml: 1}}>kWh</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography component="span" color="primary"
                                                        fontWeight={600}>{getCurrencySymbol(currency)} {reading.price.toFixed(2)}</Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                            {isMobile ? (
                                                <>
                                                    <IconButton
                                                        size="small"
                                                        onClick={e => handleActionMenuOpen(e, reading._id)}
                                                    >
                                                        <MoreVert/>
                                                    </IconButton>
                                                    <Menu
                                                        anchorEl={actionMenuAnchor}
                                                        open={actionMenuId === reading._id}
                                                        onClose={handleActionMenuClose}
                                                        anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
                                                        transformOrigin={{vertical: 'top', horizontal: 'right'}}
                                                    >
                                                        <MenuItem onClick={() => {
                                                            handleEditClick(reading._id);
                                                            handleActionMenuClose();
                                                        }}>
                                                            <Edit fontSize="small" sx={{mr: 1}}/> Edit
                                                        </MenuItem>
                                                        <MenuItem onClick={() => {
                                                            handleDetailClick(reading._id);
                                                            handleActionMenuClose();
                                                        }}>
                                                            <Info fontSize="small" sx={{mr: 1}}/> Details
                                                        </MenuItem>
                                                        <MenuItem onClick={() => {
                                                            handleDeleteClick(reading._id);
                                                            handleActionMenuClose();
                                                        }}>
                                                            <Delete fontSize="small" sx={{mr: 1}} color="error"/> Delete
                                                        </MenuItem>
                                                    </Menu>
                                                </>
                                            ) : (
                                                <>
                                                    <IconButton onClick={() => handleEditClick(reading._id)}
                                                                color="primary" size="small"><Edit
                                                        fontSize="small"/></IconButton>
                                                    <IconButton onClick={() => handleDetailClick(reading._id)}
                                                                color="info" size="small"><Info
                                                        fontSize="small"/></IconButton>
                                                    <IconButton onClick={() => handleDeleteClick(reading._id)}
                                                                color="error" size="small"><Delete
                                                        fontSize="small"/></IconButton>
                                                </>
                                            )}
                                        </TableCell>
                                    </TableRow>

                                    {/* Details view */}
                                    {expandedId === reading._id && (
                                        <TableRow>
                                            <TableCell colSpan={4}>
                                                <Paper elevation={1} sx={{p: 2, mb: 2}}>
                                                    <Typography variant="subtitle1" color="primary" fontWeight={600}
                                                                mb={2}><Info sx={{mr: 1}}/> Reading Details</Typography>
                                                    <Grid container spacing={2}>
                                                        <Grid>
                                                            <Typography variant="body2" color="text.secondary">Reading
                                                                Date</Typography>
                                                            <Typography>{formatDate(reading.date)}</Typography>
                                                            <Typography variant="body2"
                                                                        color="text.secondary">Consumption</Typography>
                                                            <Typography>{reading.total_kwh_consumed.toFixed(2)} kWh</Typography>
                                                            <Typography variant="body2"
                                                                        color="text.secondary">Price</Typography>
                                                            <Typography>{getCurrencySymbol(currency)} {reading.price.toFixed(2)}</Typography>
                                                            <Typography variant="body2" color="text.secondary">Last
                                                                Modified</Typography>
                                                            <Typography>{formatTimestamp(reading.modified_date)}</Typography>
                                                            <Typography variant="body2" color="text.secondary">File
                                                                Name</Typography>
                                                            <Typography>{reading.file_name || 'Not available'}</Typography>
                                                        </Grid>
                                                        <Grid>
                                                            <Tabs
                                                                value={activeImageTab}
                                                                onChange={(_, v) => setActiveImageTab(v)}
                                                                textColor="primary"
                                                                indicatorColor="primary"
                                                                variant="fullWidth"
                                                                sx={{mb: 2}}
                                                            >
                                                                <Tab
                                                                    icon={<Image sx={{fontSize: isMobile ? 28 : 20}}/>}
                                                                    label="Original"
                                                                    value="original"
                                                                    sx={{
                                                                        minWidth: isMobile ? 60 : undefined,
                                                                        py: isMobile ? 2 : undefined
                                                                    }}
                                                                />
                                                                <Tab
                                                                    icon={<Label sx={{fontSize: isMobile ? 28 : 20}}/>}
                                                                    label="Labeled"
                                                                    value="labeled"
                                                                    sx={{
                                                                        minWidth: isMobile ? 60 : undefined,
                                                                        py: isMobile ? 2 : undefined
                                                                    }}
                                                                />
                                                            </Tabs>
                                                            <Box sx={{
                                                                minHeight: 120,
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center'
                                                            }}>
                                                                {activeImageTab === 'original' && (
                                                                    reading.original_file ? (
                                                                        <img
                                                                            src={getFileUrl(reading.original_file)}
                                                                            alt="Original Meter Reading"
                                                                            style={{
                                                                                maxWidth: '100%',
                                                                                maxHeight: 300,
                                                                                objectFit: 'contain',
                                                                                borderRadius: 8
                                                                            }}
                                                                        />
                                                                    ) : (
                                                                        <Typography color="text.secondary">No original
                                                                            image available</Typography>
                                                                    )
                                                                )}
                                                                {activeImageTab === 'labeled' && (
                                                                    reading.label_file ? (
                                                                        <img
                                                                            src={getFileUrl(reading.label_file)}
                                                                            alt="Labeled Meter Reading"
                                                                            style={{
                                                                                maxWidth: '100%',
                                                                                maxHeight: 300,
                                                                                objectFit: 'contain',
                                                                                borderRadius: 8
                                                                            }}
                                                                        />
                                                                    ) : (
                                                                        <Typography color="text.secondary">No labeled
                                                                            image available</Typography>
                                                                    )
                                                                )}
                                                            </Box>
                                                        </Grid>
                                                    </Grid>
                                                </Paper>
                                            </TableCell>
                                        </TableRow>
                                    )}

                                    {/* Edit mode */}
                                    {editingId === reading._id && editingReading && (
                                        <TableRow>
                                            <TableCell colSpan={4}>
                                                <Paper elevation={1} sx={{p: 2, mb: 2}}>
                                                    <Typography variant="subtitle1" color="primary" fontWeight={600}
                                                                mb={2}><Edit sx={{mr: 1}}/> Edit Reading</Typography>
                                                    <Box component="form"
                                                         onSubmit={e => handleEditSubmit(e, reading._id)} display="flex"
                                                         flexWrap="wrap" gap={2} alignItems="center">
                                                        <TextField
                                                            label="Reading Date"
                                                            type="date"
                                                            value={editingReading?.date.split('T')[0]}
                                                            onChange={e => handleEditFormChange('date', e.target.value)}
                                                            sx={{flex: 1, minWidth: 120}}
                                                            size="small"
                                                            slotProps={{
                                                                inputLabel: {
                                                                    shrink: true,
                                                                },
                                                            }}
                                                        />
                                                        <TextField
                                                            label="Consumption (kWh)"
                                                            type="number"
                                                            value={editingReading?.total_kwh_consumed}
                                                            onChange={e => handleEditFormChange('total_kwh_consumed', e.target.value)}
                                                            sx={{flex: 1, minWidth: 120}}
                                                            size="small"
                                                            slotProps={{
                                                                input: {
                                                                    inputProps: {
                                                                        min: 0,
                                                                        step: 0.01,
                                                                    },
                                                                },
                                                            }}
                                                        />
                                                        <TextField
                                                            label={`Price (${getCurrencySymbol(currency)})`}
                                                            type="number"
                                                            value={editingReading?.price}
                                                            onChange={e => handleEditFormChange('price', e.target.value)}
                                                            sx={{flex: 1, minWidth: 120}}
                                                            size="small"
                                                            slotProps={{
                                                                input: {
                                                                    inputProps: {
                                                                        min: 0,
                                                                        step: 0.0001,
                                                                    },
                                                                },
                                                            }}
                                                        />
                                                        <Box display="flex" gap={1} ml="auto">
                                                            <Button onClick={handleCancelEdit}
                                                                    variant="outlined">Cancel</Button>
                                                            <Button type="submit" variant="contained" color="primary"
                                                                    startIcon={<Save/>}>Save</Button>
                                                        </Box>
                                                    </Box>
                                                </Paper>
                                            </TableCell>
                                        </TableRow>
                                    )}

                                    {/* Delete confirmation */}
                                    {deleteConfirmId === reading._id && (
                                        <TableRow>
                                            <TableCell colSpan={4}>
                                                <Paper elevation={1} sx={{p: 2, mb: 2, bgcolor: 'error.lighter'}}>
                                                    <Typography variant="subtitle1" color="error" fontWeight={600}
                                                                mb={2}><Delete sx={{mr: 1}}/> Delete
                                                        Reading</Typography>
                                                    <Typography mb={2}>Are you sure you want to delete the reading
                                                        from <b>{formatDate(reading.date)}</b>? This action cannot be
                                                        undone.</Typography>
                                                    <Box display="flex" gap={1} justifyContent="flex-end">
                                                        <Button onClick={handleCancelDelete}
                                                                variant="outlined">Cancel</Button>
                                                        <Button onClick={() => handleDeleteConfirm(reading._id)}
                                                                variant="contained" color="error" startIcon={<Delete/>}>Confirm
                                                            Delete</Button>
                                                    </Box>
                                                </Paper>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </React.Fragment>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <Snackbar
                    open={!!successMessage}
                    autoHideDuration={3000}
                    onClose={() => setSuccessMessage(null)}
                    message={successMessage}
                    anchorOrigin={{vertical: 'top', horizontal: 'center'}}
                />
            </Paper>
        </Container>
    )
} 