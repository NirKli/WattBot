import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Link } from '@mui/material';
import { ErrorOutline, GitHub } from '@mui/icons-material';

interface UploadFailedDialogProps {
  open: boolean;
  onClose: () => void;
}

const GITHUB_ISSUE_URL = 'https://github.com/NirKli/WattBot/issues/new?template=bug_report.yml&title=%5BBUG%5D+Meter+Detection+Failed';

const UploadFailedDialog: React.FC<UploadFailedDialogProps> = ({ open, onClose }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <ErrorOutline color="error" sx={{ fontSize: 32 }} />
        <Typography variant="h6" component="span">
          Upload Failed
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Typography>
          We couldn't detect a valid number from the image, even after you cropped it.
        </Typography>
        <Typography sx={{ mt: 2 }}>
          If you believe this is an error, please help us improve by opening an issue on GitHub. Your feedback is valuable.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ 
        p: 2, 
        gap: 1,
        flexDirection: { xs: 'column', sm: 'row' },
        '& > *': { 
          width: { xs: '100%', sm: 'auto' }
        }
      }}>
        <Button onClick={onClose} variant="outlined" sx={{ order: { xs: 2, sm: 1 } }}>
          Close
        </Button>
        <Button 
          component={Link}
          href={GITHUB_ISSUE_URL}
          target="_blank"
          rel="noopener noreferrer"
          variant="contained" 
          startIcon={<GitHub />}
          sx={{ order: { xs: 1, sm: 2 } }}
        >
          Open GitHub Issue
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UploadFailedDialog; 