import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Search, CreditCard, Receipt, CheckCircle, Clock, X, Printer, Check } from 'lucide-react';

const Fees = () => {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFee, setSelectedFee] = useState(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchFees();
  }, []);

  const fetchFees = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/fees');
      setFees(res.data);
    } catch (error) {
      console.error('Failed to fetch fees', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async (feeId) => {
    try {
      await axios.put(`http://localhost:5000/api/fees/${feeId}/pay`);
      setSuccessMessage('Payment completed successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchFees();
    } catch (error) {
      alert('Payment processing failed');
    }
  };

  const handleOpenReceipt = (fee) => {
    setSelectedFee(fee);
    setIsReceiptModalOpen(true);
  };

  const filteredFees = fees.filter(fee =>
    fee.month.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (fee.student?.name && fee.student.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (fee.student?.rollNumber && fee.student.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()))
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
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Fee Management</h2>
          <p className="text-slate-500 mt-1">View hostel fee dues, receipts, and process online payments</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by student name or month..." 
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
             <p className="mt-4 text-indigo-600 font-semibold">Loading fee records...</p>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 text-xs uppercase tracking-wider font-bold">
              <tr>
                {user?.role !== 'STUDENT' && <th className="px-6 py-4">Student</th>}
                <th className="px-6 py-4">Amount (₹)</th>
                <th className="px-6 py-4">Month / Term</th>
                <th className="px-6 py-4">Due Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredFees.length === 0 && !loading ? (
                <tr>
                  <td colSpan={user?.role !== 'STUDENT' ? "6" : "5"} className="px-6 py-12 text-center text-slate-400">
                    No fee records found.
                  </td>
                </tr>
              ) : (
                filteredFees.map((fee) => (
                  <tr key={fee.id} className="hover:bg-slate-50/80 transition-colors duration-150">
                    {user?.role !== 'STUDENT' && (
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        {fee.student?.name} <span className="text-slate-400 font-mono text-xs font-normal">({fee.student?.rollNumber})</span>
                      </td>
                    )}
                    <td className="px-6 py-4 font-bold text-slate-900">₹ {fee.amount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-slate-600">{fee.month}</td>
                    <td className="px-6 py-4 text-slate-600">{new Date(fee.dueDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      {fee.status === 'PAID' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle size={12} /> PAID ({new Date(fee.paidDate).toLocaleDateString()})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock size={12} /> PENDING
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {fee.status === 'PENDING' ? (
                        <button 
                          onClick={() => handlePay(fee.id)}
                          className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5 ml-auto"
                        >
                          <CreditCard size={14} />
                          <span>Pay Now</span>
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleOpenReceipt(fee)}
                          className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ml-auto"
                        >
                          <Receipt size={14} />
                          <span>Receipt</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- FEE RECEIPT MODAL --- */}
      {isReceiptModalOpen && selectedFee && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Receipt className="text-emerald-600" size={20} />
                <span className="font-bold text-slate-900 text-lg">Fee Receipt</span>
              </div>
              <button 
                onClick={() => setIsReceiptModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="text-center border-b border-slate-100 pb-4">
                <span className="text-xs uppercase font-extrabold text-slate-400 tracking-wider">Payment Confirmed</span>
                <h3 className="text-3xl font-extrabold text-slate-900 mt-1">₹ {selectedFee.amount.toLocaleString()}</h3>
                <span className="inline-block mt-2 px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                  PAID ON {new Date(selectedFee.paidDate || Date.now()).toLocaleDateString()}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Receipt No:</span>
                  <span className="font-mono font-bold text-slate-800">#REC-2026-{selectedFee.id}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Term / Month:</span>
                  <span className="font-semibold text-slate-800">{selectedFee.month}</span>
                </div>
                {selectedFee.student && (
                  <>
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-500">Student Name:</span>
                      <span className="font-semibold text-slate-800">{selectedFee.student.name}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-500">Roll Number:</span>
                      <span className="font-mono text-indigo-600 font-semibold">{selectedFee.student.rollNumber}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Payment Status:</span>
                  <span className="font-bold text-emerald-600">COMPLETED</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-between gap-3">
                <button 
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
                >
                  <Printer size={14} />
                  <span>Print Receipt</span>
                </button>
                <button 
                  onClick={() => setIsReceiptModalOpen(false)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-5 py-2 rounded-xl shadow-sm transition-colors"
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

export default Fees;

