import {useEffect, useState, Suspense} from 'react';
import {
    AppBar,
    Box,
    CircularProgress,
    Container,
    CssBaseline,
    Paper,
    ThemeProvider,
    Toolbar,
    Typography,
    useMediaQuery
} from '@mui/material';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import BarChartIcon from '@mui/icons-material/BarChart';
import PaymentsIcon from '@mui/icons-material/Payments';
import SettingsIcon from '@mui/icons-material/Settings';
import {darkTheme, lightTheme} from './theme';
import React from 'react';
const ImageUpload = React.lazy(() => import('./components/ImageUpload'));
const ConsumptionHistory = React.lazy(() => import('./components/history/ConsumptionHistory'));
const PriceManagement = React.lazy(() => import('./components/PriceManagement'));
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
    const isMobile = useMediaQuery('(max-width: 899px)');

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

    const loadingFallback = (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
            <CircularProgress />
        </Box>
    );

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
                {/* Sticky AppBar — position="sticky" is MUI-native and reliable */}
                <AppBar
                    position="sticky"
                    elevation={0}
                    color="default"
                    sx={{
                        backgroundColor: isDarkMode ? 'rgba(18,18,18,0.88)' : 'rgba(255,255,255,0.88)',
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)',
                        borderBottom: 1,
                        borderColor: 'divider',
                        zIndex: 1100,
                    }}
                >
                    <Toolbar sx={{ minHeight: { xs: 52, sm: 56 } }}>
                        <Box sx={{display: 'flex', alignItems: 'center', flexGrow: 1, gap: 1}}>
                            <ElectricBolt color="primary"/>
                            <Typography variant="h6" component="div" sx={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
                                WattBot
                            </Typography>
                        </Box>
                    </Toolbar>
                </AppBar>

                {/* Desktop-only tab bar — sticky below the AppBar (56px toolbar height) */}
                <Box sx={{
                    position: 'sticky',
                    top: 56,
                    zIndex: 1099,
                    borderBottom: 1,
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                    display: { xs: 'none', md: 'block' },
                }}>
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

                <Container maxWidth="lg" sx={{ py: 4, flex: 1, pb: { xs: '80px', md: 4 } }}>
                    <Suspense fallback={loadingFallback}>
                        {currentTab === 0 && <ImageUpload/>}
                        {currentTab === 1 && <ConsumptionHistory/>}
                        {currentTab === 2 && <PriceManagement/>}
                        {currentTab === 3 && <Settings/>}
                    </Suspense>
                </Container>

                {/* Mobile bottom navigation */}
                {isMobile && (
                    <Paper
                        sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1200 }}
                        elevation={8}
                    >
                        <BottomNavigation value={currentTab} onChange={handleTabChange} showLabels>
                            <BottomNavigationAction label="Upload" icon={<CloudUploadIcon />} />
                            <BottomNavigationAction label="History" icon={<BarChartIcon />} />
                            <BottomNavigationAction label="Prices" icon={<PaymentsIcon />} />
                            <BottomNavigationAction label="Settings" icon={<SettingsIcon />} />
                        </BottomNavigation>
                    </Paper>
                )}
            </Box>
        </ThemeProvider>
    );
}

export default App;
