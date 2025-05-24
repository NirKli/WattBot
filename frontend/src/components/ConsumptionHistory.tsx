import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { MdBarChart, MdElectricBolt, MdInfo, MdCalendarToday, MdTrendingUp, MdEdit, MdSave, MdClose, MdCheck, MdDelete, MdImage, MdLabel, MdDescription } from 'react-icons/md'
import { FaLightbulb, FaCalendarDay, FaImage, FaClipboard } from 'react-icons/fa'
import { API_URL } from '../config'

interface MonthlyConsumption {
  modified_date: string;
  date: string;
  total_kwh_consumed: number;
  price: number;
  original_file: any;
  file_name: string;
  label_file: any;
  file_label_name: any;
  _id: string;
}

export default function ConsumptionHistory() {
  const [readings, setReadings] = useState<MonthlyConsumption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [currency, setCurrency] = useState('USD')
  const [activeImageTab, setActiveImageTab] = useState<'original' | 'labeled' | 'text'>('original')
  
  // Form states
  const [editingReading, setEditingReading] = useState<MonthlyConsumption | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  
  useEffect(() => {
    fetchReadings()
    
    // Get initial currency from localStorage
    const savedCurrency = localStorage.getItem('currency');
    if (savedCurrency) {
      setCurrency(savedCurrency);
    }
    
    // Listen for currency changes
    const handleCurrencyChange = (e: CustomEvent) => {
      if (e.detail && e.detail.currency) {
        setCurrency(e.detail.currency);
      }
    };
    
    window.addEventListener('currencyChange', handleCurrencyChange as EventListener);
    return () => {
      window.removeEventListener('currencyChange', handleCurrencyChange as EventListener);
    };
  }, [])
  
  // Format date for display
  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return 'Not available';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(date);
    } catch (e) {
      console.error('Error formatting date:', e);
      return 'Invalid date';
    }
  };

  const fetchReadings = async () => {
    try {
      const response = await axios.get(`${API_URL}/monthly-consumption`)
      
      // Sort readings by date (newest first) with safe date parsing
      const sortedReadings = response.data.sort((a: MonthlyConsumption, b: MonthlyConsumption) => {
        const dateA = safeParseDate(a.date);
        const dateB = safeParseDate(b.date);
        
        if (!dateA && !dateB) return 0;
        if (!dateA) return 1; // null dates go to the end
        if (!dateB) return -1;
        
        return dateB.getTime() - dateA.getTime();
      })
      
      // Ensure each reading has a unique _id
      const readingsWithIds = sortedReadings.map((reading: MonthlyConsumption) => {
        if (!reading._id) {
          console.warn('Reading missing _id, using fallback:', reading);
          return {
            ...reading,
            _id: reading.label_file || reading.file_name || `reading-${reading.date}-${Math.random().toString(36).substr(2, 9)}`
          };
        }
        return reading;
      });
      
      setReadings(readingsWithIds);
    } catch (err) {
      setError('Failed to fetch consumption history')
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Add a helper to safely parse dates
  const safeParseDate = (dateString: string | undefined): Date | null => {
    if (!dateString) return null;
    
    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return null;
      }
      return date;
    } catch (e) {
      console.error('Error parsing date:', e);
      return null;
    }
  };
  
  // Handle details view toggle
  const handleDetailClick = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
    setEditingId(null);
  }
  
  // Handle edit mode toggle
  const handleEditClick = (id: string) => {
    const reading = readings.find(r => r._id === id);
    if (reading) {
      setEditingReading({ ...reading });
      setEditingId(id);
      setExpandedId(null);
    }
  }
  
  // Handle form field changes
  const handleEditFormChange = (field: keyof MonthlyConsumption, value: any) => {
    setEditingReading(prev => {
      if (!prev) return prev;
      
      return {
        ...prev,
        [field]: field === 'total_kwh_consumed' || field === 'price' 
          ? parseFloat(value) || 0 
          : value
      };
    });
  }
  
  // Handle form submission
  const handleEditSubmit = async (e: React.FormEvent, id: string) => {
    e.preventDefault();
    
    if (!editingReading) return;
    
    try {
      await axios.put(`${API_URL}/monthly-consumption/${id}`, editingReading);
      
      // Update the local state with the edited reading
      setReadings(prev => prev.map(reading => 
        reading._id === id ? { ...editingReading } : reading
      ));
      
      setSuccessMessage('Reading updated successfully');
      setEditingId(null);
      setEditingReading(null);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError('Failed to update reading');
      console.error('Update error:', err);
    }
  }
  
  // Handle canceling edit mode
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingReading(null);
  }

  // Format timestamp for display
  const formatTimestamp = (dateString: string | undefined): string => {
    if (!dateString) return 'Not available';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }).format(date);
    } catch (e) {
      console.error('Error formatting timestamp:', e);
      return 'Invalid date';
    }
  };

  // Get currency symbol based on selected currency
  const getCurrencySymbol = (currencyCode: string): string => {
    const symbols: {[key: string]: string} = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'ILS': '₪',
      'JPY': '¥',
      'CNY': '¥',
      'INR': '₹',
      'BTC': '₿'
    };
    
    return symbols[currencyCode] || currencyCode;
  };

  // Handle delete confirmation
  const handleDeleteClick = (id: string) => {
    setDeleteConfirmId(id);
    setExpandedId(null);
    setEditingId(null);
  }

  // Handle actual deletion
  const handleDeleteConfirm = async (id: string) => {
    try {
      await axios.delete(`${API_URL}/monthly-consumption/${id}`);
      
      // Update the local state by removing the deleted reading
      setReadings(prev => prev.filter(reading => reading._id !== id));
      
      setSuccessMessage('Reading deleted successfully');
      setDeleteConfirmId(null);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError('Failed to delete reading');
      console.error('Delete error:', err);
    }
  }

  // Handle cancel delete
  const handleCancelDelete = () => {
    setDeleteConfirmId(null);
  }

  // Function to fetch file from the server
  const getFileUrl = (fileId: string | undefined): string => {
    if (!fileId) return '';
    return `${API_URL}/monthly-consumption/file/${fileId}`;
  };


  if (loading) {
    return (
      <div className="w-full flex justify-center items-center py-10">
        <div className="animate-pulse w-full">
          <div className="h-10 bg-primary/10 rounded mb-8 w-1/3"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-14 bg-primary/5 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-danger bg-danger/10 border border-danger/30 rounded-lg p-6">
        <p className="flex items-center justify-center">
          <span className="bg-danger/20 rounded-full p-1 mr-2">
            <MdInfo className="text-danger" size={20} />
          </span>
          {error}
        </p>
      </div>
    )
  }

  if (readings.length === 0) {
    return (
      <div className="text-center text-primary bg-primary/5 border border-primary/20 rounded-lg p-8">
        <div className="bg-primary text-white rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center shadow">
          <FaLightbulb size={30} />
        </div>
        <p className="text-lg font-medium">No readings available yet</p>
        <p className="text-sm text-muted mt-2">Upload your first meter reading to get started</p>
      </div>
    )
  }

  // Calculate total energy usage
  const totalKwh = readings.reduce((acc, reading) => acc + reading.total_kwh_consumed, 0);
  const averageKwh = totalKwh / readings.length;
  
  // Calculate total spending
  const totalSpending = readings.reduce((acc, reading) => acc + reading.price, 0);
  
  // Calculate average monthly spending
  const averageMonthlySpending = readings.length > 0 ? totalSpending / readings.length : 0;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-center text-primary">
        Consumption History
      </h2>
      
      {/* Success message */}
      {successMessage && (
        <div className="bg-green-100 border border-green-300 text-green-800 rounded-lg p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center">
            <MdCheck className="text-green-500 mr-2" size={20} />
            {successMessage}
          </div>
          <button 
            onClick={() => setSuccessMessage(null)}
            className="text-green-700 hover:text-green-900"
          >
            <MdClose size={18} />
          </button>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Total Readings</span>
            <div className="stat-card-icon">
              <MdBarChart size={20} />
            </div>
          </div>
          <div className="stat-card-value">{readings.length}</div>
          <div className="stat-card-label">energy consumption records</div>
          <div className="stat-card-footer">
            <MdCalendarToday size={14} />
            <span>Last reading: {formatDate(readings[0]?.date)}</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Avg. Consumption</span>
            <div className="stat-card-icon">
              <MdElectricBolt size={20} />
            </div>
          </div>
          <div className="stat-card-value">{averageKwh.toFixed(1)}</div>
          <div className="stat-card-label">kWh per reading</div>
          <div className="stat-card-footer">
            <MdInfo size={14} />
            <span>Based on {readings.length} readings</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Total Spending</span>
            <div className="stat-card-icon">
              <MdTrendingUp size={20} />
            </div>
          </div>
          <div className="stat-card-value">{getCurrencySymbol(currency)}{totalSpending.toFixed(2)}</div>
          <div className="stat-card-label">on electricity</div>
          <div className="stat-card-footer">
            <MdElectricBolt size={14} />
            <span>Avg: {getCurrencySymbol(currency)}{averageMonthlySpending.toFixed(2)}/month</span>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-primary text-white py-3 px-6">
          <div className="flex justify-between items-center">
            <h3 className="font-medium flex items-center">
              <MdCalendarToday className="mr-2" /> Reading History
            </h3>
            <p className="text-sm opacity-90">Readings: {readings.length}</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse responsive-table">
            <thead>
              <tr className="text-left">
                <th className="py-4 px-6 text-primary font-medium text-sm tracking-wider">
                  <div className="flex items-center">
                    <MdCalendarToday className="mr-2" /> Date
                  </div>
                </th>
                <th className="py-4 px-6 text-primary font-medium text-sm tracking-wider">
                  <div className="flex items-center">
                    <MdElectricBolt className="mr-2" /> Consumption
                  </div>
                </th>
                <th className="py-4 px-6 text-primary font-medium text-sm tracking-wider">Price</th>
                <th className="py-4 px-6 text-primary font-medium text-sm tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody>
              {readings.map((reading) => (
                <React.Fragment key={reading._id}>
                  <tr className="border-t border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 text-dark" data-label="Date">
                      {formatDate(reading.date)}
                    </td>
                    <td className="py-4 px-6" data-label="Consumption">
                      <span className="font-medium text-primary">{reading.total_kwh_consumed.toFixed(2)}</span>
                      <span className="text-muted text-sm ml-1">kWh</span>
                    </td>
                    <td className="py-4 px-6 font-medium text-primary" data-label="Price">
                      {getCurrencySymbol(currency)}{reading.price.toFixed(4)}
                    </td>
                    <td className="py-4 px-6" data-label="Actions">
                      <div className="flex gap-2 action-buttons">
                        <button
                          onClick={() => handleEditClick(reading._id)}
                          className="btn-outline-secondary py-1.5 px-3 rounded-lg text-sm flex items-center"
                          aria-label="Edit reading"
                        >
                          <MdEdit className="mr-1.5" /> Edit
                        </button>
                        <button 
                          onClick={() => handleDetailClick(reading._id)}
                          className="btn-outline py-1.5 px-3 rounded-lg text-sm flex items-center"
                          aria-label="View reading details"
                        >
                          <MdInfo className="mr-1.5" /> Details
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(reading._id)}
                          className="btn-outline-danger py-1.5 px-3 rounded-lg text-sm flex items-center"
                          aria-label="Delete reading"
                        >
                          <MdDelete className="mr-1.5" /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                  
                  {/* Delete confirmation */}
                  {deleteConfirmId === reading._id && (
                    <tr className="bg-red-50">
                      <td colSpan={4} className="py-4 px-6">
                        <div className="bg-white p-5 rounded-lg shadow-sm border border-red-200">
                          <h4 className="text-danger font-medium mb-4 flex items-center text-lg">
                            <MdDelete className="mr-2" /> Delete Reading
                          </h4>
                          
                          <p className="mb-4 text-gray-700">
                            Are you sure you want to delete the reading from <span className="font-semibold">{formatDate(reading.date)}</span>? 
                            This action cannot be undone.
                          </p>
                          
                          <div className="flex justify-end gap-3">
                            <button
                              type="button"
                              onClick={handleCancelDelete}
                              className="btn-outline py-2 px-4 rounded-lg text-sm"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteConfirm(reading._id)}
                              className="bg-danger text-white py-2 px-4 rounded-lg text-sm flex items-center hover:bg-red-700 transition-colors"
                            >
                              <MdDelete className="mr-1.5" /> Confirm Delete
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                  
                  {/* Details view */}
                  {expandedId === reading._id && (
                    <tr className="bg-gray-50">
                      <td colSpan={4} className="py-4 px-6">
                        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
                          <h4 className="text-primary font-medium mb-4 flex items-center text-lg">
                            <MdInfo className="mr-2" /> Reading Details
                          </h4>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Reading details */}
                            <div className="space-y-4">
                              <div>
                                <h5 className="text-sm font-medium text-gray-500 mb-1">Reading Date</h5>
                                <p className="flex items-center text-dark">
                                  <FaCalendarDay className="text-primary mr-2" />
                                  {formatDate(reading.date)}
                                </p>
                              </div>
                              
                              <div>
                                <h5 className="text-sm font-medium text-gray-500 mb-1">Consumption</h5>
                                <p className="flex items-center text-dark">
                                  <MdElectricBolt className="text-primary mr-2" />
                                  <span>{reading.total_kwh_consumed.toFixed(2)}</span>
                                  <span className="text-muted text-sm ml-1">kWh</span>
                                </p>
                              </div>
                              
                              <div>
                                <h5 className="text-sm font-medium text-gray-500 mb-1">Price</h5>
                                <p className="flex items-center text-dark">
                                  <span className="text-primary mr-2">{getCurrencySymbol(currency)}</span>
                                  {reading.price.toFixed(4)}
                                </p>
                              </div>
                              
                              <div>
                                <h5 className="text-sm font-medium text-gray-500 mb-1">Last Modified</h5>
                                <p className="text-dark text-sm">
                                  {formatTimestamp(reading.modified_date)}
                                </p>
                              </div>
                              
                              <div>
                                <h5 className="text-sm font-medium text-gray-500 mb-1">File Name</h5>
                                <p className="flex items-center text-dark text-sm">
                                  <FaClipboard className="text-primary mr-2" />
                                  {reading.file_name || 'Not available'}
                                </p>
                              </div>
                            </div>
                            
                            {/* Reading files tabs */}
                            <div className="border rounded-lg bg-gray-50 overflow-hidden flex flex-col">
                              {/* Tabs */}
                              <div className="flex border-b border-gray-200 bg-gray-100">
                                <button
                                  onClick={() => setActiveImageTab('original')}
                                  className={`flex items-center py-2 px-4 text-sm font-medium ${
                                    activeImageTab === 'original' 
                                      ? 'text-primary border-b-2 border-primary bg-white' 
                                      : 'text-gray-500 hover:text-gray-700'
                                  }`}
                                >
                                  <MdImage className="mr-2" size={18} />
                                  Original
                                </button>
                                <button
                                  onClick={() => setActiveImageTab('labeled')}
                                  className={`flex items-center py-2 px-4 text-sm font-medium ${
                                    activeImageTab === 'labeled' 
                                      ? 'text-primary border-b-2 border-primary bg-white' 
                                      : 'text-gray-500 hover:text-gray-700'
                                  }`}
                                >
                                  <MdLabel className="mr-2" size={18} />
                                  Labeled
                                </button>
                                <button
                                  onClick={() => setActiveImageTab('text')}
                                  className={`flex items-center py-2 px-4 text-sm font-medium ${
                                    activeImageTab === 'text' 
                                      ? 'text-primary border-b-2 border-primary bg-white' 
                                      : 'text-gray-500 hover:text-gray-700'
                                  }`}
                                >
                                  <MdDescription className="mr-2" size={18} />
                                  Text
                                </button>
                              </div>
                              
                              {/* Content */}
                              <div className="flex-1 p-4 flex items-center justify-center">
                                {activeImageTab === 'original' && (
                                  reading.original_file ? (
                                    <img 
                                      src={getFileUrl(reading.original_file)} 
                                      alt="Original Meter Reading" 
                                      className="max-w-full h-auto max-h-[300px] object-contain rounded"
                                    />
                                  ) : (
                                    <div className="text-center p-8 text-gray-400">
                                      <FaImage size={48} className="mx-auto mb-2 opacity-30" />
                                      <p>No original image available</p>
                                    </div>
                                  )
                                )}
                                
                                {activeImageTab === 'labeled' && (
                                  reading.label_file ? (
                                    <img 
                                      src={getFileUrl(reading.label_file)} 
                                      alt="Labeled Meter Reading" 
                                      className="max-w-full h-auto max-h-[300px] object-contain rounded"
                                    />
                                  ) : (
                                    <div className="text-center p-8 text-gray-400">
                                      <MdLabel size={48} className="mx-auto mb-2 opacity-30" />
                                      <p>No labeled image available</p>
                                    </div>
                                  )
                                )}
                                
                                {activeImageTab === 'text' && (
                                  reading.file_label_name ? (
                                    <div className="w-full h-full p-4 bg-white rounded border border-gray-200 overflow-auto">
                                      <pre className="text-sm text-gray-600 whitespace-pre-wrap font-mono">
                                        {reading.file_label_name}
                                      </pre>
                                    </div>
                                  ) : (
                                    <div className="text-center p-8 text-gray-400">
                                      <MdDescription size={48} className="mx-auto mb-2 opacity-30" />
                                      <p>No text labels available</p>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                  
                  {/* Edit mode */}
                  {editingId === reading._id && editingReading && (
                    <tr className="bg-blue-50">
                      <td colSpan={4} className="py-4 px-6">
                        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
                          <h4 className="text-primary font-medium mb-4 flex items-center text-lg">
                            <MdEdit className="mr-2" /> Edit Reading
                          </h4>
                          
                          <form onSubmit={(e) => handleEditSubmit(e, reading._id)}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                              {/* Date Field */}
                              <div>
                                <label htmlFor={`date-${reading._id}`} className="block text-sm font-medium text-gray-700 mb-1">
                                  Reading Date
                                </label>
                                <input
                                  type="date"
                                  id={`date-${reading._id}`}
                                  value={editingReading?.date.split('T')[0]}
                                  onChange={(e) => handleEditFormChange('date', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                />
                              </div>
                              
                              {/* Consumption Field */}
                              <div>
                                <label htmlFor={`consumption-${reading._id}`} className="block text-sm font-medium text-gray-700 mb-1">
                                  Consumption (kWh)
                                </label>
                                <input
                                  type="number"
                                  id={`consumption-${reading._id}`}
                                  value={editingReading?.total_kwh_consumed}
                                  onChange={(e) => handleEditFormChange('total_kwh_consumed', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                  min="0"
                                  step="0.01"
                                />
                              </div>
                              
                              {/* Price Field */}
                              <div>
                                <label htmlFor={`price-${reading._id}`} className="block text-sm font-medium text-gray-700 mb-1">
                                  Price ({getCurrencySymbol(currency)})
                                </label>
                                <input
                                  type="number"
                                  id={`price-${reading._id}`}
                                  value={editingReading?.price}
                                  onChange={(e) => handleEditFormChange('price', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                  min="0"
                                  step="0.0001"
                                />
                              </div>
                            </div>
                            
                            <div className="flex justify-end gap-3">
                              <button
                                type="button"
                                onClick={handleCancelEdit}
                                className="btn-outline py-2 px-4 rounded-lg text-sm"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                className="btn-primary py-2 px-4 rounded-lg text-sm flex items-center"
                              >
                                <MdSave className="mr-1.5" /> Save
                              </button>
                            </div>
                          </form>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
} 