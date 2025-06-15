import {useEffect, useState} from 'react';
import {
    AppBar,
    Box,
    Container,
    CssBaseline,
    ThemeProvider,
    Toolbar,
    Typography,
    useMediaQuery
} from '@mui/material';
import {darkTheme, lightTheme} from './theme';
import ImageUpload from './components/ImageUpload';
import ConsumptionHistory from './components/ConsumptionHistory';
import PriceManagement from './components/PriceManagement';
import Settings from './components/Settings';
import {ElectricBolt} from '@mui/icons-material';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import axios from 'axios';
import {API_URL} from './config';

function App() {
    const [currentTab, setCurrentTab] = useState(0);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await axios.get(`${API_URL}/settings`);
                const darkModePreference = response.data.dark_mode_preference;
                
                if (darkModePreference === 'on') {
                    setIsDarkMode(true);
                    document.documentElement.classList.add('dark');
                } else if (darkModePreference === 'off') {
                    setIsDarkMode(false);
                    document.documentElement.classList.remove('dark');
                } else {
                    // 'auto' mode
                    setIsDarkMode(prefersDarkMode);
                    document.documentElement.classList.toggle('dark', prefersDarkMode);
                }
            } catch (error) {
                console.error('Failed to fetch settings:', error);
                // Fallback to system preference
                setIsDarkMode(prefersDarkMode);
                document.documentElement.classList.toggle('dark', prefersDarkMode);
            }
        };

        fetchSettings();

        // Listen for system preference changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e: MediaQueryListEvent) => {
            const storedPreference = localStorage.getItem('darkModePreference');
            if (storedPreference === 'auto') {
                setIsDarkMode(e.matches);
                document.documentElement.classList.toggle('dark', e.matches);
            }
        };

        // Listen for theme changes from settings
        const handleThemeChange = (e: CustomEvent) => {
            const { darkModePreference } = e.detail;
            if (darkModePreference === 'on') {
                setIsDarkMode(true);
                document.documentElement.classList.add('dark');
            } else if (darkModePreference === 'off') {
                setIsDarkMode(false);
                document.documentElement.classList.remove('dark');
            } else {
                // 'auto' mode
                setIsDarkMode(prefersDarkMode);
                document.documentElement.classList.toggle('dark', prefersDarkMode);
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        window.addEventListener('themeChange', handleThemeChange as EventListener);
        
        return () => {
            mediaQuery.removeEventListener('change', handleChange);
            window.removeEventListener('themeChange', handleThemeChange as EventListener);
        };
    }, [prefersDarkMode]);

    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setCurrentTab(newValue);
    };

    return (
        <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
            <CssBaseline/>
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                minHeight: '100vh',
                bgcolor: 'background.default',
                color: 'text.primary'
            }}>
                <AppBar position="static" elevation={0} color="default">
                    <Toolbar>
                        <Box sx={{display: 'flex', alignItems: 'center', flexGrow: 1}}>
                            <ElectricBolt sx={{mr: 1}}/>
                            <Typography variant="h6" component="div" sx={{fontWeight: 600}}>
                                WattBot
                            </Typography>
                        </Box>
                    </Toolbar>
                </AppBar>

                <Box sx={{borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper'}}>
                    <Container maxWidth="lg" sx={{px: {xs: 0, sm: 2}}}>
                        <Tabs
                            value={currentTab}
                            onChange={handleTabChange}
                            variant="scrollable"
                            scrollButtons="auto"
                            allowScrollButtonsMobile
                        >
                            <Tab label="Upload Reading"/>
                            <Tab label="Consumption History"/>
                            <Tab label="Prices"/>
                            <Tab label="Settings"/>
                        </Tabs>
                    </Container>
                </Box>

                <Container maxWidth="lg" sx={{py: 4, flex: 1}}>
                    {currentTab === 0 && <ImageUpload/>}
                    {currentTab === 1 && <ConsumptionHistory/>}
                    {currentTab === 2 && <PriceManagement/>}
                    {currentTab === 3 && <Settings/>}
                </Container>
            </Box>
        </ThemeProvider>
    );
}

export default App;
