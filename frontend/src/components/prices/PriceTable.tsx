import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Tooltip,
    Box,
    Chip,
    Typography,
    Paper,
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    ArrowUpward,
    ArrowDownward,
    UnfoldMore,
    CheckCircle,
} from '@mui/icons-material';
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
    isMobile?: boolean;
}

const headerCellSx = {
    fontWeight: 700,
    fontSize: '0.75rem',
    letterSpacing: '0.05em',
    textTransform: 'uppercase' as const,
    py: 1.5,
} as const;

const SortIcon = ({ col, sortConfig }: { col: 'date' | 'price'; sortConfig: SortConfig }) => {
    if (sortConfig.key !== col) return <UnfoldMore sx={{ fontSize: '14px !important', opacity: 0.5, verticalAlign: 'middle', ml: 0.25 }} />;
    return sortConfig.direction === 'ascending'
        ? <ArrowUpward sx={{ fontSize: '14px !important', verticalAlign: 'middle', ml: 0.25 }} />
        : <ArrowDownward sx={{ fontSize: '14px !important', verticalAlign: 'middle', ml: 0.25 }} />;
};

export default function PriceTable({
    prices,
    sortConfig,
    onSort,
    onEditClick,
    onDeleteClick,
    currency,
    getCurrencySymbol,
    formatDate,
    isMobile = false,
}: PriceTableProps) {

    if (prices.length === 0) {
        return (
            <Box sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>
                <Typography variant="body2">
                    No prices defined yet. Add your first electricity rate above.
                </Typography>
            </Box>
        );
    }

    /* ── Mobile card view ─────────────────────────────────────── */
    if (isMobile) {
        return (
            <Box>
                {prices.map((price) => (
                    <Paper
                        key={price._id}
                        elevation={1}
                        sx={{
                            mb: 1.5, borderRadius: 2, overflow: 'hidden',
                            border: price.is_default ? '1px solid' : 'none',
                            borderColor: 'success.main',
                        }}
                    >
                        {/* Card header bar */}
                        <Box sx={{
                            px: 2, py: 1,
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            bgcolor: price.is_default ? 'success.main' : 'action.hover',
                        }}>
                            <Typography
                                variant="caption"
                                sx={{
                                    fontWeight: 700,
                                    color: price.is_default ? 'success.contrastText' : 'text.secondary',
                                    letterSpacing: '0.04em',
                                    textTransform: 'uppercase',
                                }}
                            >
                                {formatDate(price.date)}
                            </Typography>
                            {price.is_default && (
                                <Chip
                                    icon={<CheckCircle />}
                                    label="Default"
                                    size="small"
                                    sx={{
                                        bgcolor: 'rgba(255,255,255,0.25)',
                                        color: 'success.contrastText',
                                        fontWeight: 700,
                                        fontSize: '0.65rem',
                                        height: 20,
                                        '& .MuiChip-icon': { color: 'inherit' },
                                    }}
                                />
                            )}
                        </Box>

                        {/* Rate + actions */}
                        <Box sx={{ px: 2, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box>
                                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                    Rate
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                                    <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 700, lineHeight: 1.2 }}>
                                        {getCurrencySymbol(currency)}{price.price.toFixed(4)}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">/kWh</Typography>
                                </Box>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                                <Tooltip title="Edit">
                                    <IconButton size="small" color="primary" onClick={() => onEditClick(price)}>
                                        <EditIcon />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete">
                                    <IconButton size="small" color="error" onClick={() => onDeleteClick(price._id)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        </Box>
                    </Paper>
                ))}
            </Box>
        );
    }

    /* ── Desktop table view ───────────────────────────────────── */
    return (
        <TableContainer sx={{ overflowX: 'auto' }}>
            <Table size="medium">
                <TableHead>
                    <TableRow>
                        <TableCell
                            sx={{ ...headerCellSx, cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
                            onClick={() => onSort('date')}
                        >
                            Date <SortIcon col="date" sortConfig={sortConfig} />
                        </TableCell>
                        <TableCell
                            sx={{ ...headerCellSx, cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
                            onClick={() => onSort('price')}
                        >
                            Price / kWh <SortIcon col="price" sortConfig={sortConfig} />
                        </TableCell>
                        <TableCell sx={headerCellSx}>Default</TableCell>
                        <TableCell sx={{ ...headerCellSx, textAlign: 'right' }}>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {prices.map((price) => (
                        <TableRow
                            key={price._id}
                            sx={{
                                bgcolor: price.is_default ? 'rgba(46,125,50,0.06)' : 'transparent',
                                '&:hover': { bgcolor: price.is_default ? 'rgba(46,125,50,0.12)' : 'action.hover' },
                                transition: 'background-color 0.15s',
                                '&:last-child td': { border: 0 },
                            }}
                        >
                            <TableCell sx={{ fontWeight: price.is_default ? 600 : 400 }}>
                                {formatDate(price.date)}
                            </TableCell>
                            <TableCell>
                                <Typography component="span" sx={{ color: 'primary.main', fontWeight: 600 }}>
                                    {getCurrencySymbol(currency)}{price.price.toFixed(4)}
                                </Typography>
                                <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                                    /kWh
                                </Typography>
                            </TableCell>
                            <TableCell>
                                {price.is_default ? (
                                    <Chip
                                        icon={<CheckCircle />}
                                        label="Default"
                                        size="small"
                                        color="success"
                                        variant="outlined"
                                        sx={{ fontWeight: 600 }}
                                    />
                                ) : (
                                    <Typography variant="caption" color="text.disabled">—</Typography>
                                )}
                            </TableCell>
                            <TableCell align="right">
                                <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                                    <Tooltip title="Edit price">
                                        <IconButton size="small" color="primary" onClick={() => onEditClick(price)}>
                                            <EditIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Delete price">
                                        <IconButton size="small" color="error" onClick={() => onDeleteClick(price._id)}>
                                            <DeleteIcon />
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
