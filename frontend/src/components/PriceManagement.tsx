import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { MdAdd, MdDelete, MdEdit, MdSave, MdTimeline, MdAttachMoney, MdInfo, MdClose, MdCheck } from 'react-icons/md'
import { FaChartLine, FaRegCalendarAlt, FaRegClock, FaSortDown, FaSortUp, FaSort } from 'react-icons/fa'
import { API_URL } from '../config'

interface ElectricityPrice {
  _id: string;
  price: number;
  date: string;
  is_default: boolean;
}

interface SortConfig {
  key: 'date' | 'price';
  direction: 'ascending' | 'descending';
}

export default function PriceManagement() {
  // Data states
  const [electricityPrices, setElectricityPrices] = useState<ElectricityPrice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPrice, setCurrentPrice] = useState<number | null>(null)
  const [currency, setCurrency] = useState('USD')
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'date', direction: 'descending' })
  
  // UI states
  const [showAddForm, setShowAddForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  
  // Form data
  const [newPrice, setNewPrice] = useState({
    price: 0,
    date: formatDateForInput(new Date().toISOString()),
    is_default: false
  })
  
  const [editForm, setEditForm] = useState({
    _id: '',
    price: 0,
    date: '',
    is_default: false
  })

  // Load data on component mount
  useEffect(() => {
    fetchPrices()
    
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

  // Format date helper for input fields
  function formatDateForInput(dateString: string): string {
    if (!dateString) return ''
    
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return ''
      }
      return date.toISOString().split('T')[0]
    } catch (e) {
      console.error('Error formatting date for input:', e)
      return ''
    }
  }

  // Format date helper for display
  function formatDate(dateString: string): string {
    if (!dateString) return 'N/A'
    
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return 'Invalid date'
      }
      
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(date)
    } catch (e) {
      console.error('Error formatting date:', e)
      return 'Invalid date'
    }
  }

  // Fetch all prices from API
  const fetchPrices = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await axios.get(`${API_URL}/electricity-prices`)
      setElectricityPrices(response.data)
      
      // Find current price (most recent date that's not in the future)
      const now = new Date()
      const validPrices = response.data
        .filter((price: ElectricityPrice) => new Date(price.date) <= now)
        .sort((a: ElectricityPrice, b: ElectricityPrice) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        )
      
      if (validPrices.length > 0) {
        setCurrentPrice(validPrices[0].price)
      }
    } catch (err) {
      console.error('Error fetching prices:', err)
      setError('Failed to load electricity prices')
    } finally {
      setLoading(false)
    }
  }

  // Sort function for electricity prices
  const sortedPrices = React.useMemo(() => {
    const sortablePrices = [...electricityPrices];
    if (sortConfig !== null) {
      sortablePrices.sort((a, b) => {
        if (sortConfig.key === 'date') {
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          if (dateA < dateB) {
            return sortConfig.direction === 'ascending' ? -1 : 1;
          }
          if (dateA > dateB) {
            return sortConfig.direction === 'ascending' ? 1 : -1;
          }
          return 0;
        } else if (sortConfig.key === 'price') {
          if (a.price < b.price) {
            return sortConfig.direction === 'ascending' ? -1 : 1;
          }
          if (a.price > b.price) {
            return sortConfig.direction === 'ascending' ? 1 : -1;
          }
          return 0;
        }
        return 0;
      });
    }
    return sortablePrices;
  }, [electricityPrices, sortConfig]);

  // Sorting request handler
  const requestSort = (key: 'date' | 'price') => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Get sort icon for column headers
  const getSortIcon = (columnName: 'date' | 'price') => {
    if (sortConfig.key !== columnName) {
      return <FaSort className="ml-1 text-gray-400" />;
    }
    return sortConfig.direction === 'ascending' ? 
      <FaSortUp className="ml-1 text-primary" /> : 
      <FaSortDown className="ml-1 text-primary" />;
  };

  // Start editing a price
  const handleEditClick = (price: ElectricityPrice) => {
    setEditId(price._id)
    setEditForm({
      _id: price._id,
      price: price.price,
      date: formatDateForInput(price.date),
      is_default: price.is_default
    })
    setShowAddForm(false)
  }

  // Handle changes to new price form
  const handleNewPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setNewPrice(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (name === 'price' ? parseFloat(value) || 0 : value)
    }))
  }

  // Handle changes to edit form
  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setEditForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (name === 'price' ? parseFloat(value) || 0 : value)
    }))
  }

  // Add new price
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccessMessage(null)
    
    try {
      await axios.post(`${API_URL}/electricity-price`, newPrice)
      
      setSuccessMessage('New price added successfully')
      setShowAddForm(false)
      setNewPrice({
        price: 0,
        date: formatDateForInput(new Date().toISOString()),
        is_default: false
      })
      
      // Refresh prices
      fetchPrices()
    } catch (err) {
      console.error('Error adding price:', err)
      setError('Failed to add new price')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Update price
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccessMessage(null)
    
    try {
      await axios.put(`${API_URL}/electricity-price/${editForm._id}`, {
        _id: editForm._id,
        price: editForm.price,
        date: editForm.date,
        is_default: editForm.is_default
      })
      
      setSuccessMessage('Price updated successfully')
      setEditId(null)
      
      // Refresh prices
      fetchPrices()
    } catch (err) {
      console.error('Error updating price:', err)
      setError('Failed to update price')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Delete price
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this price record?')) {
      return
    }
    
    setIsSubmitting(true)
    setError(null)
    setSuccessMessage(null)
    
    try {
      await axios.delete(`${API_URL}/electricity-price/${id}`)
      
      setSuccessMessage('Price deleted successfully')
      
      // Refresh prices
      fetchPrices()
    } catch (err) {
      console.error('Error deleting price:', err)
      setError('Failed to delete price')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Cancel editing
  const handleCancelEdit = () => {
    setEditId(null)
  }

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

  // Loading UI
  if (loading) {
    return (
      <div className="w-full flex justify-center items-center py-10">
        <div className="animate-pulse w-full">
          <div className="h-10 bg-primary/10 rounded mb-8 w-1/3"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-14 bg-primary/5 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-center text-primary">
        Electricity Price Management
      </h2>
      
      {/* Messages */}
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
      
      {error && (
        <div className="bg-danger/10 border border-danger/30 text-danger rounded-lg p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center">
            <MdInfo className="text-danger mr-2" size={20} />
            {error}
          </div>
          <button 
            onClick={() => setError(null)} 
            className="text-danger hover:text-danger/70"
          >
            <MdClose size={18} />
          </button>
        </div>
      )}
      
      {/* Dashboard Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Current Price Card */}
        <div className="bg-white rounded-lg shadow-md p-6 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm uppercase text-gray-500 font-medium">Current Price</h3>
            <div className="icon-bg-primary rounded-full p-2">
              <MdAttachMoney size={20} />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-3xl font-bold text-primary">
              {getCurrencySymbol(currency)}{currentPrice !== null ? currentPrice.toFixed(4) : '0.0000'}
            </div>
            <div className="text-sm text-muted mt-1">per kWh</div>
          </div>
          <div className="mt-auto pt-4 text-xs text-gray-500 flex items-center">
            <FaRegClock className="mr-1" /> 
            Last updated: {electricityPrices.length > 0 ? formatDate(electricityPrices[0].date) : 'N/A'}
          </div>
        </div>
        
        {/* Price Stats Card */}
        <div className="bg-white rounded-lg shadow-md p-6 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm uppercase text-gray-500 font-medium">Price Statistics</h3>
            <div className="icon-bg-primary rounded-full p-2">
              <FaChartLine size={20} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div>
              <div className="text-sm text-gray-500">Highest</div>
              <div className="text-xl font-bold text-primary">
                {getCurrencySymbol(currency)}{Math.max(...electricityPrices.map(p => p.price), 0).toFixed(4)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Lowest</div>
              <div className="text-xl font-bold text-primary">
                {getCurrencySymbol(currency)}{Math.min(...(electricityPrices.length > 0 ? electricityPrices.map(p => p.price) : [0])).toFixed(4)}
              </div>
            </div>
          </div>
          <div className="mt-auto pt-4 text-xs text-gray-500 flex items-center">
            <FaRegCalendarAlt className="mr-1" /> 
            Total records: {electricityPrices.length}
          </div>
        </div>
        
        {/* Actions Card */}
        <div className="bg-white rounded-lg shadow-md p-6 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm uppercase text-gray-500 font-medium">Quick Actions</h3>
            <div className="icon-bg-primary rounded-full p-2">
              <MdTimeline size={20} />
            </div>
          </div>
          <div className="flex flex-col gap-3 mt-2">
            <button
              onClick={() => {
                setShowAddForm(true)
                setEditId(null)
              }}
              className="btn-primary py-2 px-4 rounded-lg text-sm flex items-center justify-center"
              disabled={isSubmitting}
            >
              <MdAdd className="mr-1.5" /> Add New Price
            </button>
            <button
              onClick={() => window.print()}
              className="btn-outline py-2 px-4 rounded-lg text-sm flex items-center justify-center"
            >
              Export Price History
            </button>
          </div>
          <div className="mt-auto pt-4 text-xs text-gray-500 flex items-center">
            <MdInfo className="mr-1" /> 
            Manage all electricity prices
          </div>
        </div>
      </div>
      
      {/* Add price form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-md mb-6 overflow-hidden">
          <div className="bg-primary text-white py-3 px-6">
            <h3 className="font-medium flex items-center">
              <MdAdd className="mr-2" /> Add New Price
            </h3>
          </div>
          
          <form onSubmit={handleAddSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="add_price" className="block text-sm font-medium text-gray-700 mb-2">
                  Price per kWh ({getCurrencySymbol(currency)})
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <span className="text-gray-500">{getCurrencySymbol(currency)}</span>
                  </div>
                  <input
                    type="number"
                    id="add_price"
                    name="price"
                    value={newPrice.price}
                    onChange={handleNewPriceChange}
                    min="0"
                    step="0.0001"
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="add_date" className="block text-sm font-medium text-gray-700 mb-2">
                  Effective Date
                </label>
                <input
                  type="date"
                  id="add_date"
                  name="date"
                  value={newPrice.date}
                  onChange={handleNewPriceChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    id="add_default"
                    name="is_default"
                    checked={newPrice.is_default}
                    onChange={handleNewPriceChange}
                    className="mr-2 h-4 w-4"
                  />
                  <span className="text-sm font-medium text-gray-700">Set as default price</span>
                </label>
              </div>
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="btn-outline py-2 px-4 rounded-lg text-sm"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary py-2 px-4 rounded-lg text-sm flex items-center"
              >
                {isSubmitting ? 'Saving...' : (
                  <React.Fragment>
                    <MdSave className="mr-1.5" /> Save
                  </React.Fragment>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Price list */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-primary text-white py-3 px-6">
          <h3 className="font-medium flex items-center">
            <MdTimeline className="mr-2" /> Price History
          </h3>
        </div>
        
        {electricityPrices.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <MdAttachMoney size={48} className="mx-auto mb-3 opacity-30" />
            <p>No price records found</p>
            <p className="text-sm mt-2">Add a new price to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-6 text-left text-primary font-medium text-sm tracking-wider">
                    <button 
                      onClick={() => requestSort('date')}
                      className="flex items-center focus:outline-none hover:text-primary-dark"
                    >
                      <FaRegCalendarAlt className="mr-2" /> Date {getSortIcon('date')}
                    </button>
                  </th>
                  <th className="py-3 px-6 text-left text-primary font-medium text-sm tracking-wider">
                    <button 
                      onClick={() => requestSort('price')}
                      className="flex items-center focus:outline-none hover:text-primary-dark"
                    >
                      <MdAttachMoney className="mr-2" /> Price {getSortIcon('price')}
                    </button>
                  </th>
                  <th className="py-3 px-6 text-left text-primary font-medium text-sm tracking-wider">Default</th>
                  <th className="py-3 px-6 text-right text-primary font-medium text-sm tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedPrices.map(price => (
                  <React.Fragment key={price._id}>
                    <tr className="border-t border-gray-200 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6 text-dark">
                        {formatDate(price.date)}
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-medium text-primary">
                          {getCurrencySymbol(currency)}{price.price.toFixed(4)}
                        </span>
                        <span className="text-muted text-sm ml-1">
                          per kWh
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        {price.is_default ? (
                          <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                            Default
                          </span>
                        ) : "—"}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEditClick(price)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full"
                            aria-label="Edit price"
                            disabled={editId !== null || isSubmitting}
                          >
                            <MdEdit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(price._id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-full"
                            aria-label="Delete price"
                            disabled={editId !== null || isSubmitting}
                          >
                            <MdDelete size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    
                    {/* Edit form - inline in the table */}
                    {editId === price._id && (
                      <tr className="border-t border-gray-200 bg-blue-50">
                        <td colSpan={4} className="py-4 px-6">
                          <form onSubmit={handleEditSubmit} className="flex flex-wrap gap-4 items-end">
                            <div className="flex-1 min-w-[200px]">
                              <label htmlFor="edit_price" className="block text-sm font-medium text-gray-700 mb-1">
                                Price per kWh ({getCurrencySymbol(currency)})
                              </label>
                              <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                  <span className="text-gray-500">{getCurrencySymbol(currency)}</span>
                                </div>
                                <input
                                  type="number"
                                  id="edit_price"
                                  name="price"
                                  value={editForm.price}
                                  onChange={handleEditFormChange}
                                  min="0"
                                  step="0.0001"
                                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm"
                                  required
                                />
                              </div>
                            </div>
                            
                            <div className="flex-1 min-w-[200px]">
                              <label htmlFor="edit_date" className="block text-sm font-medium text-gray-700 mb-1">
                                Effective Date
                              </label>
                              <input
                                type="date"
                                id="edit_date"
                                name="date"
                                value={editForm.date}
                                onChange={handleEditFormChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm"
                                required
                              />
                            </div>
                            
                            <div>
                              <label className="flex items-center">
                                <input
                                  type="checkbox"
                                  id="edit_default"
                                  name="is_default"
                                  checked={editForm.is_default}
                                  onChange={handleEditFormChange}
                                  className="mr-2 h-4 w-4"
                                />
                                <span className="text-sm font-medium text-gray-700">Default</span>
                              </label>
                            </div>
                            
                            <div className="flex gap-2 ml-auto">
                              <button
                                type="button"
                                onClick={handleCancelEdit}
                                className="btn-outline py-2 px-4 rounded-lg text-sm"
                                disabled={isSubmitting}
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                disabled={isSubmitting}
                                className="btn-primary py-2 px-4 rounded-lg text-sm flex items-center"
                              >
                                {isSubmitting ? 'Saving...' : (
                                  <React.Fragment>
                                    <MdSave className="mr-1.5" /> Save
                                  </React.Fragment>
                                )}
                              </button>
                            </div>
                          </form>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
} 