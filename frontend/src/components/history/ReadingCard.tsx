import {Paper, Typography, Box, IconButton, Menu, MenuItem} from '@mui/material';
import {MoreVert, Edit, Info, Delete} from '@mui/icons-material';
import type {MonthlyConsumption} from './types';

interface ReadingCardProps {
    reading: MonthlyConsumption;
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
    onEditClick,
    onDetailClick,
    onDeleteClick,
    actionMenuAnchor,
    actionMenuId,
    onActionMenuOpen,
    onActionMenuClose,
    getCurrencySymbol,
    currency,
    formatDate
}: ReadingCardProps) {
    return (
        <Paper elevation={2} sx={{p: 2, mb: 2, borderRadius: 2}}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="subtitle2" color="text.secondary">
                    {formatDate(reading.date)}
                </Typography>
                <IconButton size="small" onClick={e => onActionMenuOpen(e, reading._id)}>
                    <MoreVert/>
                </IconButton>
                <Menu
                    anchorEl={actionMenuAnchor}
                    open={actionMenuId === reading._id}
                    onClose={onActionMenuClose}
                    anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
                    transformOrigin={{vertical: 'top', horizontal: 'right'}}
                >
                    <MenuItem onClick={() => {
                        onEditClick(reading._id);
                        onActionMenuClose();
                    }}>
                        <Edit fontSize="small" sx={{mr: 1}}/> Edit
                    </MenuItem>
                    <MenuItem onClick={() => {
                        onDetailClick(reading._id);
                        onActionMenuClose();
                    }}>
                        <Info fontSize="small" sx={{mr: 1}}/> Details
                    </MenuItem>
                    <MenuItem onClick={() => {
                        onDeleteClick(reading._id);
                        onActionMenuClose();
                    }}>
                        <Delete fontSize="small" sx={{mr: 1}} color="error"/> Delete
                    </MenuItem>
                </Menu>
            </Box>
            <Box mb={1}>
                <Typography variant="body2" color="text.secondary">Consumption</Typography>
                <Typography variant="h6" color="primary" fontWeight={600}>
                    {reading.total_kwh_consumed.toFixed(2)} kWh
                </Typography>
            </Box>
            <Box mb={1}>
                <Typography variant="body2" color="text.secondary">Price</Typography>
                <Typography variant="h6" color="primary" fontWeight={600}>
                    {getCurrencySymbol(currency)} {reading.price.toFixed(2)}
                </Typography>
            </Box>
        </Paper>
    );
} 