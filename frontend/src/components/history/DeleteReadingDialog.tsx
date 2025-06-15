import {Paper, Typography, Box, Button} from '@mui/material';
import {Delete} from '@mui/icons-material';

interface DeleteReadingDialogProps {
    readingDate: string;
    onCancel: () => void;
    onConfirm: () => void;
}

export default function DeleteReadingDialog({
    readingDate,
    onCancel,
    onConfirm
}: DeleteReadingDialogProps) {
    return (
        <Paper elevation={1} sx={{p: 2, mb: 2, bgcolor: 'error.lighter'}}>
            <Typography variant="subtitle1" color="error" fontWeight={600} mb={2}>
                <Delete sx={{mr: 1}}/> Delete Reading
            </Typography>
            <Typography mb={2}>
                Are you sure you want to delete the reading from <b>{readingDate}</b>? This action cannot be undone.
            </Typography>
            <Box display="flex" gap={1} justifyContent="flex-end">
                <Button onClick={onCancel} variant="outlined">Cancel</Button>
                <Button onClick={onConfirm} variant="contained" color="error" startIcon={<Delete/>}>
                    Confirm Delete
                </Button>
            </Box>
        </Paper>
    );
} 