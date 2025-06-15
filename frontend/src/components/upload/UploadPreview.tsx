import { Box } from '@mui/material';
import type { UploadPreviewProps } from './types';

export default function UploadPreview({ file, previewUrl }: UploadPreviewProps) {
    if (!file || !previewUrl) return null;

    return (
        <Box sx={{
            position: 'relative',
            borderRadius: 2,
            overflow: 'hidden',
            border: 1,
            borderColor: 'divider'
        }}>
            <img
                src={previewUrl}
                alt="Preview"
                style={{
                    width: '100%',
                    height: 'auto',
                    objectFit: 'contain',
                    maxHeight: 300
                }}
            />
        </Box>
    );
} 