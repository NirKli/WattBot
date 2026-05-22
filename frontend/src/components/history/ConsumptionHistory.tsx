import {useState, Fragment} from 'react';
import {Box, Container, useMediaQuery, useTheme, ToggleButton, ToggleButtonGroup} from '@mui/material';
import {useConsumptionHistory} from './useConsumptionHistory';
import ConsumptionStats from './ConsumptionStats';
import ReadingCard from './ReadingCard';
import ReadingDetails from './ReadingDetails';
import EditReadingForm from './EditReadingForm';
import DeleteReadingDialog from './DeleteReadingDialog';
import YearlyTotals from './YearlyTotals';
import type {ImageTab, ViewMode} from './types';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import {Typography} from '@mui/material';
import Paper from '@mui/material/Paper';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ViewListIcon from '@mui/icons-material/ViewList';
import DownloadIcon from '@mui/icons-material/Download';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';

export default function ConsumptionHistory() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const [activeImageTab, setActiveImageTab] = useState<ImageTab>('original');
    const [actionMenuAnchor, setActionMenuAnchor] = useState<null | HTMLElement>(null);
    const [actionMenuId, setActionMenuId] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>('monthly');
    const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null);

    const {
        readings,
        stats,
        yearlyTotals,
        currency,
        getCurrencySymbol,
        formatDate,
        formatTimestamp,
        getFileUrl,
        handleEditFormChange,
        handleEditSubmit,
        handleDelete,
        editedReading,
        handleEdit,
        handleEditCancel,
        editingId,
        handleExport,
    } = useConsumptionHistory();

    // Find the reading being edited or deleted
    const deleteReading = readings.find(r => r._id === deleteConfirmId) || null;
    const expandedReading = readings.find(r => r._id === expandedId) || null;
    const readingDeltaById: Record<string, number | null> = {};
    const chronologicallySortedReadings = [...readings].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    chronologicallySortedReadings.forEach((reading, index) => {
        if (index === 0) {
            readingDeltaById[reading._id] = null;
            return;
        }

        const previousReading = chronologicallySortedReadings[index - 1];
        const delta = reading.total_kwh_consumed - previousReading.total_kwh_consumed;
        readingDeltaById[reading._id] = delta >= 0 ? delta : null;
    });

    const handleViewModeChange = (_event: React.MouseEvent<HTMLElement>, newViewMode: ViewMode | null) => {
        if (newViewMode !== null) {
            setViewMode(newViewMode);
        }
    };

    const handleExportMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setExportMenuAnchor(event.currentTarget);
    };

    const handleExportMenuClose = () => {
        setExportMenuAnchor(null);
    };

    const handleExportClick = async (format: 'csv' | 'xlsx' | 'pdf') => {
        handleExportMenuClose();
        await handleExport(format);
    };

    const onEditClick = (id: string) => {
        setDeleteConfirmId(null);
        setExpandedId(null);
        handleEdit(id);
    };

    const onDetailClick = (id: string) => {
        setDeleteConfirmId(null);
        handleEditCancel();
        setExpandedId(expandedId === id ? null : id);
    };

    const onDeleteClick = (id: string) => {
        setExpandedId(null);
        handleEditCancel();
        setDeleteConfirmId(id);
    };

    return (
        <Container maxWidth="lg">
            <Box sx={{mb: 4}}>
                <ConsumptionStats
                    stats={stats}
                    currency={currency}
                    getCurrencySymbol={getCurrencySymbol}
                    formatDate={formatDate}
                    formatTimestamp={formatTimestamp}
                    isMobile={isMobile}
                />
            </Box>

            <Box sx={{mb: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, flexWrap: 'wrap'}}>
                <ToggleButtonGroup
                    value={viewMode}
                    exclusive
                    onChange={handleViewModeChange}
                    aria-label="view mode"
                    size={isMobile ? 'small' : 'medium'}
                >
                    <ToggleButton value="monthly" aria-label="monthly view">
                        Monthly
                    </ToggleButton>
                    <ToggleButton value="yearly" aria-label="yearly view">
                        Yearly
                    </ToggleButton>
                </ToggleButtonGroup>
                <Tooltip title="Export data">
                    <Button
                        variant="outlined"
                        startIcon={<DownloadIcon />}
                        onClick={handleExportMenuOpen}
                        size={isMobile ? 'small' : 'medium'}
                        sx={{ textTransform: 'none' }}
                    >
                        Export
                    </Button>
                </Tooltip>
                <Menu
                    anchorEl={exportMenuAnchor}
                    open={Boolean(exportMenuAnchor)}
                    onClose={handleExportMenuClose}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                >
                    <MenuItem onClick={() => handleExportClick('csv')}>
                        Export as CSV
                    </MenuItem>
                    <MenuItem onClick={() => handleExportClick('xlsx')}>
                        Export as Excel (XLSX)
                    </MenuItem>
                    <MenuItem onClick={() => handleExportClick('pdf')}>
                        Export as PDF
                    </MenuItem>
                </Menu>
            </Box>

            {viewMode === 'yearly' ? (
                <YearlyTotals
                    yearlyTotals={yearlyTotals}
                    currency={currency}
                    getCurrencySymbol={getCurrencySymbol}
                    isMobile={isMobile}
                />
            ) : isMobile ? (
                <Box>
                    <Box sx={{mb: 2, display: 'flex', alignItems: 'center', gap: 1}}>
                        <ViewListIcon color="primary" />
                        <Typography variant="h6" component="h2">
                            Monthly View
                        </Typography>
                    </Box>
                    {readings.map((reading) => (
                        <Fragment key={reading._id}>
                            <ReadingCard
                                key={reading._id}
                                reading={reading}
                                monthlyUsage={readingDeltaById[reading._id]}
                                onEditClick={onEditClick}
                                onDetailClick={onDetailClick}
                                onDeleteClick={onDeleteClick}
                                actionMenuAnchor={actionMenuAnchor}
                                actionMenuId={actionMenuId}
                                onActionMenuOpen={(e, id) => { setActionMenuAnchor(e.currentTarget); setActionMenuId(id); }}
                                onActionMenuClose={() => { setActionMenuAnchor(null); setActionMenuId(null); }}
                                getCurrencySymbol={getCurrencySymbol}
                                currency={currency}
                                formatDate={formatDate}
                            />
                            {expandedId === reading._id && (
                                <ReadingDetails
                                    reading={reading}
                                    activeImageTab={activeImageTab}
                                    onImageTabChange={setActiveImageTab}
                                    getFileUrl={getFileUrl}
                                    formatDate={formatDate}
                                    formatTimestamp={formatTimestamp}
                                    getCurrencySymbol={getCurrencySymbol}
                                    currency={currency}
                                    isMobile={isMobile}
                                />
                            )}
                            {editingId === reading._id && editedReading && (
                                <EditReadingForm
                                    reading={editedReading}
                                    onEditFormChange={handleEditFormChange}
                                    onSubmit={handleEditSubmit}
                                    onCancel={handleEditCancel}
                                    currency={currency}
                                    getCurrencySymbol={getCurrencySymbol}
                                />
                            )}
                            {deleteConfirmId === reading._id && (
                                <DeleteReadingDialog
                                    readingDate={formatDate(reading.date)}
                                    onCancel={() => setDeleteConfirmId(null)}
                                    onConfirm={() => handleDelete(reading._id)}
                                />
                            )}
                        </Fragment>
                    ))}
                </Box>
            ) : (
                <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden', borderTop: '3px solid', borderTopColor: 'primary.main' }}>
                    <Box sx={{ px: 3, py: 2, display: 'flex', alignItems: 'center', gap: 1, borderBottom: 1, borderColor: 'divider' }}>
                        <ViewListIcon color="primary" />
                        <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
                            Monthly View
                        </Typography>
                    </Box>
                    <TableContainer sx={{ overflowX: 'auto' }}>
                        <Table size="medium" sx={{
                            '& .MuiTableCell-root': { py: 1.75, px: 2.5, fontSize: '0.875rem' },
                            '& .MuiTableCell-head': { py: 1.25 },
                        }}>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Consumption (kWh)</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Monthly Usage (kWh)</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Price</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {readings.map((reading) => (
                                    <Fragment key={reading._id}>
                                        <TableRow
                                            onClick={() => onDetailClick(reading._id)}
                                            sx={{
                                                cursor: 'pointer',
                                                bgcolor: expandedId === reading._id ? 'action.selected' : 'transparent',
                                                '&:hover': { bgcolor: expandedId === reading._id ? 'action.selected' : 'action.hover' },
                                                transition: 'background-color 0.15s',
                                                '&:last-child td': { border: 0 },
                                            }}
                                        >
                                            <TableCell sx={{ fontWeight: 500 }}>{formatDate(reading.date)}</TableCell>
                                            <TableCell>
                                                <Typography component="span" sx={{ color: 'primary.main', fontWeight: 600 }}>
                                                    {reading.total_kwh_consumed.toFixed(2)}
                                                </Typography>
                                                <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>kWh</Typography>
                                            </TableCell>
                                            <TableCell>
                                                {readingDeltaById[reading._id] == null ? (
                                                    <Typography component="span" color="text.disabled">—</Typography>
                                                ) : (
                                                    <>
                                                        <Typography component="span" sx={{ color: 'success.main', fontWeight: 600 }}>
                                                            +{readingDeltaById[reading._id]!.toFixed(2)}
                                                        </Typography>
                                                        <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>kWh</Typography>
                                                    </>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Typography component="span" sx={{ color: 'primary.main', fontWeight: 600 }}>
                                                    {getCurrencySymbol(currency)} {reading.price.toFixed(2)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="right" onClick={e => e.stopPropagation()}>
                                                <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                                                    <Tooltip title="Edit">
                                                        <IconButton onClick={() => onEditClick(reading._id)} color="primary" size="small"
                                                            sx={{ '&:hover': { bgcolor: 'primary.main', color: 'primary.contrastText' } }}>
                                                            <EditIcon fontSize="small"/>
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Delete">
                                                        <IconButton onClick={() => onDeleteClick(reading._id)} color="error" size="small"
                                                            sx={{ '&:hover': { bgcolor: 'error.main', color: 'error.contrastText' } }}>
                                                            <DeleteIcon fontSize="small"/>
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                        {expandedId === reading._id && expandedReading && (
                                            <TableRow>
                                                <TableCell colSpan={5}>
                                                    <ReadingDetails
                                                        reading={expandedReading}
                                                        activeImageTab={activeImageTab}
                                                        onImageTabChange={setActiveImageTab}
                                                        getFileUrl={getFileUrl}
                                                        formatDate={formatDate}
                                                        formatTimestamp={formatTimestamp}
                                                        getCurrencySymbol={getCurrencySymbol}
                                                        currency={currency}
                                                        isMobile={isMobile}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        )}
                                        {editingId === reading._id && editedReading && (
                                            <TableRow>
                                                <TableCell colSpan={5}>
                                                    <EditReadingForm
                                                        reading={editedReading}
                                                        onEditFormChange={handleEditFormChange}
                                                        onSubmit={handleEditSubmit}
                                                        onCancel={handleEditCancel}
                                                        currency={currency}
                                                        getCurrencySymbol={getCurrencySymbol}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        )}
                                        {deleteConfirmId === reading._id && deleteReading && (
                                            <TableRow>
                                                <TableCell colSpan={5}>
                                                    <DeleteReadingDialog
                                                        readingDate={formatDate(deleteReading.date)}
                                                        onCancel={() => setDeleteConfirmId(null)}
                                                        onConfirm={() => { if (deleteReading) handleDelete(deleteReading._id); }}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </Fragment>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            )}
        </Container>
    );
}