import {useState} from 'react'
import {ArrowTrendingUpIcon, PhotoIcon} from '@heroicons/react/24/outline'
import {BoltIcon} from '@heroicons/react/24/solid'
import ImageUpload from './components/ImageUpload'
import ConsumptionHistory from './components/ConsumptionHistory'
import LatestReading from './components/LatestReading'
import DarkModeToggle from './components/DarkModeToggle'

function App() {
    const [activeTab, setActiveTab] = useState<'upload' | 'history'>('upload')

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-950 transition-colors duration-200">
            <header className="bg-gradient-to-r from-primary-600 via-secondary-600 to-accent-600 dark:from-primary-800 dark:via-secondary-800 dark:to-accent-800 shadow-lg py-4 px-4">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <div className="flex items-center">
                        <div className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-md">
                            <BoltIcon className="h-6 w-6 text-accent-500" style={{ width: '1.5rem', height: '1.5rem' }} />
                        </div>
                        <h1 className="ml-3 text-2xl font-bold text-white">WattBot</h1>
                    </div>
                    <DarkModeToggle />
                </div>
            </header>

            <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-md">
                <div className="max-w-6xl mx-auto">
                    <div className="flex">
                        <button
                            onClick={() => setActiveTab('upload')}
                            className={`flex-1 py-3 px-6 font-medium text-base transition duration-200 ease-in-out text-center border-b-2
                                ${activeTab === 'upload'
                                    ? 'border-accent-500 text-accent-600 dark:border-accent-400 dark:text-accent-400 bg-gradient-to-b from-transparent to-accent-50 dark:from-transparent dark:to-accent-900/10'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white hover:border-gray-300 dark:hover:border-gray-600'
                                }
                            `}
                        >
                            <div className="flex items-center justify-center">
                                <PhotoIcon className="h-5 w-5 mr-2" style={{ width: '1.25rem', height: '1.25rem' }} />
                                <span>Upload Reading</span>
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            className={`flex-1 py-3 px-6 font-medium text-base transition duration-200 ease-in-out text-center border-b-2
                                ${activeTab === 'history'
                                    ? 'border-secondary-500 text-secondary-600 dark:border-secondary-400 dark:text-secondary-400 bg-gradient-to-b from-transparent to-secondary-50 dark:from-transparent dark:to-secondary-900/10'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white hover:border-gray-300 dark:hover:border-gray-600'
                                }
                            `}
                        >
                            <div className="flex items-center justify-center">
                                <ArrowTrendingUpIcon className="h-5 w-5 mr-2" style={{ width: '1.25rem', height: '1.25rem' }} />
                                <span>Consumption History</span>
                            </div>
                        </button>
                    </div>
                </div>
            </nav>

            <main className="flex-1 py-6 px-4">
                <div className="w-full max-w-6xl mx-auto">
                    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg w-full transition-colors duration-200 border border-gray-100 dark:border-gray-700">
                        {activeTab === 'upload' ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
                                <div className="md:col-span-2 flex flex-col">
                                    <h3 className="text-lg font-semibold text-primary-700 dark:text-primary-300 mb-4">Upload Meter Reading</h3>
                                    <div className="flex-1">
                                        <ImageUpload />
                                    </div>
                                </div>
                                <div className="md:col-span-1 flex flex-col">
                                    <h3 className="text-lg font-semibold text-primary-700 dark:text-primary-300 mb-4">Latest Reading</h3>
                                    <div className="flex-1 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-700 dark:to-gray-800 p-4 rounded-lg shadow">
                                        <LatestReading />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="md:col-span-2">
                                        <h3 className="text-lg font-semibold text-secondary-700 dark:text-secondary-300 mb-4">Consumption History</h3>
                                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                                            <ConsumptionHistory />
                                        </div>
                                    </div>
                                    <div className="md:col-span-1 flex flex-col">
                                        <h3 className="text-lg font-semibold text-primary-700 dark:text-primary-300 mb-4">Latest Reading</h3>
                                        <div className="flex-1 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-gray-700 dark:to-gray-800 p-4 rounded-lg shadow">
                                            <LatestReading />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <footer className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-950 py-3 border-t border-gray-200 dark:border-gray-700 text-center text-gray-500 dark:text-gray-400 text-sm transition-colors duration-200">
                <div className="max-w-6xl mx-auto px-4">
                    <p>© {new Date().getFullYear()} <span className="text-primary-600 dark:text-primary-400 font-medium">WattBot</span> - Electricity Consumption Monitoring</p>
                </div>
            </footer>
        </div>
    )
}

export default App
