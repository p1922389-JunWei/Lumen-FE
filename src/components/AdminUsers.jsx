import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ScheduleSidebar from './ScheduleSidebar';
import { UserPlus, Mail, Lock, User, Shield, Check, AlertCircle, Heart } from 'lucide-react';
import './AdminUsers.css';

const AdminUsers = () => {
  const { user, getToken } = useAuth();
  const [userType, setUserType] = useState('staff');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Only staff can access this page
  if (user?.role !== 'staff') {
    return (
      <div className="schedule-container">
        <ScheduleSidebar />
        <div className="admin-users-content">
          <div className="access-denied">
            <AlertCircle size={48} />
            <h2>Access Denied</h2>
            <p>Only administrators can access this page.</p>
          </div>
        </div>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUserTypeChange = (type) => {
    setUserType(type);
    setFormData({
      fullName: '',
      email: '',
      password: ''
    });
    setMessage({ type: '', text: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const token = getToken();
      let endpoint = '';
      let body = {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password
      };

      if (userType === 'staff') {
        endpoint = 'http://localhost:3001/api/staff';
      } else {
        endpoint = 'http://localhost:3001/api/volunteers';
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: `${userType === 'staff' ? 'Staff' : 'Volunteer'} created successfully!` });
        setFormData({
          fullName: '',
          email: '',
          password: ''
        });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to create user' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to create user. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="schedule-container">
      <ScheduleSidebar />
      <div className="admin-users-content">
        <div className="admin-users-header">
          <h1>
            <UserPlus size={28} />
            Create User
          </h1>
          <p>Add new staff members or volunteers to the system</p>
        </div>

        {message.text && (
          <div className={`admin-message ${message.type}`}>
            {message.type === 'success' ? <Check size={20} /> : <AlertCircle size={20} />}
            {message.text}
          </div>
        )}

        <div className="admin-users-card">
          <div className="user-type-selector">
            <button
              className={`type-btn ${userType === 'staff' ? 'active' : ''}`}
              onClick={() => handleUserTypeChange('staff')}
            >
              <Shield size={20} />
              Staff
            </button>
            <button
              className={`type-btn ${userType === 'volunteer' ? 'active' : ''}`}
              onClick={() => handleUserTypeChange('volunteer')}
            >
              <Heart size={20} />
              Volunteer
            </button>
          </div>

          <form onSubmit={handleSubmit} className="create-user-form">
            <div className="form-group">
              <label>
                <User size={16} />
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Enter full name"
                required
              />
            </div>

            <div className="form-group">
              <label>
                <Mail size={16} />
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter email address"
                required
              />
            </div>

            <div className="form-group">
              <label>
                <Lock size={16} />
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter password"
                required
                minLength={6}
              />
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              <UserPlus size={18} />
              {loading ? 'Creating...' : `Create ${userType === 'staff' ? 'Staff' : 'Volunteer'}`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
