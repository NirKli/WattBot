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
        <Paper elevation={3} sx={{
            p: { xs: 1, sm: 4 },
            borderRadius: 3
        }}>
            <Box sx={{mb: 2, display: 'flex', alignItems: 'center', gap: 1}}>
                <CalendarMonth color="primary" />
                <Typography variant="h6" component="h2">
                    Yearly View
                </Typography>
            </Box>
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
                                Year
                            </TableCell>
                            <TableCell sx={isMobile ? { p: '6px 4px', fontSize: '0.95rem' } : {}}>
                                Total Consumption
                            </TableCell>
                            <TableCell sx={isMobile ? { p: '6px 4px', fontSize: '0.95rem' } : {}}>
                                Total Spending
                            </TableCell>
                            <TableCell sx={isMobile ? { p: '6px 4px', fontSize: '0.95rem' } : {}}>
                                Readings
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {yearlyTotals.map((yearly) => (
                            <TableRow key={yearly.year} sx={isMobile ? { p: 0, fontSize: '0.95rem' } : {}}>
                                <TableCell sx={isMobile ? { p: '6px 4px', fontSize: '0.95rem' } : {}}>
                                    <Typography component="span" fontWeight={600} fontSize={isMobile ? '1rem' : undefined}>
                                        {yearly.year}
                                    </Typography>
                                </TableCell>
                                <TableCell sx={isMobile ? { p: '6px 4px', fontSize: '0.95rem' } : {}}>
                                    <Typography component="span" color="primary" fontWeight={600} fontSize={isMobile ? '1rem' : undefined}>
                                        {yearly.totalConsumption.toFixed(2)}
                                    </Typography>
                                    <Typography component="span" variant="caption" color="text.secondary" sx={{ml: 1, fontSize: isMobile ? '0.85rem' : undefined}}>
                                        kWh
                                    </Typography>
                                </TableCell>
                                <TableCell sx={isMobile ? { p: '6px 4px', fontSize: '0.95rem' } : {}}>
                                    <Typography component="span" color="primary" fontWeight={600} fontSize={isMobile ? '1rem' : undefined}>
                                        {getCurrencySymbol(currency)} {yearly.totalSpending.toFixed(2)}
                                    </Typography>
                                </TableCell>
                                <TableCell sx={isMobile ? { p: '6px 4px', fontSize: '0.95rem' } : {}}>
                                    <Typography component="span" fontSize={isMobile ? '1rem' : undefined}>
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

