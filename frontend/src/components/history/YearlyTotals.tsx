import {Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography} from '@mui/material';
import {CalendarMonth} from '@mui/icons-material';
import type {YearlyTotal} from './types';

interface YearlyTotalsProps {
    yearlyTotals: YearlyTotal[];
    currency: string;
    getCurrencySymbol: (currencyCode: string) => string;
    isMobile: boolean;
}

export default function YearlyTotals({yearlyTotals, currency, getCurrencySymbol, isMobile}: YearlyTotalsProps) {
    if (yearlyTotals.length === 0) {
        return (
            <Paper elevation={3} sx={{p: 3, borderRadius: 3, textAlign: 'center'}}>
                <Typography variant="body1" color="text.secondary">
                    No yearly data available
                </Typography>
            </Paper>
        );
    }

    return (
        <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden', borderTop: '3px solid', borderTopColor: 'primary.main' }}>
            <Box sx={{ px: 3, py: 2, display: 'flex', alignItems: 'center', gap: 1, borderBottom: 1, borderColor: 'divider' }}>
                <CalendarMonth color="primary" />
                <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
                    Yearly View
                </Typography>
            </Box>
            <TableContainer sx={{ overflowX: 'auto' }}>
                <Table size={isMobile ? 'small' : 'medium'}>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 700 }}>Year</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Total Consumption</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Total Spending</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Readings</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {yearlyTotals.map((yearly) => (
                            <TableRow
                                key={yearly.year}
                                sx={{
                                    '&:hover': { bgcolor: 'action.hover' },
                                    transition: 'background-color 0.15s',
                                    '&:last-child td': { border: 0 },
                                }}
                            >
                                <TableCell>
                                    <Typography component="span" sx={{ fontWeight: 700, fontSize: '1rem' }}>
                                        {yearly.year}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography component="span" sx={{ color: 'primary.main', fontWeight: 600 }}>
                                        {yearly.totalConsumption.toFixed(2)}
                                    </Typography>
                                    <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                                        kWh
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography component="span" sx={{ color: 'success.main', fontWeight: 600 }}>
                                        {getCurrencySymbol(currency)} {yearly.totalSpending.toFixed(2)}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography component="span" color="text.secondary">
                                        {yearly.readingCount}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );
}

