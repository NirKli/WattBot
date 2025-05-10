import { useState } from 'react'
import { PhotoIcon, ChartBarIcon } from '@heroicons/react/24/outline'
import ImageUpload from './components/ImageUpload'
import ConsumptionHistory from './components/ConsumptionHistory'
import LatestReading from './components/LatestReading'

function App() {
  const [activeTab, setActiveTab] = useState<'upload' | 'history'>('upload')

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900 text-center">WattBot</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <nav className="flex bg-white rounded-lg shadow-sm p-1 mb-6">
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex items-center justify-center px-4 py-2 rounded-md flex-1 ${
              activeTab === 'upload'
                ? 'bg-blue-100 text-blue-700 font-medium'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <PhotoIcon className="h-5 w-5 mr-2" />
            <span>Upload Reading</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center justify-center px-4 py-2 rounded-md flex-1 ${
              activeTab === 'history'
                ? 'bg-blue-100 text-blue-700 font-medium'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <ChartBarIcon className="h-5 w-5 mr-2" />
            <span>Consumption History</span>
          </button>
        </nav>

        {activeTab === 'upload' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 md:col-start-1">
              <ImageUpload />
            </div>
            <div className="md:col-span-1">
              <LatestReading />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            <ConsumptionHistory />
            <LatestReading />
          </div>
        )}
      </main>
    </div>
  )
}

export default App
