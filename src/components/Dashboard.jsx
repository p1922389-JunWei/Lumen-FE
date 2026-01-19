import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ScheduleSidebar from './ScheduleSidebar';
import { 
  UserPlus, Mail, Lock, User, Shield, Check, AlertCircle, Heart, 
  Plus, X, Users, Briefcase, Phone, Calendar
} from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const { user, getToken } = useAuth();
  const [staffList, setStaffList] = useState([]);
  const [volunteerList, setVolunteerList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // Form state for creating users
  const [userType, setUserType] = useState('staff');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: ''
  });
  const [formLoading, setFormLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Fetch staff and volunteers on mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = getToken();
      
      // Fetch staff
      const staffResponse = await fetch('http://localhost:3001/api/staff', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const staffData = await staffResponse.json();
      if (staffData.success) {
        setStaffList(staffData.data || []);
      }

      console.log()

      // Fetch volunteers
      const volunteerResponse = await fetch('http://localhost:3001/api/volunteers', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const volunteerData = await volunteerResponse.json();
      if (volunteerData.success) {
        setVolunteerList(volunteerData.data || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  // Only staff can access this page
  if (user?.role !== 'staff') {
    return (
      <div className="schedule-container">
        <ScheduleSidebar />
        <div className="dashboard-content">
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

  const handleOpenModal = () => {
    setShowModal(true);
    setUserType('staff');
    setFormData({ fullName: '', email: '', password: '' });
    setMessage({ type: '', text: '' });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setMessage({ type: '', text: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
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
        // Refresh the lists
        fetchUsers();
        // Close modal after a short delay
        setTimeout(() => {
          handleCloseModal();
        }, 1500);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to create user' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to create user. Please try again.' });
    } finally {
      setFormLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="schedule-container">
      <ScheduleSidebar />
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>
            <Users size={28} />
            Manage Users
          </h1>
          <p>Manage staff members and volunteers</p>
        </div>

        {loading ? (
          <div className="dashboard-loading">
            <p>Loading users...</p>
          </div>
        ) : (
          <div className="dashboard-tables">
            {/* Staff Table */}
            <div className="table-section">
              <div className="table-header">
                <h2>
                  <Briefcase size={20} />
                  Staff Members
                </h2>
                <span className="table-count">{staffList.length} members</span>
              </div>
              <div className="table-container">
                <table className="user-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Created Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staffList.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="empty-row">No staff members found</td>
                      </tr>
                    ) : (
                      staffList.map((staff, idx) => (
                        <tr key={staff.staffID || idx}>
                          <td>
                            <div className="user-cell">
                              <div className="user-avatar-small">{staff.fullName?.charAt(0) || 'S'}</div>
                              {staff.fullName}
                            </div>
                          </td>
                          <td>{staff.email || '-'}</td>
                          <td>{formatDate(staff.created_at)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Volunteers Table */}
            <div className="table-section">
              <div className="table-header">
                <h2>
                  <Heart size={20} />
                  Volunteers
                </h2>
                <span className="table-count">{volunteerList.length} volunteers</span>
              </div>
              <div className="table-container">
                <table className="user-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Created Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {volunteerList.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="empty-row">No volunteers found</td>
                      </tr>
                    ) : (
                      volunteerList.map((volunteer, idx) => (
                        <tr key={volunteer.volunteerID || idx}>
                          <td>
                            <div className="user-cell">
                              <div className="user-avatar-small volunteer">{volunteer.fullName?.charAt(0) || 'V'}</div>
                              {volunteer.fullName}
                            </div>
                          </td>
                          <td>{volunteer.email || '-'}</td>
                          <td>{volunteer.phoneNumber || '-'}</td>
                          <td>{formatDate(volunteer.created_at)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* FAB Button */}
        <button className="fab-button" onClick={handleOpenModal}>
          <Plus size={24} />
        </button>

        {/* Create User Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={handleCloseModal}>
            <div className="create-user-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>
                  <UserPlus size={22} />
                  Create User
                </h3>
                <button className="close-btn" onClick={handleCloseModal}>
                  <X size={20} />
                </button>
              </div>

              <p className="modal-subtitle">Add new staff members or volunteers to the system</p>

              {message.text && (
                <div className={`admin-message ${message.type}`}>
                  {message.type === 'success' ? <Check size={20} /> : <AlertCircle size={20} />}
                  {message.text}
                </div>
              )}

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

                <button type="submit" className="submit-btn" disabled={formLoading}>
                  <UserPlus size={18} />
                  {formLoading ? 'Creating...' : `Create ${userType === 'staff' ? 'Staff' : 'Volunteer'}`}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
