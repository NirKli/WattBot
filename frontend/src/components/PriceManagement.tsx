import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { MdAdd, MdDelete, MdEdit, MdSave, MdTimeline, MdAttachMoney } from 'react-icons/md'

interface ElectricityPrice {
  id: string;
  _id: string;
  price: number;
  date: string;
  created_at: string;
  updated_at: string;
  is_default: boolean;
}

export default function PriceManagement() {
  // Data states
  const [electricityPrices, setElectricityPrices] = useState<ElectricityPrice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPrice, setCurrentPrice] = useState<number | null>(null)
  
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
      
      const response = await axios.get('http://localhost:8000/electricity-prices')
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

  // Add a new price
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccessMessage(null)
    
    try {
      const response = await axios.post('http://localhost:8000/electricity-price', newPrice)
      
      setElectricityPrices(prev => [...prev, response.data])
      setSuccessMessage('Price added successfully')
      
      // Reset form
      setNewPrice({
        price: 0,
        date: formatDateForInput(new Date().toISOString()),
        is_default: false
      })
      
      setShowAddForm(false)
      fetchPrices() // Refresh data to ensure we have the latest
    } catch (err) {
      console.error('Error adding price:', err)
      setError('Failed to add price')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Update an existing price
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editId) return
    
    setIsSubmitting(true)
    setError(null)
    setSuccessMessage(null)
    
    try {
      // Make sure the ID is in the payload
      const payload = { ...editForm, _id: editId }
      console.log('Sending edit payload:', payload)
      
      // No query params needed for electricity price
      const response = await axios.put(`http://localhost:8000/electricity-price/${editId}`, payload)
      
      setElectricityPrices(prev => 
        prev.map(price => price._id === editId ? response.data : price)
      )
      
      setSuccessMessage('Price updated successfully')
      setEditId(null) // Close edit form
      fetchPrices() // Refresh data to ensure we have the latest
    } catch (err) {
      console.error('Error updating price:', err)
      setError('Failed to update price')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Delete a price
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this price?')) {
      return
    }
    
    setIsSubmitting(true)
    setError(null)
    setSuccessMessage(null)
    
    try {
      // No query params needed for electricity price
      await axios.delete(`http://localhost:8000/electricity-price/${id}`)
      
      setElectricityPrices(prev => prev.filter(price => price._id !== id))
      setSuccessMessage('Price deleted successfully')
      fetchPrices() // Refresh data to ensure we have the latest
    } catch (err) {
      console.error('Error deleting price:', err)
      setError('Failed to delete price')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-10 bg-primary/10 rounded mb-8 w-1/3"></div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={`loading-item-${i}`} className="h-14 bg-primary/5 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  // Error state with no data
  if (error && electricityPrices.length === 0) {
    return (
      <div className="text-center text-danger bg-danger/10 border border-danger/30 rounded p-6">
        <p className="flex items-center justify-center">{error}</p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-8 text-center text-primary">
        Electricity Price Management
      </h2>
      
      {/* Current price indicator */}
      <div className="bg-white rounded shadow p-5 flex items-center mb-8">
        <div className="icon-bg-primary p-3 rounded mr-4">
          <MdAttachMoney size={24} />
        </div>
        <div>
          <p className="text-xs text-muted uppercase">Current Price</p>
          <p className="text-xl font-bold text-primary">
            ${currentPrice !== null ? currentPrice.toFixed(4) : '0.0000'} <span className="text-sm font-normal">per kWh</span>
          </p>
        </div>
      </div>
      
      {/* Messages */}
      {successMessage && (
        <div className="bg-green-100 border border-green-300 text-green-800 rounded p-4 mb-6">
          {successMessage}
        </div>
      )}
      
      {error && (
        <div className="bg-danger/10 border border-danger/30 text-danger rounded p-4 mb-6">
          {error}
        </div>
      )}
      
      {/* Add button - only show when not in edit mode */}
      {!showAddForm && editId === null && (
        <div className="mb-6">
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-primary py-2 px-5 rounded-full text-sm flex items-center"
            disabled={isSubmitting}
          >
            <MdAdd className="mr-1.5" /> Add New Price
          </button>
        </div>
      )}
      
      {/* Add price form */}
      {showAddForm && (
        <div className="bg-white rounded shadow mb-6 p-6">
          <h3 className="text-lg font-medium mb-4 flex items-center text-primary">
            <MdAdd className="mr-2" /> Add New Price
          </h3>
          
          <form onSubmit={handleAddSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="add_price" className="block text-sm font-medium text-gray-700 mb-1">
                  Price per kWh ($)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <span className="text-gray-500">$</span>
                  </div>
                  <input
                    type="number"
                    id="add_price"
                    name="price"
                    value={newPrice.price}
                    onChange={handleNewPriceChange}
                    min="0"
                    step="0.0001"
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded shadow-sm"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="add_date" className="block text-sm font-medium text-gray-700 mb-1">
                  Effective Date
                </label>
                <input
                  type="date"
                  id="add_date"
                  name="date"
                  value={newPrice.date}
                  onChange={handleNewPriceChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded shadow-sm"
                  required
                />
              </div>
              
              <div className="col-span-2">
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
                className="btn-outline py-2 px-5 rounded-full text-sm"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary py-2 px-5 rounded-full text-sm flex items-center"
              >
                {isSubmitting ? 'Saving...' : (
                  <React.Fragment key="save-button-content">
                    <MdSave className="mr-1.5" /> Save
                  </React.Fragment>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Price list */}
      <div className="bg-white rounded shadow overflow-hidden">
        <div className="bg-primary text-white py-4 px-6">
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
          <div>
            {/* Price table */}
            <table className="w-full border-collapse">
              <thead className="bg-light">
                <tr>
                  <th key="header-date" className="py-3 px-6 text-left text-primary font-medium text-sm tracking-wider">Date</th>
                  <th key="header-price" className="py-3 px-6 text-left text-primary font-medium text-sm tracking-wider">Price</th>
                  <th key="header-default" className="py-3 px-6 text-left text-primary font-medium text-sm tracking-wider">Default</th>
                  <th key="header-actions" className="py-3 px-6 text-right text-primary font-medium text-sm tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {electricityPrices.map(price => (
                  <tr key={price._id} className="border-t border-gray-200 hover:bg-light">
                    <td key={`date-${price._id}`} className="py-4 px-6 text-dark">
                      {formatDate(price.date)}
                    </td>
                    <td key={`price-${price._id}`} className="py-4 px-6">
                      <span key={`price-value-${price._id}`} className="font-medium text-primary">
                        ${price.price.toFixed(4)}
                      </span>
                      <span key={`price-unit-${price._id}`} className="text-muted text-sm ml-1">
                        per kWh
                      </span>
                    </td>
                    <td key={`default-${price._id}`} className="py-4 px-6">
                      {price.is_default ? (
                        <span key={`default-badge-${price._id}`} className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                          Default
                        </span>
                      ) : "—"}
                    </td>
                    <td key={`actions-${price._id}`} className="py-4 px-6 text-right">
                      <div key={`buttons-${price._id}`} className="flex justify-end gap-2">
                        <button
                          key={`edit-btn-${price._id}`}
                          onClick={() => handleEditClick(price)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                          aria-label="Edit price"
                          disabled={editId !== null || isSubmitting}
                        >
                          <MdEdit size={18} />
                        </button>
                        <button
                          key={`delete-btn-${price._id}`}
                          onClick={() => handleDelete(price._id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                          aria-label="Delete price"
                          disabled={editId !== null || isSubmitting}
                        >
                          <MdDelete size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Edit form - outside of the table */}
            {editId && (
              <div className="border-t border-gray-200 bg-light p-6">
                <h3 className="text-lg font-medium mb-4 flex items-center text-primary">
                  <MdEdit className="mr-2" /> Edit Price
                </h3>
                
                <form onSubmit={handleEditSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label htmlFor="edit_price" className="block text-sm font-medium text-gray-700 mb-1">
                        Price per kWh ($)
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <span className="text-gray-500">$</span>
                        </div>
                        <input
                          type="number"
                          id="edit_price"
                          name="price"
                          value={editForm.price}
                          onChange={handleEditFormChange}
                          min="0"
                          step="0.0001"
                          className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded shadow-sm"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="edit_date" className="block text-sm font-medium text-gray-700 mb-1">
                        Effective Date
                      </label>
                      <input
                        type="date"
                        id="edit_date"
                        name="date"
                        value={editForm.date}
                        onChange={handleEditFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded shadow-sm"
                        required
                      />
                    </div>
                    
                    <div className="flex items-center">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          id="edit_default"
                          name="is_default"
                          checked={editForm.is_default}
                          onChange={handleEditFormChange}
                          className="mr-2 h-4 w-4"
                        />
                        <span className="text-sm font-medium text-gray-700">Set as default price</span>
                      </label>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setEditId(null)}
                      className="btn-outline py-1.5 px-4 rounded-full text-xs"
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-primary py-1.5 px-4 rounded-full text-xs flex items-center"
                    >
                      {isSubmitting ? 'Saving...' : (
                        <React.Fragment key="edit-button-content">
                          <MdSave className="mr-1" size={16} /> Update
                        </React.Fragment>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 