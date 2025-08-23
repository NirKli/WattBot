import {Container, Paper, Typography, CircularProgress, Snackbar} from '@mui/material';
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

    if (loading) {
        return <CircularProgress sx={{display: 'block', mx: 'auto', my: 8}}/>;
    }

    return (
        <Container maxWidth="md" sx={{mt: 6}}>
            <Paper sx={{p: 3}}>
                <Typography variant="h4" component="h1" gutterBottom align="center" sx={{fontWeight: 700}}>
                    Electricity Price Management
                </Typography>

                <AddPriceForm
                    newPrice={newPrice}
                    onNewPriceChange={handleNewPriceChange}
                    onSubmit={editingId ? handleEditSubmit : handleAddSubmit}
                    onCancel={handleCancelEdit}
                    isEditing={!!editingId}
                    currency={currency}
                    getCurrencySymbol={getCurrencySymbol}
                />

                <PriceTable
                    prices={sortedPrices}
                    sortConfig={sortConfig}
                    onSort={handleSort}
                    onEditClick={handleEditClick}
                    onDeleteClick={id => setDeleteConfirmId(id)}
                    currency={currency}
                    getCurrencySymbol={getCurrencySymbol}
                    formatDate={formatDate}
                />

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
                    anchorOrigin={{vertical: 'top', horizontal: 'center'}}
                />
            </Paper>
        </Container>
    );
} 