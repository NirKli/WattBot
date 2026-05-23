import { RadioGroup, FormControlLabel, Radio, Typography, Box } from '@mui/material';
import type { SettingsData } from './useSettings';

interface Props {
  value: SettingsData['dark_mode_preference'];
  onChange: (value: SettingsData['dark_mode_preference']) => void;
}

export default function AppearanceSettings({ value, onChange }: Props) {
  return (
    <Box sx={{ 
      p: 2, 
      bgcolor: 'background.paper', 
      borderRadius: 2, 
      border: 1, 
      borderColor: 'divider', 
      mb: 2 
    }}>
      <Typography variant="subtitle1" color="text.primary" sx={{ fontWeight: 600, mb: 1 }}>
        <span style={{ marginRight: 8, fontSize: '1.3em' }}>🌓</span> Dark Mode
      </Typography>
      <RadioGroup
        value={value}
        onChange={(e) => onChange(e.target.value as SettingsData['dark_mode_preference'])}
      >
        <FormControlLabel 
          value="auto" 
          control={<Radio />} 
          label="Automatic (System Default)"
          sx={{ color: 'text.primary' }}
        />
        <FormControlLabel 
          value="on" 
          control={<Radio />} 
          label="On" 
          sx={{ color: 'text.primary' }}
        />
        <FormControlLabel 
          value="off" 
          control={<Radio />} 
          label="Off" 
          sx={{ color: 'text.primary' }}
        />
      </RadioGroup>
    </Box>
  );
} 