import { Box, Paper, Typography, Container } from '@mui/material';
import { TrendingUp, AccessTime, CloudUpload, Numbers } from '@mui/icons-material';
import { useImageUpload } from './useImageUpload';
import UploadForm from './UploadForm';
import LatestReading from './LatestReading';
import CropImageDialog from './CropImageDialog';
import UploadFailedDialog from './UploadFailedDialog';

export default function ImageUpload() {
    const {
        file,
        previewUrl,
        isUploading,
        latestReading,
        currency,
        handleFileSelect,
        handleDragOver,
        handleDrop,
        handleUpload,
        formatDate,
        getCurrencySymbol,
        cropDialogOpen,
        imageToCrop,
        handleCropComplete,
        handleCropDialogClose,
        showFinalErrorDialog,
        handleFinalErrorDialogClose,
        setFile,
        setPreviewUrl
    } = useImageUpload();

    const handleRemoveFile = () => {
        setFile(null);
        setPreviewUrl(null);
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Crop dialog overlays everything when open */}
            <CropImageDialog
                open={cropDialogOpen}
                imageSrc={imageToCrop || ''}
                onClose={handleCropDialogClose}
                onCropComplete={handleCropComplete}
            />
            {/* Final error dialog */}
            <UploadFailedDialog
                open={showFinalErrorDialog}
                onClose={handleFinalErrorDialogClose}
            />
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
                {/* Left side - Upload Form */}
                <Box sx={{ flex: 1 }}>
                    <Paper 
                        elevation={3} 
                        sx={{ 
                            p: 2,
                            mb: 3,
                            borderRadius: 2,
                            backgroundColor: 'background.paper',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                boxShadow: 6
                            }
                        }}
                    >
                        <Box sx={{ mb: 2, textAlign: 'center' }}>
                            <Typography variant="h6" gutterBottom color="primary">
                                Upload Meter Reading
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Drag and drop your meter reading image or click to browse
                            </Typography>
                        </Box>
                        <UploadForm
                            file={file}
                            onFileSelect={handleFileSelect}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                            onUpload={handleUpload}
                            isUploading={isUploading}
                            previewUrl={previewUrl}
                            handleRemoveFile={handleRemoveFile}
                        />
                    </Paper>

                    {/* Additional Info Boxes */}
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
                        <Box sx={{ flex: 1, mb: { xs: 2, md: 0 } }}>
                            <Paper 
                                elevation={2} 
                                sx={{ 
                                    p: { xs: 2.5, md: 1.5 },
                                    borderRadius: 2,
                                    backgroundColor: 'background.paper',
                                    height: '100%',
                                    maxWidth: { xs: '100%', md: 240 },
                                    width: '100%',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        boxShadow: 4,
                                        backgroundColor: 'action.hover'
                                    }
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    <Numbers color="primary" sx={{ fontSize: 22 }} />
                                    <Typography variant="subtitle1" color="primary">
                                        Current Meter Reading
                                    </Typography>
                                </Box>
                                <Typography variant="h6" color="primary" fontWeight="bold" gutterBottom>
                                    {latestReading?.total_kwh_consumed.toFixed(2) || '0.00'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Total kWh consumed
                                </Typography>
                            </Paper>
                        </Box>

                        <Box sx={{ flex: 1 }}>
                            <Paper 
                                elevation={2} 
                                sx={{ 
                                    p: { xs: 2.5, md: 1.5 },
                                    borderRadius: 2,
                                    backgroundColor: 'background.paper',
                                    height: '100%',
                                    maxWidth: { xs: '100%', md: 240 },
                                    width: '100%',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        boxShadow: 4,
                                        backgroundColor: 'action.hover'
                                    }
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    <TrendingUp color="success" sx={{ fontSize: 22 }} />
                                    <Typography variant="subtitle1" color="success.main">
                                        Current Bill Amount
                                    </Typography>
                                </Box>
                                <Typography variant="h6" color="success.main" fontWeight="bold" gutterBottom>
                                    {getCurrencySymbol(currency)} {latestReading?.price.toFixed(2) || '0.00'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Total amount to be paid
                                </Typography>
                            </Paper>
                        </Box>
                    </Box>

                    <Box sx={{ mt: 2 }}>
                        <Paper 
                            elevation={2} 
                            sx={{ 
                                p: 1.5,
                                borderRadius: 2,
                                backgroundColor: 'background.paper',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    boxShadow: 4,
                                    backgroundColor: 'action.hover'
                                }
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <AccessTime color="info" sx={{ fontSize: 22 }} />
                                <Typography variant="subtitle1" color="info.main">
                                    Last Update
                                </Typography>
                            </Box>
                            <Typography variant="body1" gutterBottom>
                                {latestReading ? formatDate(latestReading.date) : 'No readings yet'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Keep your readings up to date for accurate tracking
                            </Typography>
                        </Paper>
                    </Box>
                </Box>

                {/* Right side - Latest Reading */}
                <Box sx={{ flex: 1 }}>
                    <Paper 
                        elevation={3} 
                        sx={{ 
                            p: 2,
                            borderRadius: 2,
                            backgroundColor: 'background.paper',
                            height: '100%',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                boxShadow: 6
                            }
                        }}
                    >
                        <Typography variant="h6" color="primary" gutterBottom sx={{ mb: 2 }}>
                            Latest Reading
                        </Typography>
                        <LatestReading
                            reading={latestReading}
                            formatDate={formatDate}
                            getCurrencySymbol={getCurrencySymbol}
                            currency={currency}
                        />
                    </Paper>
                </Box>
            </Box>
        </Container>
    );
} 