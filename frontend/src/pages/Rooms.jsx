import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Search, Plus, Home, UserCheck, UserX, X, Check, AlertCircle, Info } from 'lucide-react';

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();

  // Modal states
  const [isAllocateModalOpen, setIsAllocateModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);

  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [roomsRes, studentsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/rooms'),
        axios.get('http://localhost:5000/api/students')
      ]);

      setRooms(roomsRes.data);
      setStudents(studentsRes.data);
    } catch (error) {
      console.error('Failed to fetch room or student data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAllocateModal = (preselectedRoomId = '') => {
    setSelectedRoomId(preselectedRoomId ? preselectedRoomId.toString() : (rooms.length > 0 ? rooms[0].id.toString() : ''));
    setSelectedStudentId(students.length > 0 ? students[0].id.toString() : '');
    setStartDate(new Date().toISOString().split('T')[0]);
    setErrorMessage('');
    setIsAllocateModalOpen(true);
  };

  const handleAllocateSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudentId || !selectedRoomId) {
      setErrorMessage('Please select both a student and a room.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');
    try {
      await axios.post('http://localhost:5000/api/rooms/allocate', {
        studentId: parseInt(selectedStudentId),
        roomId: parseInt(selectedRoomId),
        startDate
      });

      setSuccessMessage('Student successfully allocated to room!');
      setTimeout(() => setSuccessMessage(''), 3000);
      setIsAllocateModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error allocating room:', error);
      setErrorMessage(error.response?.data?.error || 'Failed to allocate room');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeallocate = async (allocationId) => {
    setSubmitting(true);
    try {
      await axios.put(`http://localhost:5000/api/rooms/deallocate/${allocationId}`);
      setSuccessMessage('Student deallocated from room successfully.');
      setTimeout(() => setSuccessMessage(''), 3000);
      setIsDetailsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error deallocating room:', error);
      setErrorMessage(error.response?.data?.error || 'Failed to deallocate student');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenDetails = (room) => {
    setSelectedRoom(room);
    setErrorMessage('');
    setIsDetailsModalOpen(true);
  };

  const filteredRooms = rooms.filter(room => 
    room.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.hostel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.hostel.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Toast Notification */}
      {successMessage && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-bounce">
          <Check size={20} />
          <span className="font-medium">{successMessage}</span>
        </div>
      )}

      {/* Header Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Room Allocations</h2>
          <p className="text-slate-500 mt-1">Manage hostel blocks, room occupancy, and student room assignments</p>
        </div>
        
        {user?.role !== 'STUDENT' && (
          <button 
            onClick={() => handleOpenAllocateModal()}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-5 py-2.5 rounded-xl font-semibold shadow-md shadow-indigo-500/20 transition-all duration-300 transform hover:-translate-y-0.5"
          >
            <UserCheck size={18} />
            <span>Allocate Student</span>
          </button>
        )}
      </div>

      {/* Toolbar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by room number or hostel block..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-sm rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder:text-slate-400 text-slate-800 transition-all"
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden relative">
        {loading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
             <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
             <p className="mt-4 text-indigo-600 font-semibold">Loading rooms...</p>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 text-xs uppercase tracking-wider font-bold">
              <tr>
                <th className="px-6 py-4">Hostel Block</th>
                <th className="px-6 py-4">Room Number</th>
                <th className="px-6 py-4">Capacity</th>
                <th className="px-6 py-4">Current Occupancy</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRooms.length === 0 && !loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                    No room records found.
                  </td>
                </tr>
              ) : (
                filteredRooms.map((room) => {
                  const isFull = room.currentOccupancy >= room.capacity;
                  return (
                    <tr key={room.id} className="hover:bg-slate-50/80 transition-colors duration-150">
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        {room.hostel.name} <span className="text-slate-400 text-xs font-normal">({room.hostel.type})</span>
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-indigo-600">{room.roomNumber}</td>
                      <td className="px-6 py-4 text-slate-600">{room.capacity} Students</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-800">{room.currentOccupancy} / {room.capacity}</span>
                          <div className="w-16 bg-slate-200 rounded-full h-2 overflow-hidden">
                            <div 
                              className={`h-2 rounded-full ${isFull ? 'bg-rose-500' : 'bg-indigo-600'}`} 
                              style={{ width: `${Math.min(100, (room.currentOccupancy / room.capacity) * 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {isFull ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            FULL
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            AVAILABLE ({room.capacity - room.currentOccupancy})
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!isFull && user?.role !== 'STUDENT' && (
                            <button 
                              onClick={() => handleOpenAllocateModal(room.id)}
                              className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                            >
                              <UserCheck size={14} />
                              <span>Allocate</span>
                            </button>
                          )}
                          <button 
                            onClick={() => handleOpenDetails(room)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                          >
                            <Info size={14} />
                            <span>Details</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- ALLOCATE STUDENT MODAL --- */}
      {isAllocateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
                <UserCheck className="text-indigo-600" size={22} />
                <span>Allocate Student to Room</span>
              </div>
              <button 
                onClick={() => setIsAllocateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAllocateSubmit} className="p-6 space-y-4">
              {errorMessage && (
                <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl border border-red-200 flex items-center gap-2">
                  <AlertCircle size={18} className="shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Select Student *</label>
                <select 
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800"
                >
                  <option value="">-- Select Student --</option>
                  {students.map(student => (
                    <option key={student.id} value={student.id}>
                      {student.name} ({student.rollNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Select Room *</label>
                <select 
                  value={selectedRoomId}
                  onChange={(e) => setSelectedRoomId(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800"
                >
                  <option value="">-- Select Room --</option>
                  {rooms.map(room => {
                    const isFull = room.currentOccupancy >= room.capacity;
                    return (
                      <option key={room.id} value={room.id} disabled={isFull}>
                        {room.hostel.name} - Room {room.roomNumber} ({room.currentOccupancy}/{room.capacity} Occupied){isFull ? ' - FULL' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Allocation Date *</label>
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsAllocateModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm px-5 py-2 rounded-xl shadow-md shadow-indigo-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting ? 'Allocating...' : 'Allocate Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- ROOM DETAILS & OCCUPANTS MODAL --- */}
      {isDetailsModalOpen && selectedRoom && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
                <Home className="text-indigo-600" size={20} />
                <span>Room {selectedRoom.roomNumber} - {selectedRoom.hostel.name}</span>
              </div>
              <button 
                onClick={() => setIsDetailsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl text-center text-xs">
                <div>
                  <span className="text-slate-400 block uppercase font-semibold">Block</span>
                  <span className="font-bold text-slate-800">{selectedRoom.hostel.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block uppercase font-semibold">Capacity</span>
                  <span className="font-bold text-slate-800">{selectedRoom.capacity}</span>
                </div>
                <div>
                  <span className="text-slate-400 block uppercase font-semibold">Occupancy</span>
                  <span className="font-bold text-indigo-600">{selectedRoom.currentOccupancy} / {selectedRoom.capacity}</span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-3">Current Occupants</h4>
                {selectedRoom.allocations && selectedRoom.allocations.length > 0 ? (
                  <div className="space-y-2">
                    {selectedRoom.allocations.map(alloc => (
                      <div key={alloc.id} className="flex justify-between items-center p-3 bg-slate-50 border border-slate-100 rounded-xl">
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">{alloc.student.name}</p>
                          <p className="text-xs font-mono text-indigo-600">{alloc.student.rollNumber}</p>
                        </div>
                        {user?.role !== 'STUDENT' && (
                          <button 
                            onClick={() => handleDeallocate(alloc.id)}
                            disabled={submitting}
                            className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                          >
                            <UserX size={14} />
                            <span>Deallocate</span>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-slate-400 border border-dashed border-slate-200 rounded-xl">
                    No active occupants in this room.
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button 
                  onClick={() => setIsDetailsModalOpen(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm px-5 py-2 rounded-xl transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rooms;

