import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { MdBarChart, MdElectricBolt, MdInfo, MdCalendarToday, MdTrendingUp, MdEdit, MdClose, MdSave } from 'react-icons/md'
import { FaLightbulb, FaCalendarAlt, FaDollarSign } from 'react-icons/fa'

interface MonthlyConsumption {
  modified_date: string;
  date: string;
  total_kwh_consumed: number;
  price: number;
  original_file: any;
  file_name: string;
  label_file: any;
  file_label_name: any;
}

export default function ConsumptionHistory() {
  const [readings, setReadings] = useState<MonthlyConsumption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingReading, setEditingReading] = useState<MonthlyConsumption | null>(null)
  const [editForm, setEditForm] = useState({
    date: '',
    total_kwh_consumed: 0,
    price: 0
  })
  const [updateLoading, setUpdateLoading] = useState(false)
  const [updateError, setUpdateError] = useState<string | null>(null)
  const [updateSuccess, setUpdateSuccess] = useState(false)
  const [editModalPosition, setEditModalPosition] = useState({ top: 0, left: 0 })
  const editButtonRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    fetchReadings()
  }, [])

  const fetchReadings = async () => {
    try {
      const response = await axios.get('http://localhost:8000/monthly-consumption')
      
      // Sort readings by date (newest first) with safe date parsing
      const sortedReadings = response.data.sort((a: MonthlyConsumption, b: MonthlyConsumption) => {
        const dateA = safeParseDate(a.date);
        const dateB = safeParseDate(b.date);
        
        if (!dateA && !dateB) return 0;
        if (!dateA) return 1; // null dates go to the end
        if (!dateB) return -1;
        
        return dateB.getTime() - dateA.getTime();
      })
      
      setReadings(sortedReadings)
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

  // Format the date
  const formatDate = (dateString: string | undefined): string => {
    const date = safeParseDate(dateString);
    if (!date) return 'Invalid date';
    
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const openEditModal = (reading: MonthlyConsumption, event: React.MouseEvent<HTMLButtonElement>) => {
    setEditingReading(reading)
    setEditForm({
      date: reading.date,
      total_kwh_consumed: reading.total_kwh_consumed,
      price: reading.price
    })
    
    // Simplified positioning logic - fixed offset from button
    const buttonRect = event.currentTarget.getBoundingClientRect();
    setEditModalPosition({
      top: buttonRect.bottom + 10,
      left: buttonRect.left - 100
    });
    
    setEditModalOpen(true)
    setUpdateError(null)
    setUpdateSuccess(false)
  }

  const closeEditModal = () => {
    setEditModalOpen(false)
    setEditingReading(null)
    setUpdateError(null)
    setUpdateSuccess(false)
  }

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setEditForm(prev => ({
      ...prev,
      [name]: name === 'date' ? value : parseFloat(value) || 0
    }))
  }

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!editingReading) return
    
    setUpdateLoading(true)
    setUpdateError(null)
    setUpdateSuccess(false)
    
    try {
      // Prepare the updated reading
      const updatedReading = {
        ...editingReading,
        date: editForm.date,
        total_kwh_consumed: editForm.total_kwh_consumed,
        price: editForm.price
      }
      
      // Send PUT request to update the reading
      const response = await axios.put(
        `http://localhost:8000/monthly-consumption/${editingReading.label_file}`,
        updatedReading
      )
      
      // Update the readings state with the updated reading
      setReadings(prevReadings => 
        prevReadings.map(reading => 
          reading.label_file === editingReading.label_file ? response.data : reading
        )
      )
      
      setUpdateSuccess(true)
      
      // Close the modal after a short delay
      setTimeout(() => {
        closeEditModal()
        // Refresh readings
        fetchReadings()
      }, 1500)
      
    } catch (err) {
      console.error('Update error:', err)
      setUpdateError('Failed to update reading')
    } finally {
      setUpdateLoading(false)
    }
  }

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
      <div className="text-center text-danger bg-danger/10 border border-danger/30 rounded p-6">
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
      <div className="text-center text-primary bg-primary/5 border border-primary/20 rounded p-8">
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

  return (
    <div>
      <h2 className="text-2xl font-bold mb-8 text-center text-primary">
        Consumption History
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded shadow p-5 flex items-center">
          <div className="icon-bg-primary p-3 rounded mr-4">
            <MdBarChart size={24} />
          </div>
          <div>
            <p className="text-xs text-muted uppercase">Total Readings</p>
            <p className="text-xl font-bold text-primary">{readings.length}</p>
          </div>
        </div>
        
        <div className="bg-white rounded shadow p-5 flex items-center">
          <div className="icon-bg-primary p-3 rounded mr-4">
            <MdElectricBolt size={24} />
          </div>
          <div>
            <p className="text-xs text-muted uppercase">Avg. Consumption</p>
            <p className="text-xl font-bold text-primary">{averageKwh.toFixed(1)} <span className="text-sm font-normal">kWh</span></p>
          </div>
        </div>
        
        <div className="bg-white rounded shadow p-5 flex items-center">
          <div className="icon-bg-primary p-3 rounded mr-4">
            <MdTrendingUp size={24} />
          </div>
          <div>
            <p className="text-xs text-muted uppercase">Total Spending</p>
            <p className="text-xl font-bold text-primary">${totalSpending.toFixed(2)}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded overflow-hidden shadow">
        <div className="bg-primary text-white py-4 px-6">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">Reading History</h3>
            <p className="text-sm opacity-90">Total: {totalKwh.toFixed(2)} kWh</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-light">
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
              {readings.map((reading, index) => (
                <tr 
                  key={reading.label_file || index} 
                  className={`border-t border-gray-200 hover:bg-light transition-colors`}
                >
                  <td className="py-4 px-6 text-dark">{formatDate(reading.date)}</td>
                  <td className="py-4 px-6">
                    <span className="font-medium text-primary">{reading.total_kwh_consumed.toFixed(2)}</span>
                    <span className="text-muted text-sm ml-1">kWh</span>
                  </td>
                  <td className="py-4 px-6 font-medium text-primary">${reading.price.toFixed(2)}</td>
                  <td className="py-4 px-6">
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => openEditModal(reading, e)}
                        className="btn-outline-secondary py-2 px-4 rounded-full text-sm flex items-center hover:bg-light transition-colors"
                        aria-label="Edit reading"
                      >
                        <MdEdit className="mr-1.5" /> Edit
                      </button>
                      <button
                        className="btn-outline py-2 px-4 rounded-full text-sm flex items-center hover:bg-light transition-colors"
                      >
                        <MdInfo className="mr-1.5" /> Details
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal - Optimized for performance */}
      {editModalOpen && (
        <>
          {/* Simplified overlay */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={closeEditModal}
          ></div>
          
          {/* Floating edit panel with simplified styling */}
          <div 
            className="absolute z-50 bg-white rounded-xl w-full max-w-md shadow-xl"
            style={{ 
              top: `${editModalPosition.top}px`, 
              left: `${editModalPosition.left}px`,
              maxWidth: '360px'
            }}
          >
            {/* Header with simplified gradient */}
            <div className="bg-primary text-white py-3 px-5 rounded-t-xl flex justify-between items-center">
              <h3 className="font-medium text-base">Edit Meter Reading</h3>
              <button 
                onClick={closeEditModal}
                className="text-white hover:bg-white/20 p-1.5 rounded-full"
                aria-label="Close modal"
              >
                <MdClose size={18} />
              </button>
            </div>
            
            {updateSuccess ? (
              <div className="p-6 text-center">
                <div className="mx-auto bg-green-100 text-green-800 rounded-full w-14 h-14 flex items-center justify-center mb-3">
                  <MdSave size={24} />
                </div>
                <h4 className="text-lg font-medium text-gray-800 mb-2">Changes Saved!</h4>
                <p className="text-gray-600 mb-4 text-sm">Your reading has been updated successfully.</p>
                <button
                  onClick={closeEditModal}
                  className="btn-primary py-2 px-5 rounded-full text-sm"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitEdit} className="p-5">
                <div className="space-y-4">
                  {/* Date Field - simplified */}
                  <div>
                    <label htmlFor="date" className="flex items-center text-sm font-medium text-gray-700 mb-1.5">
                      <FaCalendarAlt className="mr-2 text-primary" /> Reading Date
                    </label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      value={editForm.date}
                      onChange={handleEditFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>
                  
                  {/* Consumption Field - simplified */}
                  <div>
                    <label htmlFor="total_kwh_consumed" className="flex items-center text-sm font-medium text-gray-700 mb-1.5">
                      <MdElectricBolt className="mr-2 text-primary" /> Electricity Consumption
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        id="total_kwh_consumed"
                        name="total_kwh_consumed"
                        min="0"
                        step="0.01"
                        value={editForm.total_kwh_consumed}
                        onChange={handleEditFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg pr-14"
                        required
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
                        kWh
                      </div>
                    </div>
                  </div>
                  
                  {/* Price Field - simplified */}
                  <div>
                    <label htmlFor="price" className="flex items-center text-sm font-medium text-gray-700 mb-1.5">
                      <FaDollarSign className="mr-2 text-primary" /> Cost Amount
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                        $
                      </div>
                      <input
                        type="number"
                        id="price"
                        name="price"
                        min="0"
                        step="0.01"
                        value={editForm.price}
                        onChange={handleEditFormChange}
                        className="w-full pl-8 px-3 py-2 border border-gray-300 rounded-lg"
                        required
                      />
                    </div>
                  </div>
                </div>

                {updateError && (
                  <div className="mt-4 p-2.5 text-sm bg-danger/10 border border-danger/30 text-danger rounded-lg">
                    <p className="flex items-center">
                      <span className="bg-danger/20 rounded-full p-1 mr-2">
                        <MdClose className="text-danger" size={14} />
                      </span>
                      {updateError}
                    </p>
                  </div>
                )}
                
                <div className="flex justify-end gap-2 mt-5 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="btn-outline py-2 px-4 rounded-full text-xs font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updateLoading}
                    className={`btn-primary py-2 px-5 rounded-full text-xs font-medium flex items-center justify-center min-w-20 ${
                      updateLoading ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {updateLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </>
                    ) : (
                      <>
                        <MdSave className="mr-1.5" /> Save
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </>
      )}
    </div>
  )
} 