import { Select, MenuItem, Typography, Box } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import type { SettingsData } from './useSettings';

interface Props {
  value: SettingsData['currency'];
  onChange: (value: SettingsData['currency']) => void;
}

const currencyOptions: SettingsData['currency'][] = ['USD', 'ILS', 'EUR'];

export default function CurrencySettings({ value, onChange }: Props) {
  const handleChange = (e: SelectChangeEvent) => {
    const newValue = e.target.value as SettingsData['currency'];
    if (currencyOptions.includes(newValue)) {
      onChange(newValue);
    }
  };

  return (
    <Box sx={{ 
      p: 2, 
      bgcolor: 'background.paper', 
      borderRadius: 2, 
      border: 1, 
      borderColor: 'divider', 
      mb: 2,
      '& .MuiSelect-select': {
        color: 'text.primary'
      },
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: 'divider'
      },
      '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: 'primary.main'
      }
    }}>
      <Typography variant="subtitle1" fontWeight={600} mb={1} color="text.primary">
        <span style={{ marginRight: 8, fontSize: '1.3em' }}>💱</span> Currency
      </Typography>
      <Select
        value={value}
        onChange={handleChange}
        size="small"
        fullWidth
        sx={{
          '& .MuiSelect-select': {
            color: 'text.primary'
          }
        }}
      >
        {currencyOptions.map(opt => (
          <MenuItem key={opt} value={opt} sx={{ color: 'text.primary' }}>
            {opt} {opt === 'USD' ? '($)' : opt === 'ILS' ? '(₪)' : '(€)'}
          </MenuItem>
        ))}
      </Select>
    </Box>
  );
} 