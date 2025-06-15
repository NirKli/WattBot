import {Box, Card, CardContent, Grid, Typography} from '@mui/material';
import type {ConsumptionStatsProps} from './types';

export default function ConsumptionStats({stats, currency, getCurrencySymbol}: ConsumptionStatsProps) {
    const formatNumber = (num: number) => num.toFixed(2);
    const currencySymbol = getCurrencySymbol(currency);

    return (
        <Card>
            <CardContent>
                <Grid container spacing={3}>
                    <Grid component="div" item xs={12} sm={6} md={3}  {...{} as any}>
                        <Box>
                            <Typography variant="subtitle2" color="text.secondary">
                                Total Consumption
                            </Typography>
                            <Typography variant="h6">
                                {formatNumber(stats.totalConsumption)} kWh
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid component="div" item xs={12} sm={6} md={3} {...{} as any}>
                        <Box>
                            <Typography variant="subtitle2" color="text.secondary">
                                Average Consumption
                            </Typography>
                            <Typography variant="h6">
                                {formatNumber(stats.averageConsumption)} kWh
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid component="div" item xs={12} sm={6} md={3} {...{} as any}>
                        <Box>
                            <Typography variant="subtitle2" color="text.secondary">
                                Total Cost
                            </Typography>
                            <Typography variant="h6">
                                {currencySymbol}{formatNumber(stats.totalSpending)}
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid component="div" item xs={12} sm={6} md={3} {...{} as any}>
                        <Box>
                            <Typography variant="subtitle2" color="text.secondary">
                                Average Cost
                            </Typography>
                            <Typography variant="h6">
                                {currencySymbol}{formatNumber(stats.averageCost)}
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
} 