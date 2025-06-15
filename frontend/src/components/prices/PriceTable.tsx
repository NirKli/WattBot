import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Tooltip,
    Box
} from '@mui/material';
import {Edit as EditIcon, Delete as DeleteIcon} from '@mui/icons-material';
import type {ElectricityPrice, SortConfig} from './types';

interface PriceTableProps {
    prices: ElectricityPrice[];
    sortConfig: SortConfig;
    onSort: (key: 'date' | 'price') => void;
    onEditClick: (price: ElectricityPrice) => void;
    onDeleteClick: (id: string) => void;
    currency: string;
    getCurrencySymbol: (currencyCode: string) => string;
    formatDate: (dateString: string) => string;
}

export default function PriceTable({
    prices,
    sortConfig,
    onSort,
    onEditClick,
    onDeleteClick,
    currency,
    getCurrencySymbol,
    formatDate
}: PriceTableProps) {
    const getSortIcon = (key: 'date' | 'price') => {
        if (sortConfig.key !== key) return null;
        return sortConfig.direction === 'ascending' ? '↑' : '↓';
    };

    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell
                            onClick={() => onSort('date')}
                            sx={{cursor: 'pointer', userSelect: 'none'}}
                        >
                            Date {getSortIcon('date')}
                        </TableCell>
                        <TableCell
                            onClick={() => onSort('price')}
                            sx={{cursor: 'pointer', userSelect: 'none'}}
                        >
                            Price {getSortIcon('price')}
                        </TableCell>
                        <TableCell>Default</TableCell>
                        <TableCell align="right">Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {prices.map((price) => (
                        <TableRow key={price._id}>
                            <TableCell>{formatDate(price.date)}</TableCell>
                            <TableCell>
                                {getCurrencySymbol(currency)}{price.price.toFixed(4)}/kWh
                            </TableCell>
                            <TableCell>{price.is_default ? 'Yes' : 'No'}</TableCell>
                            <TableCell align="right">
                                <Box sx={{display: 'flex', gap: 1, justifyContent: 'flex-end'}}>
                                    <Tooltip title="Edit">
                                        <IconButton
                                            size="small"
                                            onClick={() => onEditClick(price)}
                                            color="primary"
                                        >
                                            <EditIcon/>
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Delete">
                                        <IconButton
                                            size="small"
                                            onClick={() => onDeleteClick(price._id)}
                                            color="error"
                                        >
                                            <DeleteIcon/>
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
} 