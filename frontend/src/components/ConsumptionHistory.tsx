import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { MdBarChart, MdElectricBolt, MdInfo, MdCalendarToday, MdTrendingUp, MdEdit, MdSave } from 'react-icons/md'
import { FaLightbulb, FaCalendarDay, FaImage, FaClipboard } from 'react-icons/fa'

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
  const [editingId, setEditingId] = useState<string | null>(null)
  const [updateLoading, setUpdateLoading] = useState(false)
  const [updateError, setUpdateError] = useState<string | null>(null)
  const [updateSuccess, setUpdateSuccess] = useState(false)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [detailImageUrl, setDetailImageUrl] = useState<string | null>(null)

  useEffect(() => {
    fetchReadings()
  }, [])

  useEffect(() => {
    // If we have a reading detail open and it has a label file, fetch the image
    if (detailId) {
      const reading = readings.find(r => r._id === detailId);
      if (reading?.label_file) {
        const apiBaseUrl = 'http://localhost:8000';
        const imageUrl = `${apiBaseUrl}/monthly-consumption/file/${reading.label_file}`;
        setDetailImageUrl(imageUrl);
      } else {
        setDetailImageUrl(null);
      }
    } else {
      setDetailImageUrl(null);
    }
  }, [detailId, readings]);

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
    console.log(`Editing reading with ID: ${readingId}, current editingId: ${editingId}`);
    // If already editing this reading, close it. Otherwise, start editing it
    setEditingId(editingId === readingId ? null : readingId);
    setUpdateError(null);
    setUpdateSuccess(false);
    // Close details view if open
    setDetailId(null);
  };

  const handleEditFormChange = (reading: MonthlyConsumption, field: string, value: string) => {
    const updatedReadings = readings.map(r => {
      if (r._id === reading._id) {
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
      // Ensure _id is included in the payload
      const payload = { ...reading, _id: reading._id, id: reading._id };
      console.log('Sending update payload:', payload);
      
      // Send PUT request to update the reading using _id and include id in query params
      const response = await axios.put(
        `http://localhost:8000/monthly-consumption/${reading._id}?id=${reading._id}`,
        payload
      );
      
      // Update the readings state with the updated reading
      setReadings(prevReadings => 
        prevReadings.map(r => 
          r._id === reading._id ? response.data : r
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

  const handleDetailClick = (readingId: string) => {
    // If already showing details for this reading, close it. Otherwise, show it
    setDetailId(detailId === readingId ? null : readingId);
    // Close edit form if open
    setEditingId(null);
  };

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
            <p className="text-xl font-bold text-primary">${totalSpending.toFixed(4)}</p>
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
                <React.Fragment key={reading._id}>
                  <tr className="border-t border-gray-200 hover:bg-light transition-colors">
                    <td className="py-4 px-6 text-dark">{formatDate(reading.date)}</td>
                    <td className="py-4 px-6">
                      <span className="font-medium text-primary">{reading.total_kwh_consumed.toFixed(2)}</span>
                      <span className="text-muted text-sm ml-1">kWh</span>
                    </td>
                    <td className="py-4 px-6 font-medium text-primary">${reading.price.toFixed(4)}</td>
                    <td className="py-4 px-6">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditClick(reading._id)}
                          className="btn-outline-secondary py-2 px-4 rounded-full text-sm flex items-center"
                          aria-label="Edit reading"
                        >
                          <MdEdit className="mr-1.5" /> Edit
                        </button>
                        <button 
                          onClick={() => handleDetailClick(reading._id)}
                          className="btn-outline py-2 px-4 rounded-full text-sm flex items-center"
                          aria-label="View reading details"
                        >
                          <MdInfo className="mr-1.5" /> Details
                        </button>
                      </div>
                    </td>
                  </tr>
                  
                  {/* Details view */}
                  {detailId === reading._id && (
                    <tr className="bg-gray-50">
                      <td colSpan={4} className="py-4 px-6">
                        <div className="bg-white p-5 rounded-lg shadow border border-gray-200">
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
                                  <span className="text-primary mr-2">$</span>
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
                            
                            {/* Reading image */}
                            <div className="flex flex-col items-center justify-center">
                              {detailImageUrl ? (
                                <div className="relative w-full">
                                  <h5 className="text-sm font-medium text-gray-500 mb-2">Meter Image</h5>
                                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                                    <img 
                                      src={detailImageUrl} 
                                      alt="Meter reading" 
                                      className="w-full object-contain max-h-48" 
                                    />
                                  </div>
                                  <div className="mt-2 text-center">
                                    <a 
                                      href={detailImageUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-primary text-sm flex items-center justify-center"
                                    >
                                      <FaImage className="mr-1" /> View Full Image
                                    </a>
                                  </div>
                                </div>
                              ) : (
                                <div className="border border-gray-200 rounded-lg p-8 text-center text-gray-400 w-full">
                                  <FaImage size={32} className="mx-auto mb-2" />
                                  <p className="text-sm">Image not available</p>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="mt-6 text-right">
                            <button
                              onClick={() => setDetailId(null)}
                              className="btn-outline py-2 px-5 rounded-full text-sm"
                            >
                              Close
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                  
                  {/* Inline edit form - displays directly under the row being edited */}
                  {editingId !== null && editingId === reading._id && (
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
                                <label htmlFor={`date-${reading._id}`} className="block text-sm font-medium text-gray-700 mb-1">
                                  Reading Date
                                </label>
                                <input
                                  type="date"
                                  id={`date-${reading._id}`}
                                  value={formatDateForInput(reading.date)}
                                  onChange={(e) => handleEditFormChange(reading, 'date', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded"
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
                                  value={reading.total_kwh_consumed}
                                  onChange={(e) => handleEditFormChange(reading, 'total_kwh_consumed', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded"
                                  min="0"
                                  step="0.01"
                                />
                              </div>
                              
                              {/* Price Field */}
                              <div>
                                <label htmlFor={`price-${reading._id}`} className="block text-sm font-medium text-gray-700 mb-1">
                                  Price ($)
                                </label>
                                <input
                                  type="number"
                                  id={`price-${reading._id}`}
                                  value={reading.price}
                                  onChange={(e) => handleEditFormChange(reading, 'price', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded"
                                  min="0"
                                  step="0.0001"
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