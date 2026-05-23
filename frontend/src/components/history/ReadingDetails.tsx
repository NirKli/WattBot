import {useState} from 'react';
import {Paper, Typography, Grid, Tabs, Tab, Box, Tooltip, Dialog, DialogContent, IconButton} from '@mui/material';
import {Image, Label, Info, Close, ZoomIn} from '@mui/icons-material';
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
    const [zoomSrc, setZoomSrc] = useState<string | null>(null);

    return (
        <Paper elevation={1} sx={{p: 2, mb: 2}}>
            <Typography variant="subtitle1" color="primary" sx={{ fontWeight: 600, mb: 2 }}>
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
                    {reading.score != null && (
                        <>
                            <Typography variant="body2" color="text.secondary">Score</Typography>
                            <Typography>{(Number(reading.score) * 100).toFixed(1)}%</Typography>
                        </>
                    )}
                    {reading.conf_array != null && reading.conf_array.length > 0 && (
                        <Tooltip
                            title={
                                <Box component="span" sx={{display: 'block', py: 0.5}}>
                                    {reading.conf_array.map((item, i) => {
                                        const char = (item as { char?: string }).char ?? '?';
                                        const conf = (item as { conf?: number }).conf;
                                        const pct = typeof conf === 'number' ? (conf * 100).toFixed(2) + '%' : '—';
                                        return (
                                            <Typography key={i} component="span" sx={{display: 'block', fontSize: '0.8rem', lineHeight: 1.5}}>
                                                {char}: {pct}
                                            </Typography>
                                        );
                                    })}
                                </Box>
                            }
                            placement="top"
                            arrow
                            slotProps={{
                                popper: {
                                    modifiers: [{name: 'offset', options: {offset: [0, 4]}}]
                                }
                            }}
                        >
                            <Box component="span" sx={{cursor: 'help', display: 'inline-block'}}>
                                <Typography variant="body2" color="text.secondary">Confidence (items)</Typography>
                                <Typography>{reading.conf_array.length} detection(s)</Typography>
                            </Box>
                        </Tooltip>
                    )}
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

                        <Box sx={{ textAlign: 'center' }}>
                            {activeImageTab === 'original' && reading.original_file && (
                                <Box sx={{ position: 'relative', display: 'inline-block', cursor: 'zoom-in' }}
                                     onClick={() => setZoomSrc(getFileUrl(reading.original_file ?? undefined))}>
                                    <img
                                        src={getFileUrl(reading.original_file ?? undefined)}
                                        alt="Original reading"
                                        style={{
                                            maxWidth: '100%',
                                            maxHeight: isMobile ? 300 : 500,
                                            width: 'auto',
                                            height: 'auto',
                                            objectFit: 'contain',
                                            display: 'block',
                                            borderRadius: 8,
                                        }}
                                    />
                                    <Box sx={{
                                        position: 'absolute', bottom: 8, right: 8,
                                        bgcolor: 'rgba(0,0,0,0.45)', borderRadius: 1, p: 0.5,
                                        display: 'flex', alignItems: 'center',
                                    }}>
                                        <ZoomIn sx={{ color: '#fff', fontSize: '18px !important' }} />
                                    </Box>
                                </Box>
                            )}
                            {activeImageTab === 'labeled' && reading.label_file && (
                                <Box sx={{ position: 'relative', display: 'inline-block', cursor: 'zoom-in' }}
                                     onClick={() => setZoomSrc(getFileUrl(reading.label_file ?? undefined))}>
                                    <img
                                        src={getFileUrl(reading.label_file ?? undefined)}
                                        alt="Labeled reading"
                                        style={{
                                            maxWidth: '100%',
                                            maxHeight: isMobile ? 300 : 500,
                                            width: 'auto',
                                            height: 'auto',
                                            objectFit: 'contain',
                                            display: 'block',
                                            borderRadius: 8,
                                        }}
                                    />
                                    <Box sx={{
                                        position: 'absolute', bottom: 8, right: 8,
                                        bgcolor: 'rgba(0,0,0,0.45)', borderRadius: 1, p: 0.5,
                                        display: 'flex', alignItems: 'center',
                                    }}>
                                        <ZoomIn sx={{ color: '#fff', fontSize: '18px !important' }} />
                                    </Box>
                                </Box>
                            )}
                        </Box>
                    </Grid>
                )}
            </Grid>

            {/* Photo zoom lightbox */}
            <Dialog
                open={Boolean(zoomSrc)}
                onClose={() => setZoomSrc(null)}
                maxWidth="xl"
                fullWidth
                slotProps={{ backdrop: { style: { backgroundColor: 'rgba(0,0,0,0.85)' } } }}
            >
                <DialogContent sx={{ p: 1, position: 'relative', textAlign: 'center', bgcolor: 'transparent' }}>
                    <IconButton
                        onClick={() => setZoomSrc(null)}
                        size="small"
                        sx={{
                            position: 'absolute', top: 8, right: 8, zIndex: 1,
                            bgcolor: 'rgba(0,0,0,0.55)', color: '#fff',
                            '&:hover': { bgcolor: 'rgba(0,0,0,0.75)' },
                        }}
                    >
                        <Close />
                    </IconButton>
                    {zoomSrc && (
                        <img
                            src={zoomSrc}
                            alt="Zoomed reading"
                            style={{ maxWidth: '100%', maxHeight: '90vh', width: 'auto', height: 'auto', borderRadius: 8 }}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </Paper>
    );
} 