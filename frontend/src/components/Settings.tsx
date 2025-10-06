import {CircularProgress, Container, Paper, Snackbar} from '@mui/material';
import AppearanceSettings from './settings/AppearanceSettings';
import CurrencySettings from './settings/CurrencySettings';
import AutoCalculateSettings from './settings/AutoCalculateSettings';
import DebugModeSettings from './settings/DebugModeSettings';
import VersionDisplay from './settings/VersionDisplay';
import {useSettings} from './settings/useSettings';
import type {SettingsData} from './settings/useSettings';
import {useState} from "react";

export default function Settings() {
    const {settings, updateSettings, loading, error} = useSettings();
    const [snackbar, setSnackbar] = useState<string | null>(null);

    if (loading) return <CircularProgress sx={{display: 'block', mx: 'auto', my: 8}}/>;
    if (error) return <div>{error}</div>;
    if (!settings) return null;

    const handleSettingChange = async <K extends keyof SettingsData>(key: K, value: SettingsData[K]) => {
        try {
            await updateSettings({[key]: value});
            setSnackbar('✅ Setting updated!');
        } catch {
            setSnackbar('❌ Failed to update setting');
        }
    };

    return (
        <Container maxWidth="sm" sx={{mt: 6}}>
            <Paper sx={{p: 3}}>
                <h2 style={{textAlign: 'center', fontWeight: 700, marginBottom: 24}}>Settings</h2>
                <AppearanceSettings
                    value={settings.dark_mode_preference}
                    onChange={v => handleSettingChange('dark_mode_preference', v)}
                />
                <CurrencySettings
                    value={settings.currency}
                    onChange={v => handleSettingChange('currency', v)}
                />
                <AutoCalculateSettings
                    value={settings.calculate_price}
                    onChange={v => handleSettingChange('calculate_price', v)}
                />
                <DebugModeSettings
                    value={settings.debug_mode}
                    onChange={v => handleSettingChange('debug_mode', v)}
                />
                <Snackbar
                    open={!!snackbar}
                    autoHideDuration={3000}
                    onClose={() => setSnackbar(null)}
                    message={snackbar}
                    anchorOrigin={{vertical: 'top', horizontal: 'center'}}
                    sx={{
                        '& .MuiSnackbarContent-root': {
                            bgcolor: 'background.paper',
                            color: 'text.primary',
                            boxShadow: 3,
                            border: 1,
                            borderColor: 'divider'
                        }
                    }}
                />
                <VersionDisplay />
            </Paper>
        </Container>
    );
}
