import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography } from '@mui/material';
import getCroppedImg from './getCroppedImg';

interface CropImageDialogProps {
  open: boolean;
  imageSrc: string;
  onClose: () => void;
  onCropComplete: (croppedImage: Blob) => void;
}

const CropImageDialog: React.FC<CropImageDialogProps> = ({ open, imageSrc, onClose, onCropComplete }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [loading, setLoading] = useState(false);

  const onCropChange = (newCrop: { x: number; y: number }) => setCrop(newCrop);
  const onCropCompleteInternal = useCallback((_: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCrop = async () => {
    if (!croppedAreaPixels) return;
    setLoading(true);
    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      onCropComplete(croppedImage);
    } catch (e) {
      console.error('Error cropping image:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      slotProps={{
        paper: {
          sx: {
            height: { xs: '100%', sm: 'auto' },
            maxHeight: { xs: '100%', sm: '90vh' },
            margin: { xs: 0, sm: 2 },
            borderRadius: { xs: 0, sm: 2 }
          }
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pb: 1 }}>
        <Typography variant="h6" component="span">
          Select Meter Area
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ p: { xs: 0, sm: 2 }, overflow: 'hidden' }}>
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ 
            px: { xs: 2, sm: 0 },
            pb: 2,
            textAlign: 'center'
          }}
        >
          Draw a square around your meter's display to help us read it accurately
        </Typography>

        <Box sx={{ 
          position: 'relative',
          width: '100%',
          height: { xs: 'calc(100vh - 200px)', sm: 400 },
          background: '#333',
          touchAction: 'none' // Prevents unwanted touch behaviors on mobile
        }}>
          <Cropper
            image={imageSrc}
            crop={crop}
            aspect={1} // Square crop
            onCropChange={onCropChange}
            onCropComplete={onCropCompleteInternal}
            cropShape="rect"
            showGrid={true}
            objectFit="contain"
            cropSize={{ width: 300, height: 300 }} // Larger default size
            style={{
              containerStyle: {
                width: '100%',
                height: '100%',
              },
              cropAreaStyle: {
                border: '2px solid #fff',
                boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
              },
              mediaStyle: {
                maxHeight: '100%',
                maxWidth: '100%',
              }
            }}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ 
        p: 2,
        gap: 1,
        flexDirection: { xs: 'column', sm: 'row' },
        '& > button': { 
          width: { xs: '100%', sm: 'auto' }
        }
      }}>
        <Button 
          onClick={onClose} 
          disabled={loading}
          fullWidth
          variant="outlined"
          sx={{ order: { xs: 2, sm: 1 } }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleCrop} 
          variant="contained" 
          disabled={loading}
          fullWidth
          sx={{ order: { xs: 1, sm: 2 } }}
        >
          Crop & Upload
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CropImageDialog; 