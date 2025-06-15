import { Box, Button, Typography } from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import type { UploadFormProps } from './types';
import UploadPreview from './UploadPreview';

export default function UploadForm({
    file,
    onFileSelect,
    onDragOver,
    onDrop,
    onUpload,
    isUploading,
    previewUrl
}: UploadFormProps) {
    return (
        <Box sx={{ p: 2 }}>
            <Box
                sx={{
                    border: '2px dashed',
                    borderColor: 'divider',
                    borderRadius: 2,
                    p: 3,
                    textAlign: 'center',
                    cursor: 'pointer',
                    '&:hover': {
                        borderColor: 'primary.main',
                        backgroundColor: 'action.hover'
                    }
                }}
                onDragOver={onDragOver}
                onDrop={onDrop}
                onClick={() => document.getElementById('file-input')?.click()}
            >
                <input
                    id="file-input"
                    type="file"
                    accept="image/*"
                    onChange={onFileSelect}
                    style={{ display: 'none' }}
                />
                <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                    Drag and drop your meter reading image here
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    or click to select a file
                </Typography>
            </Box>

            <UploadPreview file={file} previewUrl={previewUrl} />

            {file && (
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Button
                        variant="contained"
                        onClick={onUpload}
                        disabled={isUploading}
                    >
                        {isUploading ? 'Uploading...' : 'Upload Reading'}
                    </Button>
                </Box>
            )}
        </Box>
    );
} 