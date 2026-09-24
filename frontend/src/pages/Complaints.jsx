import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Search, Plus, Eye, CheckCircle2, Clock, AlertCircle, X, MessageSquare, Tag, FileText, Check } from 'lucide-react';

const Complaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRaiseModalOpen, setIsRaiseModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  const [newComplaint, setNewComplaint] = useState({ category: 'Maintenance', description: '' });
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/complaints');
      setComplaints(res.data);
    } catch (error) {
      console.error('Failed to fetch complaints', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenViewModal = (complaint) => {
    setSelectedComplaint(complaint);
    setIsViewModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage('');
    try {
      await axios.post('http://localhost:5000/api/complaints', newComplaint);
      setSuccessMessage('Complaint ticket submitted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      setIsRaiseModalOpen(false);
      fetchComplaints();
      setNewComplaint({ category: 'Maintenance', description: '' });
    } catch (error) {
      setErrorMessage(error.response?.data?.error || 'Failed to submit complaint');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    setSubmitting(true);
    try {
      await axios.put(`http://localhost:5000/api/complaints/${id}/status`, { status });
      setSuccessMessage(`Ticket #${id} status updated to ${status}!`);
      setTimeout(() => setSuccessMessage(''), 3000);
      if (selectedComplaint && selectedComplaint.id === id) {
        setSelectedComplaint(prev => ({ ...prev, status }));
      }
      fetchComplaints();
    } catch (error) {
      setErrorMessage('Failed to update status');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredComplaints = complaints.filter(c =>
    c.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.student?.name && c.student.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    `TKT-${c.id}`.toLowerCase().includes(searchQuery.toLowerCase())
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
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Complaints & Maintenance</h2>
          <p className="text-slate-500 mt-1">Track and resolve issues raised by university hostel residents</p>
        </div>
        
        {user?.role === 'STUDENT' && (
          <button 
            onClick={() => setIsRaiseModalOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-5 py-2.5 rounded-xl font-semibold shadow-md shadow-indigo-500/20 transition-all duration-300 transform hover:-translate-y-0.5"
          >
            <Plus size={18} />
            <span>Raise Issue</span>
          </button>
        )}
      </div>

      {/* Toolbar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by ticket ID, category, or description..." 
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
             <p className="mt-4 text-indigo-600 font-semibold">Loading tickets...</p>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 text-xs uppercase tracking-wider font-bold">
              <tr>
                <th className="px-6 py-4">Ticket ID</th>
                {user?.role !== 'STUDENT' && <th className="px-6 py-4">Student Details</th>}
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredComplaints.length === 0 && !loading ? (
                <tr>
                  <td colSpan={user?.role !== 'STUDENT' ? "6" : "5"} className="px-6 py-12 text-center text-slate-400">
                    No active complaint tickets found.
                  </td>
                </tr>
              ) : (
                filteredComplaints.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors duration-150">
                    <td className="px-6 py-4 font-mono font-bold text-indigo-600">#TKT-{c.id}</td>
                    {user?.role !== 'STUDENT' && (
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-900">{c.student?.name || 'Student'}</p>
                        <p className="text-xs text-slate-500 font-mono">
                          Room: {c.student?.allocations?.[0]?.room?.roomNumber || 'N/A'} (Roll: {c.student?.rollNumber || 'N/A'})
                        </p>
                      </td>
                    )}
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        <Tag size={12} />
                        <span>{c.category}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate text-slate-600" title={c.description}>
                      {c.description}
                    </td>
                    <td className="px-6 py-4">
                      {c.status === 'RESOLVED' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 size={12} /> RESOLVED
                        </span>
                      )}
                      {c.status === 'IN_PROGRESS' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock size={12} /> IN PROGRESS
                        </span>
                      )}
                      {c.status === 'OPEN' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                          <AlertCircle size={12} /> OPEN
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleOpenViewModal(c)}
                          className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                        >
                          <Eye size={14} />
                          <span>View</span>
                        </button>
                        {user?.role !== 'STUDENT' && (
                          <>
                            {c.status === 'OPEN' && (
                              <button 
                                onClick={() => handleStatusUpdate(c.id, 'IN_PROGRESS')}
                                className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-semibold rounded-lg transition-colors"
                              >
                                Start
                              </button>
                            )}
                            {c.status !== 'RESOLVED' && (
                              <button 
                                onClick={() => handleStatusUpdate(c.id, 'RESOLVED')}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
                              >
                                Resolve
                              </button>
                            )}
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

      {/* --- RAISE COMPLAINT MODAL --- */}
      {isRaiseModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
                <MessageSquare className="text-indigo-600" size={20} />
                <span>Raise a Complaint</span>
              </div>
              <button 
                onClick={() => setIsRaiseModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {errorMessage && (
                <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl border border-red-200 flex items-center gap-2">
                  <AlertCircle size={18} className="shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Issue Category *</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-200 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" 
                  value={newComplaint.category} 
                  onChange={e => setNewComplaint({...newComplaint, category: e.target.value})}
                >
                  <option value="Maintenance">Maintenance</option>
                  <option value="Electricity">Electricity</option>
                  <option value="Water">Water issue</option>
                  <option value="Cleaning">Cleaning / Hygiene</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Detailed Description *</label>
                <textarea 
                  className="w-full bg-slate-50 border border-slate-200 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" 
                  rows="4" 
                  required 
                  placeholder="Describe your maintenance or service request..."
                  value={newComplaint.description} 
                  onChange={e => setNewComplaint({...newComplaint, description: e.target.value})}
                ></textarea>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsRaiseModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm px-5 py-2 rounded-xl shadow-md shadow-indigo-500/20 transition-all disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Issue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- VIEW TICKET MODAL --- */}
      {isViewModalOpen && selectedComplaint && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-2">
                <FileText className="text-indigo-600" size={20} />
                <span className="font-mono font-bold text-slate-900 text-lg">Ticket Details (#TKT-{selectedComplaint.id})</span>
              </div>
              <button 
                onClick={() => setIsViewModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div>
                  <span className="text-xs uppercase font-bold text-slate-400 block">Category</span>
                  <span className="font-semibold text-slate-800 text-sm">{selectedComplaint.category}</span>
                </div>
                <div>
                  <span className="text-xs uppercase font-bold text-slate-400 block text-right">Status</span>
                  {selectedComplaint.status === 'RESOLVED' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      RESOLVED
                    </span>
                  )}
                  {selectedComplaint.status === 'IN_PROGRESS' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                      IN PROGRESS
                    </span>
                  )}
                  {selectedComplaint.status === 'OPEN' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                      OPEN
                    </span>
                  )}
                </div>
              </div>

              {selectedComplaint.student && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1 text-xs">
                  <span className="text-slate-400 font-bold uppercase block mb-1">Raised By</span>
                  <p className="font-bold text-slate-900 text-sm">{selectedComplaint.student.name}</p>
                  <p className="text-slate-600">Roll Number: <span className="font-mono text-indigo-600 font-semibold">{selectedComplaint.student.rollNumber}</span></p>
                  <p className="text-slate-600">Room: <span className="font-semibold">{selectedComplaint.student?.allocations?.[0]?.room?.roomNumber || 'Not assigned'}</span></p>
                </div>
              )}

              <div>
                <span className="text-xs font-bold uppercase text-slate-400 block mb-1">Issue Description</span>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-slate-800 text-sm leading-relaxed whitespace-pre-wrap">
                  {selectedComplaint.description}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                {user?.role !== 'STUDENT' ? (
                  <div className="flex gap-2">
                    {selectedComplaint.status === 'OPEN' && (
                      <button 
                        onClick={() => handleStatusUpdate(selectedComplaint.id, 'IN_PROGRESS')}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-white font-semibold text-xs rounded-xl shadow-sm transition-all"
                      >
                        Set In Progress
                      </button>
                    )}
                    {selectedComplaint.status !== 'RESOLVED' && (
                      <button 
                        onClick={() => handleStatusUpdate(selectedComplaint.id, 'RESOLVED')}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow-sm transition-all"
                      >
                        Mark Resolved
                      </button>
                    )}
                  </div>
                ) : <div />}

                <button 
                  onClick={() => setIsViewModalOpen(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs px-5 py-2 rounded-xl transition-colors"
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

export default Complaints;

