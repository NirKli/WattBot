import { Switch, Typography, Box } from '@mui/material';
import type { SettingsData } from './useSettings';

interface Props {
  value: SettingsData['debug_mode'];
  onChange: (value: boolean) => void;
}

export default function DebugModeSettings({ value, onChange }: Props) {
  return (
    <Box sx={{ 
      p: 2, 
      bgcolor: 'background.paper', 
      borderRadius: 2, 
      border: 1, 
      borderColor: 'divider', 
      mb: 2 
    }}>
      <Typography variant="subtitle1" fontWeight={600} mb={1} color="text.primary">
        <span style={{ marginRight: 8, fontSize: '1.3em' }}>🐛</span> Debug Mode
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.primary' }}>
        <Switch
          checked={value}
          onChange={(e) => onChange(e.target.checked)}
          color="primary"
        />
        <Typography variant="body2" color="text.secondary">
          Enable debug mode for additional logging and error details
        </Typography>
      </Box>
    </Box>
  );
} 