import {useEffect, useState} from 'react';
import {
    AppBar,
    Box,
    Container,
    CssBaseline,
    IconButton,
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
import {Brightness4, Brightness7, ElectricBolt} from '@mui/icons-material';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

function App() {
    const [currentTab, setCurrentTab] = useState(0);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

    useEffect(() => {
        const storedPreference = localStorage.getItem('darkModePreference');
        if (storedPreference === 'on') {
            setIsDarkMode(true);
            document.documentElement.classList.add('dark');
        } else if (storedPreference === 'off') {
            setIsDarkMode(false);
            document.documentElement.classList.remove('dark');
        } else {
            setIsDarkMode(prefersDarkMode);
            document.documentElement.classList.toggle('dark', prefersDarkMode);
        }
        // Listen for themeChange event
        const handleThemeChange = () => {
            const pref = localStorage.getItem('darkModePreference');
            if (pref === 'on') {
                setIsDarkMode(true);
                document.documentElement.classList.add('dark');
            } else if (pref === 'off') {
                setIsDarkMode(false);
                document.documentElement.classList.remove('dark');
            } else {
                setIsDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
                document.documentElement.classList.toggle('dark', window.matchMedia('(prefers-color-scheme: dark)').matches);
            }
        };
        window.addEventListener('themeChange', handleThemeChange);
        return () => window.removeEventListener('themeChange', handleThemeChange);
    }, [prefersDarkMode]);

    const handleThemeToggle = () => {
        const newMode = !isDarkMode;
        setIsDarkMode(newMode);
        localStorage.setItem('darkModePreference', newMode ? 'on' : 'off');
        document.documentElement.classList.toggle('dark', newMode);
    };

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
                            <Typography variant="subtitle2" sx={{ml: 1, opacity: 0.7}}>
                                Electricity Meter Reading Assistant
                            </Typography>
                        </Box>
                        <IconButton onClick={handleThemeToggle} color="inherit">
                            {isDarkMode ? <Brightness7/> : <Brightness4/>}
                        </IconButton>
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
