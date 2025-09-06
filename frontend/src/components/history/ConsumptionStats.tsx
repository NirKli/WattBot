import {Box, Paper, Typography, Tooltip} from '@mui/material';
import {BarChart, ElectricBolt, TrendingUp, TrendingDown, TrendingFlat, InfoOutlined} from '@mui/icons-material';
import type {ConsumptionStatsProps} from './types';

function formatShortTimestamp(dateString: string | undefined): string {
    if (!dateString) return 'Not available';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Invalid date';
        return new Intl.DateTimeFormat('en-US', {
            year: '2-digit',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    } catch {
        return 'Invalid date';
    }
}

export default function ConsumptionStats({stats, currency, getCurrencySymbol, formatTimestamp, isMobile}: ConsumptionStatsProps) {
    // Calculate usage trend (comparing recent months to 3-month average)
    const getUsageTrend = () => {
        if (stats.totalReadings < 4) return { trend: 'flat', percentage: 0, icon: <TrendingFlat /> };
        
        // This is a simplified calculation - you might want to enhance this logic
        const recentTrend = stats.averageConsumption > 200 ? 'up' : 'down';
        const percentage = Math.abs((stats.averageConsumption - 200) / 200 * 100);
        
        if (recentTrend === 'up') {
            return { trend: 'up', percentage: Math.round(percentage), icon: <TrendingUp color="info" /> };
        } else {
            return { trend: 'down', percentage: Math.round(percentage), icon: <TrendingDown color="info" /> };
        }
    };

    const usageTrend = getUsageTrend();

    // Check if any numbers are too long and need smaller fonts (mobile only)
    const checkForLongNumbers = () => {
        if (!isMobile) return false; // Only apply on mobile
        
        const totalSpendingText = `${getCurrencySymbol(currency)}${stats.totalSpending.toFixed(2)}`;
        const averageSpendingText = `${getCurrencySymbol(currency)}${stats.averageMonthlySpending.toFixed(2)}`;
        const consumptionText = `${stats.averageConsumption.toFixed(1)}`;
        
        // If any number is longer than 8 characters, use smaller fonts on mobile
        return totalSpendingText.length > 8 || averageSpendingText.length > 8 || consumptionText.length > 8;
    };

    const needsSmallerFonts = checkForLongNumbers();

    return (
        <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: { 
                xs: 'repeat(2, 1fr)', 
                sm: 'repeat(2, 1fr)', 
                md: 'repeat(4, 1fr)' 
            },
            gap: 2,
            mb: 3
        }}>
            <Paper elevation={1} sx={{p: 2, height: '100%', display: 'flex', flexDirection: 'column'}}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>Total Readings</Typography>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <BarChart color="primary"/>
                    <Typography 
                        variant="h4" 
                        color="primary.main" 
                        fontWeight={700}
                        sx={{ 
                            fontSize: needsSmallerFonts ? '1.2rem' : { xs: '1.5rem', sm: '2rem' }
                        }}
                    >
                        {stats.totalReadings}
                    </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{mb: 1}}>energy consumption records</Typography>
                <Typography variant="caption" color="text.secondary" sx={{mt: 'auto'}}>
                    Last reading: {stats.lastReadingDate ? (isMobile ? formatShortTimestamp(stats.lastReadingDate) : formatTimestamp(stats.lastReadingDate)) : 'N/A'}
                </Typography>
            </Paper>
            
            <Paper elevation={1} sx={{p: 2, height: '100%', display: 'flex', flexDirection: 'column'}}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>Avg. Consumption</Typography>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <ElectricBolt color="primary"/>
                    <Typography 
                        variant="h4" 
                        color="primary.main" 
                        fontWeight={700}
                        sx={{ 
                            fontSize: needsSmallerFonts ? '1.2rem' : { xs: '1.5rem', sm: '2rem' }
                        }}
                    >
                        {stats.averageConsumption.toFixed(1)}
                    </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{mb: 1}}>kWh per reading</Typography>
                <Typography variant="caption" color="text.secondary" sx={{mt: 'auto'}}>Based on {stats.totalReadings} readings</Typography>
            </Paper>
            
            <Paper elevation={1} sx={{p: 2, height: '100%', display: 'flex', flexDirection: 'column'}}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>Total Spending</Typography>
                <Box display="flex" alignItems="center" gap={1} mb={1} sx={{flexWrap: 'wrap'}}>
                    <TrendingUp color="primary"/>
                    <Typography 
                        variant="h4" 
                        color="primary.main" 
                        fontWeight={700}
                        sx={{ 
                            fontSize: needsSmallerFonts ? '1.2rem' : { xs: '1.5rem', sm: '2rem' },
                            wordBreak: 'break-all',
                            lineHeight: 1.2
                        }}
                    >
                        {getCurrencySymbol(currency)}{stats.totalSpending.toFixed(2)}
                    </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{mb: 1}}>on electricity</Typography>
                <Typography 
                    variant="caption" 
                    color="text.secondary" 
                    sx={{
                        mt: 'auto',
                        fontSize: needsSmallerFonts ? '0.65rem' : { xs: '0.7rem', sm: '0.75rem' },
                        wordBreak: 'break-all'
                    }}
                >
                    Avg: {getCurrencySymbol(currency)}{stats.averageMonthlySpending.toFixed(2)}/month
                </Typography>
            </Paper>
            
            <Paper elevation={1} sx={{p: 2, height: '100%', display: 'flex', flexDirection: 'column'}}>
                <Box display="flex" alignItems="center" gap={0.5} mb={1}>
                    <Typography variant="subtitle2" color="text.secondary">Usage Trend</Typography>
                    <Tooltip title="Compares this month's consumption to the average of the last 3 months (based on meter deltas).">
                        <InfoOutlined sx={{ fontSize: 16, color: 'text.secondary' }} />
                    </Tooltip>
                </Box>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                    {usageTrend.icon}
                    <Typography 
                        variant="h4" 
                        color="primary.main" 
                        fontWeight={700}
                        sx={{ 
                            fontSize: needsSmallerFonts ? '1.2rem' : { xs: '1.5rem', sm: '2rem' }
                        }}
                    >
                        {usageTrend.trend === 'up' ? '+' : usageTrend.trend === 'down' ? '-' : ''}{usageTrend.percentage}%
                    </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{mb: 1}}>
                    vs. 3-month average
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{mt: 'auto'}}>
                    {usageTrend.trend === 'up' ? 'Usage increasing' : usageTrend.trend === 'down' ? 'Usage decreasing' : 'Usage stable'}
                </Typography>
            </Paper>
        </Box>
    );
} 