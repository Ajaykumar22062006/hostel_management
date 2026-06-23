import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css'; // Reusing login styles

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    rollNumber: '',
    department: '',
    year: '',
    contact: '',
    address: ''
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Register the user
      await register(formData);
      
      // Auto-login after successful registration
      await login(formData.email, formData.password);
      
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to register. Please check your information.');
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card card" style={{ maxWidth: '500px' }}>
        <div className="login-header">
          <h2>University Hostel System</h2>
          <p>Create a Student Account</p>
        </div>
        
        {error && <div className="login-error">{error}</div>}
        
        <form onSubmit={handleSubmit} className="login-form">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input 
                type="text" 
                name="name"
                className="form-control" 
                value={formData.name} 
                onChange={handleChange} 
                required 
                placeholder="John Doe"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Roll Number</label>
              <input 
                type="text" 
                name="rollNumber"
                className="form-control" 
                value={formData.rollNumber} 
                onChange={handleChange} 
                required 
                placeholder="CS2023001"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input 
                type="email" 
                name="email"
                className="form-control" 
                value={formData.email} 
                onChange={handleChange} 
                required 
                placeholder="email@university.edu"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input 
                type="password" 
                name="password"
                className="form-control" 
                value={formData.password} 
                onChange={handleChange} 
                required 
                placeholder="••••••••"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Department</label>
              <input 
                type="text" 
                name="department"
                className="form-control" 
                value={formData.department} 
                onChange={handleChange} 
                required 
                placeholder="Computer Science"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Year of Study</label>
              <input 
                type="number" 
                name="year"
                className="form-control" 
                value={formData.year} 
                onChange={handleChange} 
                min="1" max="5"
                required 
                placeholder="1"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Contact Number</label>
            <input 
              type="tel" 
              name="contact"
              className="form-control" 
              value={formData.contact} 
              onChange={handleChange} 
              required 
              placeholder="+1 234 567 8900"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Home Address</label>
            <textarea 
              name="address"
              className="form-control" 
              value={formData.address} 
              onChange={handleChange} 
              required 
              placeholder="123 Main St, City, Country"
              style={{ minHeight: '60px', resize: 'vertical' }}
            />
          </div>

          <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
          
          <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.95rem', color: 'var(--text-light)' }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>Sign In here</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
