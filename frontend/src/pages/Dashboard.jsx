import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const endpoint = user.role === 'STUDENT' ? '/api/dashboard/student' : '/api/dashboard/admin';
      const res = await axios.get(`http://localhost:5000${endpoint}`);
      setStats(res.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard stats', error);
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading Dashboard...</div>;

  return (
    <div className="dashboard">
      <h1 className="page-title">Welcome back, {user.name || 'User'}!</h1>
      <p className="page-subtitle">Here is your customized overview.</p>

      {user.role === 'STUDENT' ? (
        <div className="stats-grid">
          <div className="stat-card card">
            <h3>Current Room</h3>
            <p className="stat-value">{stats.room}</p>
          </div>
          <div className="stat-card card">
            <h3>Pending Fees</h3>
            <p className="stat-value text-danger">Rs. {stats.pendingFees}</p>
            <span className="stat-sub">Due: {stats.upcomingDue}</span>
          </div>
          <div className="stat-card card">
            <h3>Active Complaints</h3>
            <p className="stat-value text-warning">{stats.activeComplaints}</p>
          </div>
        </div>
      ) : (
        <div className="stats-grid">
          <div className="stat-card card primary-bg">
            <h3>Total Students</h3>
            <p className="stat-value">{stats.totalStudents}</p>
          </div>
          <div className="stat-card card success-bg">
            <h3>Available Rooms</h3>
            <p className="stat-value">{stats.availableRooms}</p>
          </div>
          <div className="stat-card card warning-bg">
            <h3>Pending Complaints</h3>
            <p className="stat-value">{stats.pendingComplaints}</p>
          </div>
          <div className="stat-card card">
            <h3>Fee Collected</h3>
            <p className="stat-value">Rs. {stats.feeCollected}</p>
          </div>
        </div>
      )}

      {/* Quick Actions / Recent Activity layout placeholder */}
      <div className="dashboard-content">
        <div className="card full-width">
          <h3>Recent Updates</h3>
          <div className="empty-state">No recent updates to show.</div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
