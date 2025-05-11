import {useState} from 'react'
import ImageUpload from './components/ImageUpload'
import ConsumptionHistory from './components/ConsumptionHistory'
import LatestReading from './components/LatestReading'
// Import icons
import { MdElectricBolt, MdOutlineUploadFile, MdHistory } from "react-icons/md";
import './App.css'

function App() {
    const [activeTab, setActiveTab] = useState<'upload' | 'history'>('upload')

    return (
        <div className="flex flex-col min-h-screen bg-light text-dark font-sans">
            {/* Modern header */}
            <header className="header shadow-sm">
                <div className="container mx-auto px-4 flex justify-between items-center">
                    <div className="flex items-center">
                        <div className="icon-bg-primary rounded-lg mr-3 flex items-center justify-center">
                            <MdElectricBolt size={28} />
                        </div>
                        <div>
                            <h1 className="font-bold text-2xl text-primary">WattBot</h1>
                            <p className="text-xs text-muted">Electricity Meter Reading Assistant</p>
                        </div>
                    </div>
                    <nav className="bg-white shadow-sm rounded-full p-1">
                        <div className="flex">
                            <button
                                onClick={() => setActiveTab('upload')}
                                className={`text-base py-2 px-4 flex items-center rounded-full transition-all ${
                                    activeTab === 'upload'
                                        ? 'btn-primary'
                                        : 'text-primary hover:bg-light'
                                }`}
                            >
                                <MdOutlineUploadFile className="mr-1" />
                                Upload Reading
                            </button>
                            <button
                                onClick={() => setActiveTab('history')}
                                className={`text-base py-2 px-4 flex items-center rounded-full transition-all ${
                                    activeTab === 'history'
                                        ? 'btn-primary'
                                        : 'text-primary hover:bg-light'
                                }`}
                            >
                                <MdHistory className="mr-1" />
                                Consumption History
                            </button>
                        </div>
                    </nav>
                </div>
            </header>

            {/* Main content area */}
            <main className="flex-1 py-10 bg-light">
                {activeTab === 'upload' ? (
                    <div className="container mx-auto px-4">
                        <div className="flex flex-row space-x-6">
                            {/* Upload Card - Left Side */}
                            <div className="flex-1 card p-8 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-40 h-40 bg-primary opacity-5 rounded-bl-full"></div>
                                <div className="flex flex-col items-center relative z-16">
                                    {/* Electric Meter SVG Illustration */}
                                    <div className="w-full h-auto mb-10 flex items-center justify-center">
                                        <svg width="320" height="320" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            {/* Meter Outline */}
                                            <rect x="10" y="20" width="100" height="80" rx="8" fill="#f8f9fa" stroke="#3f51b5" strokeWidth="4"/>
                                            
                                            {/* Meter Screen */}
                                            <rect x="20" y="30" width="80" height="30" rx="4" fill="#ffffff" stroke="#3f51b5" strokeWidth="2"/>
                                            
                                            {/* Display Numbers */}
                                            <rect x="25" y="37.5" width="15" height="15" rx="2" fill="#f0f0f0" stroke="#3f51b5" strokeWidth="1"/>
                                            <rect x="45" y="37.5" width="15" height="15" rx="2" fill="#f0f0f0" stroke="#3f51b5" strokeWidth="1"/>
                                            <rect x="65" y="37.5" width="15" height="15" rx="2" fill="#f0f0f0" stroke="#3f51b5" strokeWidth="1"/>
                                            <rect x="85" y="37.5" width="15" height="15" rx="2" fill="#f0f0f0" stroke="#3f51b5" strokeWidth="1"/>
                                            
                                            {/* Buttons */}
                                            <rect x="25" y="70" width="18" height="8" rx="2" fill="#ff4081"/>
                                            <rect x="50" y="70" width="18" height="8" rx="2" fill="#ff4081"/>
                                            <rect x="75" y="70" width="18" height="8" rx="2" fill="#ff4081"/>
                                            
                                            {/* Label Text */}
                                            <rect x="15" y="85" width="90" height="10" rx="2" fill="#3f51b5" fillOpacity="0.1"/>
                                            
                                            {/* Meter Top */}
                                            <path d="M10 20 L20 5 H100 L110 20 H10Z" fill="#3f51b5"/>
                                            
                                            {/* Electric Symbol */}
                                            <path d="M55 55 L63 63 L48 67 L55 82 L40 75 L53 55 Z" fill="#ff4081" stroke="#3f51b5" strokeWidth="0.5"/>
                                            
                                            {/* Connection Lines */}
                                            <line x1="60" y1="100" x2="60" y2="110" stroke="#3f51b5" strokeWidth="4" strokeLinecap="round"/>
                                            <line x1="50" y1="110" x2="70" y2="110" stroke="#3f51b5" strokeWidth="4" strokeLinecap="round"/>
                                        </svg>
                                    </div>
                                    
                                    <h2 className="text-2xl font-bold mb-6 text-center text-primary">
                                        Upload Meter Reading
                                    </h2>
                                    <ImageUpload />
                                </div>
                            </div>
                            
                            {/* Latest Reading Card - Right Side */}
                            <div className="flex-1 card p-8">
                                <div className="flex flex-col items-center">
                                    <h2 className="text-2xl font-bold mb-6 text-center text-primary">Latest Reading</h2>
                                    <LatestReading />
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="container mx-auto px-4">
                        <div className="card p-8">
                            <ConsumptionHistory />
                        </div>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="footer">
                <p className="text-sm">
                    © {new Date().getFullYear()} WattBot — Electricity Consumption Monitoring
                </p>
            </footer>
        </div>
    )
}

export default App
