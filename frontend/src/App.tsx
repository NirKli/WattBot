import { useEffect } from 'react'
import ImageUpload from './components/ImageUpload'
import ConsumptionHistory from './components/ConsumptionHistory'
import PriceManagement from './components/PriceManagement'
import Settings from './components/Settings'
import Tabs, { Tab } from './components/Tabs'
import { MdElectricBolt, MdOutlineUploadFile, MdHistory, MdAttachMoney, MdSettings } from "react-icons/md";
import './App.css'

function App() {
    // Using 0 as default tab without the setter since we're not changing it
    const defaultTab = 0

    // Check for dark mode
    useEffect(() => {
        const checkDarkMode = () => {
            document.documentElement.classList.contains('dark');
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
        <div className="flex flex-col min-h-screen font-sans bg-white dark:bg-gray-900">
            {/* Modern header with gradient */}
            <header className="bg-gray-900 shadow-md">
                <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                    <div className="flex items-center">
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg mr-3 p-2 flex items-center justify-center">
                            <MdElectricBolt size={28} className="text-white" />
                        </div>
                        <div>
                            <h1 className="font-bold text-2xl !text-white">WattBot</h1>
                            <p className="text-xs text-white">Electricity Meter Reading Assistant</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main content area */}
            <main className="flex-1 py-6 bg-white dark:bg-gray-900">
                <div className="container mx-auto px-4">
                    
                    {/* Modern material design tabs with sliding indicator */}
                    <Tabs defaultTab={defaultTab} className="mb-6">
                        <Tab label="Upload Reading" icon={<MdOutlineUploadFile />}>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Upload Card - Left Side */}
                                <div className="w-full max-w-xs mx-auto rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 sm:p-6 flex flex-col items-center space-y-4">
                                    <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 dark:bg-primary/10 rounded-bl-full"></div>
                                    <div className="flex flex-col items-center relative z-10">
                                        {/* Electric Meter SVG Illustration */}
                                        <div className="w-full h-auto mb-6 flex items-center justify-center">
                                            <ImageUpload />
                                        </div>
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

            <footer className="text-center py-4 text-sm text-gray-400 dark:text-gray-600">
                © {new Date().getFullYear()} WattBot
            </footer>
        </div>
    )
}

export default App
