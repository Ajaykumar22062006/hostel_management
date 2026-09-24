import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Search, Plus, Eye, Pencil, Trash2, X, Check, AlertCircle, UserPlus, UserCheck } from 'lucide-react';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Add form fields
  const [formData, setFormData] = useState({
    name: '',
    rollNumber: '',
    email: '',
    password: 'password123',
    department: 'Computer Science',
    year: '1',
    contact: '',
    address: ''
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await axios.get('/api/students');
      
      if (res.data.length === 0) {
        setStudents([
          { id: 1, rollNumber: 'STU2023001', name: 'Alice Brown', email: 'alice@student.edu', department: 'Computer Science', year: 2, room: 'B101', contact: '5551112222', status: 'ACTIVE', address: '123 University Campus' },
          { id: 2, rollNumber: 'STU2023002', name: 'Bob White', email: 'bob@student.edu', department: 'Mechanical', year: 3, room: 'A102', contact: '5553334444', status: 'ACTIVE', address: '456 College Road' },
          { id: 3, rollNumber: 'STU2024003', name: 'Charlie Davis', email: 'charlie@student.edu', department: 'History', year: 1, room: 'A102', contact: '5555556666', status: 'ACTIVE', address: '789 Hostel Ave' }
        ]);
      } else {
        const mappedData = res.data.map(student => ({
          id: student.id,
          rollNumber: student.rollNumber,
          name: student.name,
          email: student.user?.email || 'N/A',
          department: student.department || 'General',
          year: student.year || 1,
          room: student.allocations && student.allocations.length > 0 ? student.allocations[0].room.roomNumber : 'Not assigned',
          contact: student.contact || 'N/A',
          address: student.address || 'N/A',
          status: 'ACTIVE'
        }));
        setStudents(mappedData);
      }
    } catch (error) {
      console.error('Failed to fetch students', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOpenAddModal = () => {
    setFormData({
      name: '',
      rollNumber: `STU${Math.floor(100000 + Math.random() * 900000)}`,
      email: '',
      password: 'password123',
      department: 'Computer Science',
      year: '1',
      contact: '',
      address: ''
    });
    setErrorMessage('');
    setIsAddModalOpen(true);
  };

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage('');
    try {
      const res = await axios.post('/api/students', formData);
      setSuccessMessage('Student added successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      setIsAddModalOpen(false);
      fetchStudents();
    } catch (error) {
      console.error('Error creating student:', error);
      setErrorMessage(error.response?.data?.error || 'Failed to create student');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEditModal = (student) => {
    setSelectedStudent(student);
    setFormData({
      name: student.name,
      rollNumber: student.rollNumber,
      email: student.email,
      department: student.department,
      year: student.year.toString(),
      contact: student.contact !== 'N/A' ? student.contact : '',
      address: student.address !== 'N/A' ? student.address : ''
    });
    setErrorMessage('');
    setIsEditModalOpen(true);
  };

  const handleUpdateStudent = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage('');
    try {
      await axios.put(`/api/students/${selectedStudent.id}`, formData);
      setSuccessMessage('Student updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      setIsEditModalOpen(false);
      fetchStudents();
    } catch (error) {
      console.error('Error updating student:', error);
      setErrorMessage(error.response?.data?.error || 'Failed to update student');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenDeleteModal = (student) => {
    setSelectedStudent(student);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteStudent = async () => {
    setSubmitting(true);
    try {
      await axios.delete(`/api/students/${selectedStudent.id}`);
      setSuccessMessage('Student removed successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
      setIsDeleteModalOpen(false);
      fetchStudents();
    } catch (error) {
      console.error('Error deleting student:', error);
      setErrorMessage(error.response?.data?.error || 'Failed to delete student');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenViewModal = (student) => {
    setSelectedStudent(student);
    setIsViewModalOpen(true);
  };

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    student.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.department.toLowerCase().includes(searchQuery.toLowerCase())
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
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Students</h2>
          <p className="text-slate-500 mt-1">Manage university student directory and hostel records</p>
        </div>
        
        {user?.role !== 'STUDENT' && (
          <button 
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-5 py-2.5 rounded-xl font-semibold shadow-md shadow-indigo-500/20 transition-all duration-300 transform hover:-translate-y-0.5"
          >
            <Plus size={18} />
            <span>Add Student</span>
          </button>
        )}
      </div>

      {/* Toolbar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name, roll number, or department..." 
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
             <p className="mt-4 text-indigo-600 font-semibold">Loading records...</p>
          </div>
        )}
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 text-xs uppercase tracking-wider font-bold">
              <tr>
                <th className="px-6 py-4">Roll Number</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Room</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 && !loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-400">
                    No students matched your search criteria.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, idx) => (
                  <tr 
                    key={student.id + '-' + idx} 
                    className="hover:bg-slate-50/80 transition-colors duration-150 group"
                  >
                    <td className="px-6 py-4 font-mono text-indigo-600 font-semibold">{student.rollNumber}</td>
                    <td className="px-6 py-4 font-semibold text-slate-900">{student.name}</td>
                    <td className="px-6 py-4 text-slate-600">{student.email}</td>
                    <td className="px-6 py-4 text-slate-600">{student.department}</td>
                    <td className="px-6 py-4">
                      {student.room === 'Not assigned' ? (
                        <span className="text-slate-400 italic bg-slate-100 px-2 py-1 rounded text-xs">Unassigned</span>
                      ) : (
                        <span className="text-slate-800 font-semibold bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-xs">{student.room}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-600">{student.contact}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleOpenViewModal(student)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" 
                          title="View details"
                        >
                          <Eye size={18} />
                        </button>
                        {user?.role !== 'STUDENT' && (
                          <>
                            <button 
                              onClick={() => handleOpenEditModal(student)}
                              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                              title="Edit record"
                            >
                              <Pencil size={18} />
                            </button>
                            <button 
                              onClick={() => handleOpenDeleteModal(student)}
                              className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                              title="Delete record"
                            >
                              <Trash2 size={18} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- ADD STUDENT MODAL --- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
                <UserPlus className="text-indigo-600" size={22} />
                <span>Add New Student</span>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="p-6 space-y-4">
              {errorMessage && (
                <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl border border-red-200 flex items-center gap-2">
                  <AlertCircle size={18} className="shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Full Name *</label>
                  <input 
                    type="text" 
                    name="name" 
                    required 
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. John Doe"
                    className="w-full bg-slate-50 border border-slate-200 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Roll Number *</label>
                  <input 
                    type="text" 
                    name="rollNumber" 
                    required 
                    value={formData.rollNumber}
                    onChange={handleInputChange}
                    placeholder="e.g. STU2026001"
                    className="w-full bg-slate-50 border border-slate-200 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Email Address *</label>
                  <input 
                    type="email" 
                    name="email" 
                    required 
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="student@university.edu"
                    className="w-full bg-slate-50 border border-slate-200 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Password</label>
                  <input 
                    type="text" 
                    name="password" 
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="password123"
                    className="w-full bg-slate-50 border border-slate-200 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Department</label>
                  <input 
                    type="text" 
                    name="department" 
                    value={formData.department}
                    onChange={handleInputChange}
                    placeholder="e.g. Computer Science"
                    className="w-full bg-slate-50 border border-slate-200 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Academic Year</label>
                  <select 
                    name="year" 
                    value={formData.year}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Contact Phone</label>
                <input 
                  type="text" 
                  name="contact" 
                  value={formData.contact}
                  onChange={handleInputChange}
                  placeholder="e.g. +1 555-0199"
                  className="w-full bg-slate-50 border border-slate-200 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Home Address</label>
                <textarea 
                  name="address" 
                  rows="2"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Street address, city, state"
                  className="w-full bg-slate-50 border border-slate-200 text-sm rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                ></textarea>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm px-5 py-2 rounded-xl shadow-md shadow-indigo-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Add Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT STUDENT MODAL --- */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
                <Pencil className="text-blue-600" size={20} />
                <span>Edit Student Record</span>
              </div>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateStudent} className="p-6 space-y-4">
              {errorMessage && (
                <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl border border-red-200 flex items-center gap-2">
                  <AlertCircle size={18} className="shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Full Name</label>
                <input 
                  type="text" 
                  name="name" 
                  required 
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 border border-slate-200 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Department</label>
                  <input 
                    type="text" 
                    name="department" 
                    value={formData.department}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Academic Year</label>
                  <select 
                    name="year" 
                    value={formData.year}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Contact Phone</label>
                <input 
                  type="text" 
                  name="contact" 
                  value={formData.contact}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 border border-slate-200 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Address</label>
                <textarea 
                  name="address" 
                  rows="2"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 border border-slate-200 text-sm rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                ></textarea>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm px-5 py-2 rounded-xl shadow-md shadow-blue-500/20 transition-all disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- VIEW STUDENT MODAL --- */}
      {isViewModalOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <span className="text-slate-900 font-bold text-lg">Student Profile</span>
              <button 
                onClick={() => setIsViewModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
                <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center font-bold text-xl">
                  {selectedStudent.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900">{selectedStudent.name}</h3>
                  <p className="text-sm font-mono text-indigo-600 font-semibold">{selectedStudent.rollNumber}</p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Email:</span>
                  <span className="font-medium text-slate-800">{selectedStudent.email}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Department:</span>
                  <span className="font-medium text-slate-800">{selectedStudent.department}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Academic Year:</span>
                  <span className="font-medium text-slate-800">{selectedStudent.year} Year</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Allocated Room:</span>
                  <span className="font-semibold text-indigo-600">{selectedStudent.room}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Contact:</span>
                  <span className="font-medium text-slate-800">{selectedStudent.contact}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Address:</span>
                  <span className="font-medium text-slate-800 text-right">{selectedStudent.address}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button 
                  onClick={() => setIsViewModalOpen(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm px-5 py-2 rounded-xl transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- DELETE CONFIRMATION MODAL --- */}
      {isDeleteModalOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-slate-100 p-6 text-center animate-in fade-in zoom-in duration-200">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} />
            </div>
            <h3 className="font-bold text-slate-900 text-lg">Remove Student?</h3>
            <p className="text-sm text-slate-500 mt-2">
              Are you sure you want to delete <span className="font-semibold text-slate-800">{selectedStudent.name}</span> ({selectedStudent.rollNumber})? This action cannot be undone.
            </p>

            {errorMessage && (
              <p className="text-xs text-red-600 mt-2">{errorMessage}</p>
            )}

            <div className="mt-6 flex justify-center gap-3">
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteStudent}
                disabled={submitting}
                className="bg-red-600 hover:bg-red-500 text-white font-semibold text-sm px-5 py-2 rounded-xl shadow-md shadow-red-500/20 transition-all disabled:opacity-50"
              >
                {submitting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;

