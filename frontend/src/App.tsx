import {useState} from 'react'
import {ArrowTrendingUpIcon, BoltIcon, PhotoIcon} from '@heroicons/react/24/outline'
import ImageUpload from './components/ImageUpload'
import ConsumptionHistory from './components/ConsumptionHistory'
import LatestReading from './components/LatestReading'

function App() {
    const [activeTab, setActiveTab] = useState<'upload' | 'history'>('upload')

    return (
        <div className="flex flex-col min-h-screen">
            <header className="bg-gradient-to-r from-blue-600 to-blue-800 shadow text-center py-3">
                <div className="flex flex-col items-center justify-center">
                    <div className="flex items-center">
                        <BoltIcon className="h-8 w-8 text-yellow-300" style={{width: '32px', height: '32px'}}/>
                        <h1 className="ml-2 text-2xl font-bold text-white">WattBot</h1>
                    </div>
                    <p className="text-blue-100 text-sm mt-1">Electricity Meter Reading Assistant</p>
                </div>
            </header>

            <nav className="bg-white border-b border-gray-200">
                <div className="max-w-4xl mx-auto">
                    <div className="flex justify-center">
                        <button
                            onClick={() => setActiveTab('upload')}
                            className={`flex-1 whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm sm:text-base transition duration-200 ease-in-out text-center
                ${activeTab === 'upload'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }
              `}
                        >
                            <div className="flex items-center justify-center">
                                <PhotoIcon className="h-5 w-5 sm:mr-2" style={{width: '20px', height: '20px'}}/>
                                <span className="hidden sm:inline">Upload Reading</span>
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            className={`flex-1 whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm sm:text-base transition duration-200 ease-in-out text-center
                ${activeTab === 'history'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }
              `}
                        >
                            <div className="flex items-center justify-center">
                                <ArrowTrendingUpIcon className="h-5 w-5 sm:mr-2"
                                                     style={{width: '20px', height: '20px'}}/>
                                <span className="hidden sm:inline">Consumption History</span>
                            </div>
                        </button>
                    </div>
                </div>
            </nav>

            <main className="flex-1 flex items-center justify-center py-8">
                <div className="w-full max-w-4xl mx-auto px-4">
                    <div className="bg-white shadow rounded-xl w-full">
                        <div className="p-6">
                            {activeTab === 'upload' ? (
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full text-center">
                                    <div className="lg:col-span-2 py-6 flex items-center justify-center">
                                        <ImageUpload/>
                                    </div>
                                    <div className="lg:col-span-1 py-6 flex items-center justify-center">
                                        <LatestReading/>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-8 w-full text-center py-6">
                                    <ConsumptionHistory/>
                                    <LatestReading/>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <footer className="bg-white py-3 border-t border-gray-200 text-center text-gray-500 text-sm">
                <p>© {new Date().getFullYear()} WattBot - Electricity Consumption Monitoring</p>
            </footer>
        </div>
    )
}

export default App
