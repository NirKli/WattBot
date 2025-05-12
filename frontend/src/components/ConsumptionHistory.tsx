import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { MdBarChart, MdElectricBolt, MdInfo, MdCalendarToday, MdTrendingUp, MdEdit, MdSave } from 'react-icons/md'
import { FaLightbulb } from 'react-icons/fa'

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
  const [editingId, setEditingId] = useState<string | null>(null)
  const [updateLoading, setUpdateLoading] = useState(false)
  const [updateError, setUpdateError] = useState<string | null>(null)
  const [updateSuccess, setUpdateSuccess] = useState(false)

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

  // Add a function to format dates for the input field
  const formatDateForInput = (dateString: string): string => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return '';
      }
      return date.toISOString().split('T')[0];
    } catch (e) {
      console.error('Error formatting date for input:', e);
      return '';
    }
  };

  const handleEditClick = (readingId: string) => {
    // If already editing this reading, close it. Otherwise, start editing it
    setEditingId(editingId === readingId ? null : readingId);
    setUpdateError(null);
    setUpdateSuccess(false);
  };

  const handleEditFormChange = (reading: MonthlyConsumption, field: string, value: string) => {
    const updatedReadings = readings.map(r => {
      if (r.label_file === reading.label_file) {
        return { 
          ...r, 
          [field]: field === 'date' ? value : parseFloat(value) || 0 
        };
      }
      return r;
    });
    
    setReadings(updatedReadings);
  };

  const handleSaveEdit = async (reading: MonthlyConsumption) => {
    setUpdateLoading(true);
    setUpdateError(null);
    setUpdateSuccess(false);
    
    try {
      // Send PUT request to update the reading
      const response = await axios.put(
        `http://localhost:8000/monthly-consumption/${reading.label_file}`,
        reading
      );
      
      // Update the readings state with the updated reading
      setReadings(prevReadings => 
        prevReadings.map(r => 
          r.label_file === reading.label_file ? response.data : r
        )
      );
      
      setUpdateSuccess(true);
      
      // Close the edit form after a short delay
      setTimeout(() => {
        setEditingId(null);
        setUpdateSuccess(false);
      }, 1500);
      
    } catch (err) {
      console.error('Update error:', err);
      setUpdateError('Failed to update reading');
    } finally {
      setUpdateLoading(false);
    }
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
              {readings.map((reading) => (
                <React.Fragment key={reading.label_file || reading.file_name || 'reading-' + reading.date}>
                  <tr className="border-t border-gray-200 hover:bg-light transition-colors">
                    <td className="py-4 px-6 text-dark">{formatDate(reading.date)}</td>
                    <td className="py-4 px-6">
                      <span className="font-medium text-primary">{reading.total_kwh_consumed.toFixed(2)}</span>
                      <span className="text-muted text-sm ml-1">kWh</span>
                    </td>
                    <td className="py-4 px-6 font-medium text-primary">${reading.price.toFixed(2)}</td>
                    <td className="py-4 px-6">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditClick(reading.label_file)}
                          className="btn-outline-secondary py-2 px-4 rounded-full text-sm flex items-center"
                          aria-label="Edit reading"
                        >
                          <MdEdit className="mr-1.5" /> Edit
                        </button>
                        <button className="btn-outline py-2 px-4 rounded-full text-sm flex items-center">
                          <MdInfo className="mr-1.5" /> Details
                        </button>
                      </div>
                    </td>
                  </tr>
                  
                  {/* Inline edit form - displays directly under the row being edited */}
                  {editingId === reading.label_file && (
                    <tr className="bg-gray-50">
                      <td colSpan={4} className="py-4 px-6">
                        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
                          <h4 className="text-primary font-medium mb-3 flex items-center">
                            <MdEdit className="mr-2" /> Edit Meter Reading
                          </h4>
                          
                          {updateSuccess ? (
                            <div className="flex items-center text-green-700 bg-green-50 p-2 rounded">
                              <MdSave className="mr-2" /> Reading updated successfully!
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {/* Date Field */}
                              <div>
                                <label htmlFor={`date-${reading.label_file}`} className="block text-sm font-medium text-gray-700 mb-1">
                                  Reading Date
                                </label>
                                <input
                                  type="date"
                                  id={`date-${reading.label_file}`}
                                  value={formatDateForInput(reading.date)}
                                  onChange={(e) => handleEditFormChange(reading, 'date', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded"
                                />
                              </div>
                              
                              {/* Consumption Field */}
                              <div>
                                <label htmlFor={`consumption-${reading.label_file}`} className="block text-sm font-medium text-gray-700 mb-1">
                                  Consumption (kWh)
                                </label>
                                <input
                                  type="number"
                                  id={`consumption-${reading.label_file}`}
                                  value={reading.total_kwh_consumed}
                                  onChange={(e) => handleEditFormChange(reading, 'total_kwh_consumed', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded"
                                  min="0"
                                  step="0.01"
                                />
                              </div>
                              
                              {/* Price Field */}
                              <div>
                                <label htmlFor={`price-${reading.label_file}`} className="block text-sm font-medium text-gray-700 mb-1">
                                  Price ($)
                                </label>
                                <input
                                  type="number"
                                  id={`price-${reading.label_file}`}
                                  value={reading.price}
                                  onChange={(e) => handleEditFormChange(reading, 'price', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded"
                                  min="0"
                                  step="0.01"
                                />
                              </div>
                              
                              {/* Error Message */}
                              {updateError && (
                                <div className="col-span-3 text-sm text-danger bg-danger/10 p-2 rounded">
                                  {updateError}
                                </div>
                              )}
                              
                              {/* Action Buttons */}
                              <div className="col-span-3 flex justify-end gap-2 mt-2">
                                <button
                                  type="button"
                                  onClick={() => setEditingId(null)}
                                  className="btn-outline py-1.5 px-3 rounded-full text-xs"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSaveEdit(reading)}
                                  disabled={updateLoading}
                                  className="btn-primary py-1.5 px-3 rounded-full text-xs flex items-center"
                                >
                                  {updateLoading ? (
                                    <>
                                      <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                      </svg>
                                      Saving...
                                    </>
                                  ) : (
                                    <>
                                      <MdSave className="mr-1" size={14} /> Save
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          )}
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