import {Box, Typography} from '@mui/material';
import {useEffect, useState} from 'react';
import axios from 'axios';

interface VersionInfo {
    current: string;
    latest?: string;
}

export default function VersionDisplay() {
    const currentVersion = import.meta.env.VITE_APP_VERSION || '1.0.0';
    console.log('Current version from env:', currentVersion);

    const [versionInfo, setVersionInfo] = useState<VersionInfo>({
        current: currentVersion
    });

    useEffect(() => {
        const checkForUpdates = async () => {
            try {
                const response = await axios.get('https://api.github.com/repos/NirKli/WattBot/releases/latest');
                const latestVersion = response.data.tag_name.replace('v', '');
                console.log('Latest version from GitHub:', latestVersion);
                if (latestVersion !== versionInfo.current) {
                    setVersionInfo(prev => ({...prev, latest: latestVersion}));
                }
            } catch (error) {
                console.error('Failed to check for updates:', error);
            }
        };

        checkForUpdates();
    }, []);

    return (
        <Box sx={{mt: 4, textAlign: 'center', color: 'text.secondary'}}>
            <Typography variant="body2" sx={{mb: 0.5}}>
                Version: {versionInfo.current}
                {versionInfo.latest && (
                    <Typography
                        component="span"
                        sx={{
                            ml: 1,
                            color: 'warning.main',
                            fontWeight: 'bold'
                        }}
                    >
                        (Update available: {versionInfo.latest})
                    </Typography>
                )}
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
    );
} 