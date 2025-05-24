import {useState, useEffect} from 'react'
import ImageUpload from './components/ImageUpload'
import ConsumptionHistory from './components/ConsumptionHistory'
import LatestReading from './components/LatestReading'
import PriceManagement from './components/PriceManagement'
import Settings from './components/Settings'
import Tabs, { Tab } from './components/Tabs'
// Import icons
import { MdElectricBolt, MdOutlineUploadFile, MdHistory, MdAttachMoney, MdDashboard, MdWbSunny, MdSettings } from "react-icons/md";
import './App.css'

function App() {
    // Using 0 as default tab without the setter since we're not changing it
    const defaultTab = 0
    const [darkMode, setDarkMode] = useState(false)

    // Check for dark mode
    useEffect(() => {
        const checkDarkMode = () => {
            const isDarkMode = document.documentElement.classList.contains('dark');
            setDarkMode(isDarkMode);
        };
        
        // Check initial state
        checkDarkMode();
        
        // Create mutation observer to detect class changes on html element
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    checkDarkMode();
                }
            });
        });
        
        observer.observe(document.documentElement, { attributes: true });
        
        return () => observer.disconnect();
    }, []);

    return (
        <div className="flex flex-col min-h-screen font-sans">
            {/* Modern header with gradient */}
            <header className={`bg-gradient-to-r ${darkMode ? 'from-primary-dark to-primary' : 'from-primary-dark to-primary'} shadow-md`}>
                <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                    <div className="flex items-center">
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg mr-3 p-2 flex items-center justify-center">
                            <MdElectricBolt size={28} className="text-white" />
                        </div>
                        <div>
                            <h1 className="font-bold text-2xl text-white">WattBot</h1>
                            <p className="text-xs text-white/80">Electricity Meter Reading Assistant</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main content area */}
            <main className="flex-1 py-6 bg-light dark:bg-bg-light">
                <div className="container mx-auto px-4">
                    {/* App description banner */}
                    <div className={`bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg mb-6 overflow-hidden shadow-md`}>
                        <div className="px-6 py-4 flex items-center justify-between">
                            <div className="flex items-center">
                                <MdDashboard size={24} className="mr-3" />
                                <div>
                                    <h2 className="text-lg font-semibold">Electricity Management Dashboard</h2>
                                    <p className="text-sm opacity-90">Track and manage your electricity consumption and prices</p>
                                </div>
                            </div>
                            <div className="hidden md:flex items-center bg-white/10 rounded-full px-3 py-1">
                                <MdWbSunny className="mr-1 text-secondary-light" /> 
                                <span className="text-sm">Energy Saver</span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Modern material design tabs with sliding indicator */}
                    <Tabs defaultTab={defaultTab} className="mb-6">
                        <Tab label="Upload Reading" icon={<MdOutlineUploadFile />}>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Upload Card - Left Side */}
                                <div className="card p-6 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 dark:bg-primary/10 rounded-bl-full"></div>
                                    <div className="flex flex-col items-center relative z-10">
                                        {/* Electric Meter SVG Illustration */}
                                        <div className="w-full h-auto mb-6 flex items-center justify-center">
                                            <ImageUpload />
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Latest Reading Card - Right Side */}
                                <div className="card p-6">
                                    <div className="flex flex-col items-center">
                                        <h2 className="text-xl font-bold mb-6 text-center text-primary dark:text-text-light">Latest Reading</h2>
                                        <LatestReading />
                                    </div>
                                </div>
                            </div>
                        </Tab>
                        <Tab label="Consumption History" icon={<MdHistory />}>
                            <div className="card p-6">
                                <ConsumptionHistory />
                            </div>
                        </Tab>
                        <Tab label="Prices" icon={<MdAttachMoney />}>
                            <div className="card p-6">
                                <PriceManagement />
                            </div>
                        </Tab>
                        <Tab label="Settings" icon={<MdSettings />}>
                            <Settings />
                        </Tab>
                    </Tabs>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200 dark:from-gray-900 dark:to-gray-800 dark:border-gray-800">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col sm:flex-row justify-between items-center py-4 gap-2">
                        <p className="text-sm text-text-muted text-center sm:text-left">
                            © {new Date().getFullYear()} WattBot — Electricity Consumption Monitoring
                        </p>
                        <div className="flex items-center">
                            <MdElectricBolt className="text-primary mr-1" size={16} />
                            <span className="text-xs text-text-muted">Real-time electricity monitoring</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default App
