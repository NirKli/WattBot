import {Container, Paper, Typography, CircularProgress, Snackbar, Divider, Box, useMediaQuery} from '@mui/material';
import PriceTable from './prices/PriceTable';
import AddPriceForm from './prices/AddPriceForm';
import DeletePriceDialog from './prices/DeletePriceDialog';
import {usePriceManagement} from './prices/usePriceManagement';

export default function PriceManagement() {
    const {
        loading,
        successMessage,
        editingId,
        deleteConfirmId,
        newPrice,
        sortConfig,
        currency,
        sortedPrices,
        setSuccessMessage,
        setDeleteConfirmId,
        handleSort,
        handleEditClick,
        handleNewPriceChange,
        handleAddSubmit,
        handleEditSubmit,
        handleDelete,
        handleCancelEdit,
        getCurrencySymbol,
        formatDate
    } = usePriceManagement();

    const isMobile = useMediaQuery('(max-width: 899px)');

    if (loading) {
        return <CircularProgress sx={{display: 'block', mx: 'auto', my: 8}}/>;
    }

    return (
        <Container maxWidth="md" sx={{ mt: 2 }}>
            {/* Add / Edit form */}
            <Paper sx={{ p: 3, mb: 3 }}>
                <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" component="h2" sx={{ fontWeight: 700 }}>
                        {editingId ? 'Edit Price' : 'Add Electricity Rate'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {editingId
                            ? 'Update the selected electricity rate entry.'
                            : 'Set the price per kWh and effective date for automatic bill calculation.'}
                    </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <AddPriceForm
                    newPrice={newPrice}
                    onNewPriceChange={handleNewPriceChange}
                    onSubmit={editingId ? handleEditSubmit : handleAddSubmit}
                    onCancel={handleCancelEdit}
                    isEditing={!!editingId}
                    currency={currency}
                    getCurrencySymbol={getCurrencySymbol}
                />
            </Paper>

            {/* Price history table */}
            <Paper sx={{ p: 3 }}>
                <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" component="h2" sx={{ fontWeight: 700 }}>
                        Price History
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Click a column header to sort. The default rate is used when no exact date match is found.
                    </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <PriceTable
                    prices={sortedPrices}
                    sortConfig={sortConfig}
                    onSort={handleSort}
                    onEditClick={handleEditClick}
                    onDeleteClick={id => setDeleteConfirmId(id)}
                    currency={currency}
                    getCurrencySymbol={getCurrencySymbol}
                    formatDate={formatDate}
                    isMobile={isMobile}
                />
            </Paper>

            <DeletePriceDialog
                open={!!deleteConfirmId}
                onClose={() => setDeleteConfirmId(null)}
                onConfirm={() => deleteConfirmId && handleDelete(deleteConfirmId)}
            />

            <Snackbar
                open={!!successMessage}
                autoHideDuration={3000}
                onClose={() => setSuccessMessage(null)}
                message={successMessage}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            />
        </Container>
    );
} 