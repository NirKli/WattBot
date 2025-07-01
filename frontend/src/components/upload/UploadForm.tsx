import { Box, Button, Typography, IconButton } from '@mui/material';
import { CloudUpload as CloudUploadIcon, Close as CloseIcon } from '@mui/icons-material';
import type { UploadFormProps } from './types';
import React, { useRef } from 'react';

interface ModernUploadFormProps extends UploadFormProps {
    handleRemoveFile: () => void;
}

export default function UploadForm({
    file,
    onFileSelect,
    onDragOver,
    onDrop,
    onUpload,
    isUploading,
    previewUrl,
    handleRemoveFile
}: ModernUploadFormProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation();
        handleRemoveFile();
        if (inputRef.current) inputRef.current.value = '';
    };

    return (
        <Box sx={{ p: 2 }}>
            <Box
                sx={{
                    border: '2px dashed',
                    borderColor: 'divider',
                    borderRadius: 3,
                    p: 4,
                    textAlign: 'center',
                    cursor: 'pointer',
                    bgcolor: 'background.paper',
                    transition: 'background 0.2s',
                    position: 'relative',
                    '&:hover': {
                        borderColor: 'primary.main',
                        bgcolor: 'action.hover',
                    },
                }}
                onDragOver={onDragOver}
                onDrop={onDrop}
                onClick={() => inputRef.current?.click()}
            >
                <input
                    ref={inputRef}
                    id="file-input"
                    type="file"
                    accept="image/*"
                    onChange={onFileSelect}
                    style={{ display: 'none' }}
                />
                <CloudUploadIcon sx={{ fontSize: 56, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                    Drag and drop your meter reading image here
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    or click to select a file
                </Typography>
                {/* Show preview with remove button overlay */}
                {file && previewUrl && (
                    <Box sx={{ mt: 3, position: 'relative', display: 'inline-block', width: '100%' }}>
                        <img
                            src={previewUrl}
                            alt="Preview"
                            style={{
                                width: '100%',
                                height: 'auto',
                                objectFit: 'contain',
                                maxHeight: 300,
                                borderRadius: 12,
                                border: '1px solid #eee',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                            }}
                        />
                        <IconButton
                            size="small"
                            onClick={handleRemove}
                            sx={{
                                position: 'absolute',
                                top: 8,
                                right: 8,
                                bgcolor: 'rgba(255,255,255,0.8)',
                                '&:hover': { bgcolor: 'rgba(255,255,255,1)' },
                                boxShadow: 1
                            }}
                            aria-label="Remove image preview"
                        >
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </Box>
                )}
            </Box>

            {file && (
                <Box sx={{ mt: 3, textAlign: 'center' }}>
                    <Button
                        variant="contained"
                        onClick={onUpload}
                        disabled={isUploading}
                        fullWidth
                        size="large"
                        sx={{ borderRadius: 3, fontWeight: 600, fontSize: '1.1rem', py: 1.5 }}
                    >
                        {isUploading ? 'Processing...' : 'Upload Reading'}
                    </Button>
                </Box>
            )}
        </Box>
    );
} 