import {useState} from 'react';
import {Box, Container, Grid, useMediaQuery, useTheme} from '@mui/material';
import {useConsumptionHistory} from './useConsumptionHistory';
import ConsumptionStats from './ConsumptionStats';
import ReadingCard from './ReadingCard';
import ReadingDetails from './ReadingDetails';
import EditReadingForm from './EditReadingForm';
import DeleteReadingDialog from './DeleteReadingDialog';
import type {ImageTab, MonthlyConsumption} from './types';

export default function ConsumptionHistory() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [selectedReadingId, setSelectedReadingId] = useState<string | null>(null);
    const [activeImageTab, setActiveImageTab] = useState<ImageTab>('original');

    const {
        readings,
        stats,
        currency,
        getCurrencySymbol,
        formatDate,
        formatTimestamp,
        getFileUrl,
        handleEdit,
        handleEditFormChange,
        handleEditSubmit,
        handleEditCancel,
        handleDelete,
        handleDeleteConfirm,
        handleDeleteCancel,
        handleActionMenuOpen,
        handleActionMenuClose,
        actionMenuAnchor,
        actionMenuId,
        editedReading,
        isDeleteDialogOpen,
        deleteReadingId
    } = useConsumptionHistory();

    const handleReadingSelect = (id: string) => {
        setSelectedReadingId(id);
    };

    const handleImageTabChange = (tab: ImageTab) => {
        setActiveImageTab(tab);
    };

    // Ensure editedReading has all required properties
    const hasRequiredProperties = (reading: Partial<MonthlyConsumption> | null): reading is MonthlyConsumption => {
        if (!reading) return false;
        return (
            typeof reading._id === 'string' &&
            typeof reading.date === 'string' &&
            typeof reading.total_kwh_consumed === 'number' &&
            typeof reading.price === 'number'
        );
    };

    return (
        <Container maxWidth="lg">
            <Box sx={{mb: 4}}>
                <ConsumptionStats
                    stats={stats}
                    currency={currency}
                    getCurrencySymbol={getCurrencySymbol}
                />
            </Box>

            <Grid container component="div" spacing={3}>
                <Grid item component="div" xs={12} md={isMobile ? 12 : 4}  {...{} as any}>
                    {readings.map((reading) => (
                        <ReadingCard
                            key={reading._id}
                            reading={reading}
                            onEditClick={handleEdit}
                            onDetailClick={handleReadingSelect}
                            onDeleteClick={handleDelete}
                            actionMenuAnchor={actionMenuAnchor}
                            actionMenuId={actionMenuId}
                            onActionMenuOpen={handleActionMenuOpen}
                            onActionMenuClose={handleActionMenuClose}
                            getCurrencySymbol={getCurrencySymbol}
                            currency={currency}
                            formatDate={formatDate}
                        />
                    ))}
                </Grid>
                <Grid item component="div" xs={12} md={8}  {...{} as any}>
                    {selectedReadingId && (
                        <ReadingDetails
                            reading={readings.find(r => r._id === selectedReadingId)!}
                            activeImageTab={activeImageTab}
                            onImageTabChange={handleImageTabChange}
                            getFileUrl={getFileUrl}
                            formatDate={formatDate}
                            formatTimestamp={formatTimestamp}
                            getCurrencySymbol={getCurrencySymbol}
                            currency={currency}
                            isMobile={isMobile}
                        />
                    )}
                </Grid>
            </Grid>

            {editedReading && hasRequiredProperties(editedReading) && (
                <EditReadingForm
                    reading={editedReading}
                    onEditFormChange={handleEditFormChange}
                    onSubmit={handleEditSubmit}
                    onCancel={handleEditCancel}
                    currency={currency}
                    getCurrencySymbol={getCurrencySymbol}
                />
            )}

            {isDeleteDialogOpen && deleteReadingId && (
                <DeleteReadingDialog
                    readingDate={formatDate(readings.find(r => r._id === deleteReadingId)?.date)}
                    onCancel={handleDeleteCancel}
                    onConfirm={handleDeleteConfirm}
                />
            )}
        </Container>
    );
}