import {Paper, Typography, Grid, Tabs, Tab, Box} from '@mui/material';
import {Image, Label, Info} from '@mui/icons-material';
import type {MonthlyConsumption, ImageTab} from './types';

interface ReadingDetailsProps {
    reading: MonthlyConsumption;
    activeImageTab: ImageTab;
    onImageTabChange: (tab: ImageTab) => void;
    getFileUrl: (fileId: string | undefined) => string;
    formatDate: (dateString: string | undefined) => string;
    formatTimestamp: (dateString: string | undefined) => string;
    getCurrencySymbol: (currencyCode: string) => string;
    currency: string;
    isMobile: boolean;
}

export default function ReadingDetails({
    reading,
    activeImageTab,
    onImageTabChange,
    getFileUrl,
    formatDate,
    formatTimestamp,
    getCurrencySymbol,
    currency,
    isMobile
}: ReadingDetailsProps) {
    return (
        <Paper elevation={1} sx={{p: 2, mb: 2}}>
            <Typography variant="subtitle1" color="primary" fontWeight={600} mb={2}>
                <Info sx={{mr: 1}}/> Reading Details
            </Typography>
            <Grid container spacing={2} sx={{flexDirection: {xs: 'column', md: 'row'}}}>
                <Grid sx={{flex: 1}}>
                    <Typography variant="body2" color="text.secondary">Reading Date</Typography>
                    <Typography>{formatDate(reading.date)}</Typography>
                    <Typography variant="body2" color="text.secondary">Consumption</Typography>
                    <Typography>{reading.total_kwh_consumed.toFixed(2)} kWh</Typography>
                    <Typography variant="body2" color="text.secondary">Price</Typography>
                    <Typography>{getCurrencySymbol(currency)} {reading.price.toFixed(2)}</Typography>
                    <Typography variant="body2" color="text.secondary">Last Modified</Typography>
                    <Typography>{formatTimestamp(reading.updated_at)}</Typography>
                    <Typography variant="body2" color="text.secondary">File Name</Typography>
                    <Typography>{reading.file_name || 'Not available'}</Typography>
                </Grid>

                {(reading.original_file || reading.label_file) && (
                    <Grid sx={{flex: 1, mt: {xs: 0, md: -6}}}>
                        <Tabs
                            value={activeImageTab}
                            onChange={(_, v) => onImageTabChange(v)}
                            textColor="primary"
                            indicatorColor="primary"
                            variant="fullWidth"
                            sx={{mb: 2}}
                        >
                            {reading.original_file && (
                                <Tab
                                    icon={<Image sx={{fontSize: isMobile ? 28 : 20}}/>}
                                    label="Original"
                                    value="original"
                                    sx={{
                                        minWidth: isMobile ? 60 : undefined,
                                        py: isMobile ? 2 : undefined
                                    }}
                                />
                            )}
                            {reading.label_file && (
                                <Tab
                                    icon={<Label sx={{fontSize: isMobile ? 28 : 20}}/>}
                                    label="Labeled"
                                    value="labeled"
                                    sx={{
                                        minWidth: isMobile ? 60 : undefined,
                                        py: isMobile ? 2 : undefined
                                    }}
                                />
                            )}
                        </Tabs>

                        <Box sx={{textAlign: 'center'}}>
                            {activeImageTab === 'original' && reading.original_file && (
                                <img
                                    src={getFileUrl(reading.original_file)}
                                    alt="Original reading"
                                    style={{
                                        maxWidth: '100%', 
                                        maxHeight: isMobile ? 300 : 500,
                                        width: 'auto',
                                        height: 'auto',
                                        objectFit: 'contain'
                                    }}
                                />
                            )}
                            {activeImageTab === 'labeled' && reading.label_file && (
                                <img
                                    src={getFileUrl(reading.label_file)}
                                    alt="Labeled reading"
                                    style={{
                                        maxWidth: '100%', 
                                        maxHeight: isMobile ? 300 : 500,
                                        width: 'auto',
                                        height: 'auto',
                                        objectFit: 'contain'
                                    }}
                                />
                            )}
                        </Box>
                    </Grid>
                )}
            </Grid>
        </Paper>
    );
} 