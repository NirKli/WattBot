import { Box, Typography } from '@mui/material';
import { API_URL } from '../../config';
import type { LatestReadingProps } from './types';

export default function LatestReading({ reading }: LatestReadingProps) {
    if (!reading) {
        return (
            <Box sx={{
                textAlign: 'center',
                py: 4,
                color: 'text.secondary'
            }}>
                <Typography variant="body1" gutterBottom>
                    No readings available yet
                </Typography>
                <Typography variant="body2">
                    Upload your first meter reading to get started
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 0 }}>
            <Box sx={{
                position: 'relative',
                borderRadius: 2,
                overflow: 'hidden',
                boxShadow: 2,
                m: 0,
                p: 0,
                background: 'none',
            }}>
                <img
                    src={`${API_URL}/monthly-consumption/file/${reading.original_file}`}
                    alt="Latest Reading"
                    style={{
                        width: '100%',
                        height: 'auto',
                        objectFit: 'cover',
                        maxHeight: 350,
                        display: 'block',
                        borderRadius: 'inherit',
                        margin: 0,
                        padding: 0
                    }}
                />
            </Box>
        </Box>
    );
} 