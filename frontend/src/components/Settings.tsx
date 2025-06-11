import {useEffect, useState} from 'react';
import axios from 'axios';
import {API_URL} from '../config';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import Box from '@mui/material/Box';


interface SettingsData {
    dark_mode_preference: 'auto' | 'on' | 'off';
    currency: string;
    calculate_price: boolean;
    debug_mode: boolean;
}

export default function Settings() {
    const [settings, setSettings] = useState<SettingsData>({
        dark_mode_preference: 'auto',
        currency: 'USD',
        calculate_price: true,
        debug_mode: false
    });
    const [loading, setLoading] = useState(true);
    const [snackbar, setSnackbar] = useState<string | null>(null);

    useEffect(() => {
        axios.get(`${API_URL}/settings`)
            .then(res => {
                setSettings({
                    ...res.data,
                    dark_mode_preference: res.data.dark_mode_preference || 'auto'
                });
                window.dispatchEvent(new CustomEvent('currencyChange', {detail: {currency: res.data.currency}}));
            })
            .catch(() => {
            })
            .finally(() => setLoading(false));
    }, []);

    const handleUpdate = (partial: Partial<SettingsData>) => {
        setSettings(prev => ({...prev, ...partial}));
    };

    const applySettings = () => {
        axios.put(`${API_URL}/settings`, settings)
            .then(() => {
                setSnackbar('✅ Settings saved!');
                window.dispatchEvent(new CustomEvent('currencyChange', {detail: {currency: settings.currency}}));
                const isDarkMode = settings.dark_mode_preference === 'on' ||
                    (settings.dark_mode_preference === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
                document.documentElement.classList.toggle('dark', isDarkMode);
                localStorage.setItem('darkMode', isDarkMode.toString());
                localStorage.setItem('darkModePreference', settings.dark_mode_preference);
                window.dispatchEvent(new CustomEvent('themeChange', {detail: {preference: settings.dark_mode_preference}}));
            })
            .catch(() => setSnackbar('Failed to save settings.'));
    };

    if (loading) return <Typography align="center" color="text.secondary">Loading settings...</Typography>;

    return (
        <Container maxWidth="sm" sx={{mt: 6}}>
            <Paper elevation={3} sx={{p: {xs: 2, sm: 4}, borderRadius: 3}}>
                <Typography variant="h5" align="center" fontWeight={700} gutterBottom>
                    ⚙️ Settings
                </Typography>
                <Box component="form" sx={{display: 'flex', flexDirection: 'column', gap: 3}}>
                    {/* Appearance */}
                    <Box sx={{
                        p: 2,
                        bgcolor: 'background.paper',
                        borderRadius: 2,
                        border: 1,
                        borderColor: 'divider',
                        mb: 1
                    }}>
                        <Typography variant="subtitle1" sx={{
                            fontWeight: 600,
                            color: 'text.primary',
                            mb: 1,
                            display: 'flex',
                            alignItems: 'center',
                            fontSize: '1.15rem'
                        }}>
                            <span style={{marginRight: 8, fontSize: '1.3em'}}>🌙</span> Appearance
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{mb: 1}}>
                            Choose your preferred theme mode
                        </Typography>
                        <RadioGroup
                            row
                            value={settings.dark_mode_preference}
                            onChange={e => handleUpdate({dark_mode_preference: e.target.value as SettingsData['dark_mode_preference']})}
                        >
                            <FormControlLabel value="auto" control={<Radio color="primary"/>}
                                              label="Automatic (Follow system)"/>
                            <FormControlLabel value="on" control={<Radio color="primary"/>} label="Always Dark"/>
                            <FormControlLabel value="off" control={<Radio color="primary"/>} label="Always Light"/>
                        </RadioGroup>
                    </Box>

                    {/* Currency */}
                    <Box sx={{
                        p: 2,
                        bgcolor: 'background.paper',
                        borderRadius: 2,
                        border: 1,
                        borderColor: 'divider',
                        mb: 1
                    }}>
                        <Typography variant="subtitle1" sx={{
                            fontWeight: 600,
                            color: 'text.primary',
                            mb: 1,
                            display: 'flex',
                            alignItems: 'center',
                            fontSize: '1.15rem'
                        }}>
                            <span style={{marginRight: 8, fontSize: '1.3em'}}>💱</span> Currency
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{mb: 1}}>
                            Select preferred currency
                        </Typography>
                        <Select
                            value={settings.currency}
                            onChange={e => handleUpdate({currency: e.target.value})}
                            size="small"
                        >
                            <MenuItem value="USD">USD ($)</MenuItem>
                            <MenuItem value="ILS">ILS (₪)</MenuItem>
                            <MenuItem value="EUR">EUR (€)</MenuItem>
                        </Select>
                    </Box>

                    {/* Auto Calculate */}
                    <Box sx={{
                        p: 2,
                        bgcolor: 'background.paper',
                        borderRadius: 2,
                        border: 1,
                        borderColor: 'divider',
                        mb: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <Box>
                            <Typography variant="subtitle1" sx={{
                                fontWeight: 600,
                                color: 'text.primary',
                                mb: 1,
                                display: 'flex',
                                alignItems: 'center',
                                fontSize: '1.15rem'
                            }}>
                                <span style={{marginRight: 8, fontSize: '1.3em'}}>🧮</span> Auto-calculate
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Enable automatic price calculation
                            </Typography>
                        </Box>
                        <Switch
                            checked={settings.calculate_price}
                            onChange={() => handleUpdate({calculate_price: !settings.calculate_price})}
                            color="primary"
                        />
                    </Box>

                    {/* Debug Mode */}
                    <Box sx={{
                        p: 2,
                        bgcolor: 'background.paper',
                        borderRadius: 2,
                        border: 1,
                        borderColor: 'divider',
                        mb: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <Box>
                            <Typography variant="subtitle1" sx={{
                                fontWeight: 600,
                                color: 'text.primary',
                                mb: 1,
                                display: 'flex',
                                alignItems: 'center',
                                fontSize: '1.15rem'
                            }}>
                                <span style={{marginRight: 8, fontSize: '1.3em'}}>🛠️</span> Debug Mode
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Use raw label output for debugging
                            </Typography>
                        </Box>
                        <Switch
                            checked={settings.debug_mode}
                            onChange={() => handleUpdate({debug_mode: !settings.debug_mode})}
                            color="primary"
                        />
                    </Box>

                    {/* Save button */}
                    <Button
                        onClick={applySettings}
                        variant="contained"
                        color="primary"
                        size="large"
                        sx={{alignSelf: 'center', minWidth: 180, mt: 2}}
                        startIcon={<span role="img" aria-label="save">💾</span>}
                    >
                        Apply Settings
                    </Button>
                </Box>
                <Snackbar
                    open={!!snackbar}
                    autoHideDuration={3000}
                    onClose={() => setSnackbar(null)}
                    message={snackbar}
                    anchorOrigin={{vertical: 'top', horizontal: 'center'}}
                />
                <Box sx={{mt: 4, textAlign: 'center', color: 'text.secondary'}}>
                    <Typography variant="body2" sx={{mb: 0.5}}>
                        Version: {import.meta.env.VITE_APP_VERSION || '1.0.0'}
                    </Typography>
                    <Typography variant="body2">
                        <a
                            href="https://github.com/NirKli/WattBot"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{color: '#3f51b5', textDecoration: 'underline'}}
                        >
                            GitHub Repository
                        </a>
                    </Typography>
                </Box>
            </Paper>
        </Container>
    );
}
