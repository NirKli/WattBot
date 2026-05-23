import {Paper, Typography, Box, IconButton, Menu, MenuItem, Divider} from '@mui/material';
import {MoreVert, Edit, Info, Delete, ElectricBolt} from '@mui/icons-material';
import type {MonthlyConsumption} from './types';

interface ReadingCardProps {
    reading: MonthlyConsumption;
    monthlyUsage: number | null;
    onEditClick: (id: string) => void;
    onDetailClick: (id: string) => void;
    onDeleteClick: (id: string) => void;
    actionMenuAnchor: HTMLElement | null;
    actionMenuId: string | null;
    onActionMenuOpen: (event: React.MouseEvent<HTMLElement>, id: string) => void;
    onActionMenuClose: () => void;
    getCurrencySymbol: (currencyCode: string) => string;
    currency: string;
    formatDate: (dateString: string | undefined) => string;
}

export default function ReadingCard({
    reading,
    monthlyUsage,
    onEditClick,
    onDetailClick,
    onDeleteClick,
    actionMenuAnchor,
    actionMenuId,
    onActionMenuOpen,
    onActionMenuClose,
    getCurrencySymbol,
    currency,
    formatDate,
}: ReadingCardProps) {
    return (
        <Paper elevation={2} sx={{ mb: 2, borderRadius: 2, overflow: 'hidden' }}>
            {/* Date header bar */}
            <Box sx={{
                px: 2, py: 1,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                bgcolor: 'primary.main',
            }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.contrastText', letterSpacing: '0.04em' }}>
                    {formatDate(reading.date)}
                </Typography>
                <IconButton size="small" onClick={e => onActionMenuOpen(e, reading._id)}
                    sx={{ color: 'primary.contrastText', p: 0.5 }}>
                    <MoreVert />
                </IconButton>
                <Menu
                    anchorEl={actionMenuAnchor}
                    open={actionMenuId === reading._id}
                    onClose={onActionMenuClose}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                    <MenuItem onClick={() => { onEditClick(reading._id); onActionMenuClose(); }}>
                        <Edit fontSize="small" sx={{ mr: 1, color: 'primary.main' }} /> Edit
                    </MenuItem>
                    <MenuItem onClick={() => { onDetailClick(reading._id); onActionMenuClose(); }}>
                        <Info fontSize="small" sx={{ mr: 1, color: 'info.main' }} /> Details
                    </MenuItem>
                    <MenuItem onClick={() => { onDeleteClick(reading._id); onActionMenuClose(); }}>
                        <Delete fontSize="small" sx={{ mr: 1, color: 'error.main' }} /> Delete
                    </MenuItem>
                </Menu>
            </Box>

            {/* Metrics grid */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', p: 2, gap: 2 }}>
                {/* Monthly usage — hero metric */}
                <Box sx={{ gridColumn: '1 / -1' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        Used this period
                    </Typography>
                    {monthlyUsage == null ? (
                        <Typography variant="body2" color="text.disabled" sx={{ mt: 0.25 }}>
                            First reading — no delta yet
                        </Typography>
                    ) : (
                        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, mt: 0.25 }}>
                            <Typography variant="h5" sx={{ color: 'success.main', fontWeight: 700, lineHeight: 1 }}>
                                +{monthlyUsage.toFixed(1)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>kWh</Typography>
                        </Box>
                    )}
                </Box>

                <Divider sx={{ gridColumn: '1 / -1' }} />

                {/* Total meter reading */}
                <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        Meter total
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
                        <ElectricBolt sx={{ color: 'primary.main', fontSize: '14px !important' }} />
                        <Typography variant="body1" sx={{ color: 'primary.main', fontWeight: 700 }}>
                            {reading.total_kwh_consumed.toFixed(1)}
                            <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>kWh</Typography>
                        </Typography>
                    </Box>
                </Box>

                {/* Bill amount */}
                <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        Bill amount
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'text.primary', fontWeight: 700, mt: 0.25 }}>
                        {getCurrencySymbol(currency)}{reading.price.toFixed(2)}
                    </Typography>
                </Box>
            </Box>
        </Paper>
    );
}
