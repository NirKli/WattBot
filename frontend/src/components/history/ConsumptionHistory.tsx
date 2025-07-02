import {useState} from 'react';
import {Box, Container, useMediaQuery, useTheme} from '@mui/material';
import {useConsumptionHistory} from './useConsumptionHistory';
import ConsumptionStats from './ConsumptionStats';
import ReadingCard from './ReadingCard';
import ReadingDetails from './ReadingDetails';
import EditReadingForm from './EditReadingForm';
import DeleteReadingDialog from './DeleteReadingDialog';
import type {ImageTab, MonthlyConsumption} from './types';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import InfoIcon from '@mui/icons-material/Info';
import DeleteIcon from '@mui/icons-material/Delete';
import {Typography} from '@mui/material';
import Paper from '@mui/material/Paper';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

export default function ConsumptionHistory() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const [activeImageTab, setActiveImageTab] = useState<ImageTab>('original');
    const [actionMenuAnchor, setActionMenuAnchor] = useState<null | HTMLElement>(null);
    const [actionMenuId, setActionMenuId] = useState<string | null>(null);

    const {
        readings,
        stats,
        currency,
        getCurrencySymbol,
        formatDate,
        formatTimestamp,
        getFileUrl,
        handleEditFormChange,
        handleEditSubmit,
        handleDelete,
    } = useConsumptionHistory();

    // Find the reading being edited or deleted
    const editingReading = readings.find(r => r._id === editingId) || null;
    const deleteReading = readings.find(r => r._id === deleteConfirmId) || null;
    const expandedReading = readings.find(r => r._id === expandedId) || null;

    // Ensure editedReading has all required properties
    const hasRequiredProperties = (reading: Partial<MonthlyConsumption> | null): reading is MonthlyConsumption => {
        if (!reading) return false;
        return (
            typeof reading._id === 'string' &&
            typeof reading.date === 'string' &&
            typeof reading.total_kwh_consumed === 'number' &&
            typeof reading.price === 'number'
        );
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

            {isMobile ? (
                <Box>
                    {readings.map((reading) => (
                        <>
                            <ReadingCard
                                key={reading._id}
                                reading={reading}
                                onEditClick={setEditingId}
                                onDetailClick={id => setExpandedId(expandedId === id ? null : id)}
                                onDeleteClick={setDeleteConfirmId}
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
                            {editingId === reading._id && (
                                <EditReadingForm
                                    reading={reading}
                                    onEditFormChange={handleEditFormChange}
                                    onSubmit={handleEditSubmit}
                                    onCancel={() => setEditingId(null)}
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
                        </>
                    ))}
                </Box>
            ) : (
                <Paper elevation={3} sx={{
                    p: { xs: 1, sm: 4 },
                    borderRadius: 3
                }}>
                    <TableContainer component={Paper} sx={{
                        mt: 2,
                        width: '100%',
                        overflowX: 'auto',
                        '@media (max-width: 600px)': {
                            maxWidth: '100vw',
                            overflowX: 'auto',
                            p: 0,
                        },
                    }}>
                        <Table size={isMobile ? 'small' : 'medium'}>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={isMobile ? { p: '6px 4px', fontSize: '0.95rem' } : {}}>
                                        {isMobile ? 'Date' : 'Date'}
                                    </TableCell>
                                    <TableCell sx={isMobile ? { p: '6px 4px', fontSize: '0.95rem' } : {}}>
                                        {isMobile ? 'Consumption' : 'Consumption (kWh)'}
                                    </TableCell>
                                    <TableCell sx={isMobile ? { p: '6px 4px', fontSize: '0.95rem' } : {}}>
                                        {isMobile ? 'Price' : 'Price'}
                                    </TableCell>
                                    <TableCell align="right" sx={isMobile ? { p: '6px 4px', fontSize: '0.95rem' } : {}}>
                                        {isMobile ? '' : 'Action'}
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {readings.map((reading) => (
                                    <>
                                        <TableRow key={reading._id} sx={isMobile ? { p: 0, fontSize: '0.95rem' } : {}}>
                                            <TableCell sx={isMobile ? { p: '6px 4px', fontSize: '0.95rem' } : {}}>{formatDate(reading.date)}</TableCell>
                                            <TableCell sx={isMobile ? { p: '6px 4px', fontSize: '0.95rem' } : {}}>
                                                <Typography component="span" color="primary" fontWeight={600} fontSize={isMobile ? '1rem' : undefined}>{reading.total_kwh_consumed.toFixed(2)}</Typography>
                                                <Typography component="span" variant="caption" color="text.secondary" sx={{ml: 1, fontSize: isMobile ? '0.85rem' : undefined}}>kWh</Typography>
                                            </TableCell>
                                            <TableCell sx={isMobile ? { p: '6px 4px', fontSize: '0.95rem' } : {}}>
                                                <Typography component="span" color="primary" fontWeight={600} fontSize={isMobile ? '1rem' : undefined}>{getCurrencySymbol(currency)} {reading.price.toFixed(2)}</Typography>
                                            </TableCell>
                                            <TableCell align="right" sx={isMobile ? { p: '6px 4px', fontSize: '0.95rem' } : {}}>
                                                {isMobile ? (
                                                    <>
                                                        <IconButton
                                                            size="small"
                                                            onClick={e => {
                                                                setActionMenuAnchor(e.currentTarget);
                                                                setActionMenuId(reading._id);
                                                            }}
                                                        >
                                                            <MoreVertIcon />
                                                        </IconButton>
                                                        <Menu
                                                            anchorEl={actionMenuAnchor}
                                                            open={actionMenuId === reading._id}
                                                            onClose={() => {
                                                                setActionMenuAnchor(null);
                                                                setActionMenuId(null);
                                                            }}
                                                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                                            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                                                        >
                                                            <MenuItem onClick={() => {
                                                                setEditingId(reading._id);
                                                                setActionMenuAnchor(null);
                                                                setActionMenuId(null);
                                                            }}>
                                                                <EditIcon fontSize="small" sx={{mr: 1}}/> Edit
                                                            </MenuItem>
                                                            <MenuItem onClick={() => {
                                                                setExpandedId(expandedId === reading._id ? null : reading._id);
                                                                setActionMenuAnchor(null);
                                                                setActionMenuId(null);
                                                            }}>
                                                                <InfoIcon fontSize="small" sx={{mr: 1}}/> Details
                                                            </MenuItem>
                                                            <MenuItem onClick={() => {
                                                                setDeleteConfirmId(reading._id);
                                                                setActionMenuAnchor(null);
                                                                setActionMenuId(null);
                                                            }}>
                                                                <DeleteIcon fontSize="small" sx={{mr: 1}} color="error"/> Delete
                                                            </MenuItem>
                                                        </Menu>
                                                    </>
                                                ) : (
                                                    <>
                                                        <IconButton onClick={() => setEditingId(reading._id)} color="primary" size="small"><EditIcon fontSize="small"/></IconButton>
                                                        <IconButton onClick={() => setExpandedId(expandedId === reading._id ? null : reading._id)} color="info" size="small"><InfoIcon fontSize="small"/></IconButton>
                                                        <IconButton onClick={() => setDeleteConfirmId(reading._id)} color="error" size="small"><DeleteIcon fontSize="small"/></IconButton>
                                                    </>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                        {expandedId === reading._id && expandedReading && (
                                            <TableRow>
                                                <TableCell colSpan={4}>
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
                                        {editingId === reading._id && editingReading && hasRequiredProperties(editingReading) && (
                                            <TableRow>
                                                <TableCell colSpan={4}>
                                                    <EditReadingForm
                                                        reading={editingReading}
                                                        onEditFormChange={handleEditFormChange}
                                                        onSubmit={handleEditSubmit}
                                                        onCancel={() => setEditingId(null)}
                                                        currency={currency}
                                                        getCurrencySymbol={getCurrencySymbol}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        )}
                                        {deleteConfirmId === reading._id && deleteReading && (
                                            <TableRow>
                                                <TableCell colSpan={4}>
                                                    <DeleteReadingDialog
                                                        readingDate={formatDate(deleteReading.date)}
                                                        onCancel={() => setDeleteConfirmId(null)}
                                                        onConfirm={() => { if (deleteReading) handleDelete(deleteReading._id); }}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            )}
        </Container>
    );
}