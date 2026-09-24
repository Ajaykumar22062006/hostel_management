import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Home, CreditCard, MessageSquare, ShieldCheck, CheckCircle2, Clock, X, ArrowRight, AlertCircle, Check } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [studentFees, setStudentFees] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const endpoint = user?.role === 'STUDENT' ? '/api/dashboard/student' : '/api/dashboard/admin';
      const res = await axios.get(endpoint);
      setStats(res.data);
    } catch (error) {
      console.error('Error fetching dashboard stats', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPayModal = async () => {
    try {
      const res = await axios.get('/api/fees');
      const pending = res.data.filter(f => f.status === 'PENDING');
      setStudentFees(pending);
      setIsPaymentModalOpen(true);
    } catch (error) {
      console.error('Failed to fetch pending fees', error);
      navigate('/fees');
    }
  };

  const handlePayFee = async (feeId) => {
    setSubmitting(true);
    try {
      await axios.put(`/api/fees/${feeId}/pay`);
      setSuccessMessage('Payment processed successfully! Fee status updated to PAID.');
      setTimeout(() => setSuccessMessage(''), 3000);
      setIsPaymentModalOpen(false);
      fetchStats();
    } catch (error) {
      alert('Payment processing failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-indigo-600 font-semibold">Loading dashboard overview...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Toast Notification */}
      {successMessage && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-bounce">
          <Check size={20} />
          <span className="font-medium">{successMessage}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
          Welcome back, {user?.name || 'User'}!
        </h2>
        <p className="text-slate-500 mt-1">Here is your customized hostel overview and status</p>
      </div>

      {/* Stats Cards Grid */}
      {user?.role === 'STUDENT' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Current Room */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Current Room</span>
              <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold">
                <Home size={20} />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-extrabold text-slate-900">{stats?.room || 'Not Allocated'}</h3>
              <p className="text-xs text-slate-500 mt-1">Assigned Hostel Accommodation</p>
            </div>
          </div>

          {/* Pending Fees with Direct Pay Option */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pending Fees</span>
              <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center font-bold">
                <CreditCard size={20} />
              </div>
            </div>
            <div className="mt-3">
              <h3 className={`text-3xl font-extrabold ${stats?.pendingFees > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                ₹ {stats?.pendingFees ? stats.pendingFees.toLocaleString() : '0'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">Due Date: <span className="font-semibold text-slate-700">{stats?.upcomingDue || 'None'}</span></p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              {stats?.pendingFees > 0 ? (
                <button 
                  onClick={handleOpenPayModal}
                  className="w-full bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-semibold text-xs py-2.5 px-4 rounded-xl shadow-md shadow-rose-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <CreditCard size={16} />
                  <span>Pay Fees Now (₹{stats.pendingFees})</span>
                </button>
              ) : (
                <button 
                  onClick={() => navigate('/fees')}
                  className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs py-2 px-3 rounded-xl transition-colors flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  <span>All Dues Paid - View History</span>
                </button>
              )}
            </div>
          </div>

          {/* Active Complaints */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Complaints</span>
              <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center font-bold">
                <MessageSquare size={20} />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-extrabold text-slate-900">{stats?.activeComplaints || 0}</h3>
              <p className="text-xs text-slate-500 mt-1">Maintenance & Issue Tickets</p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100">
              <button 
                onClick={() => navigate('/complaints')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
              >
                <span>View & Raise Issues</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ADMIN STATS */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">Total Students</span>
            <h3 className="text-3xl font-extrabold text-indigo-600">{stats?.totalStudents || 0}</h3>
          </div>
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">Available Rooms</span>
            <h3 className="text-3xl font-extrabold text-emerald-600">{stats?.availableRooms || 0}</h3>
          </div>
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">Pending Complaints</span>
            <h3 className="text-3xl font-extrabold text-amber-600">{stats?.pendingComplaints || 0}</h3>
          </div>
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">Fee Collected</span>
            <h3 className="text-3xl font-extrabold text-slate-900">₹ {stats?.feeCollected ? stats.feeCollected.toLocaleString() : '0'}</h3>
          </div>
        </div>
      )}

      {/* --- PAYMENT MODAL FOR PENDING FEES --- */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
                <CreditCard className="text-rose-600" size={22} />
                <span>Process Fee Payment</span>
              </div>
              <button 
                onClick={() => setIsPaymentModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {studentFees.length === 0 ? (
                <div className="text-center py-6">
                  <CheckCircle2 size={40} className="text-emerald-500 mx-auto mb-2" />
                  <p className="font-semibold text-slate-800">No pending fee invoices found!</p>
                </div>
              ) : (
                studentFees.map(fee => (
                  <div key={fee.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                      <div>
                        <span className="text-xs uppercase font-bold text-slate-400 block">Term / Month</span>
                        <span className="font-bold text-slate-800 text-sm">{fee.month}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs uppercase font-bold text-slate-400 block">Amount Due</span>
                        <span className="font-extrabold text-rose-600 text-lg">₹ {fee.amount.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-500 flex justify-between">
                      <span>Due Date: <strong className="text-slate-700">{new Date(fee.dueDate).toLocaleDateString()}</strong></span>
                      <span className="text-amber-600 font-bold">Pending</span>
                    </div>

                    <button 
                      onClick={() => handlePayFee(fee.id)}
                      disabled={submitting}
                      className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm py-2.5 rounded-xl shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <CreditCard size={16} />
                      <span>{submitting ? 'Processing...' : `Pay ₹ ${fee.amount.toLocaleString()} Now`}</span>
                    </button>
                  </div>
                ))
              )}

              <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
                <button 
                  onClick={() => {
                    setIsPaymentModalOpen(false);
                    navigate('/fees');
                  }}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold transition-colors"
                >
                  View full fee history →
                </button>
                <button 
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs px-4 py-2 rounded-xl transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

