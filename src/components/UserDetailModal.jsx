import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, User, Mail, Phone, Calendar, Shield, Edit2, Save, Trash2 } from 'lucide-react';
import './UserDetailModal.css';

const UserDetailModal = ({ userInfo, userType, onClose, onSuccess }) => {
  const { user, getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    birthdate: ''
  });

  useEffect(() => {
    if (userInfo) {
      setFormData({
        fullName: userInfo.fullName || '',
        email: userInfo.email || '',
        phoneNumber: userInfo.phoneNumber || '',
        birthdate: userInfo.birthdate ? new Date(userInfo.birthdate).toISOString().split('T')[0] : ''
      });
    }
  }, [userInfo]);

  // Only staff can access this modal
  if (!user || user.role !== 'staff') {
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setError(null);
    setLoading(true);

    try {
      const token = getToken();
      let endpoint = '';
      const userId = userInfo.userID;
      
      // Determine the correct endpoint based on user type
      if (userType === 'staff') {
        endpoint = `http://localhost:3001/api/staff/${userId}`;
      } else if (userType === 'volunteer') {
        endpoint = `http://localhost:3001/api/volunteers/${userId}`;
      } else if (userType === 'participant') {
        endpoint = `http://localhost:3001/api/participants/${userId}`;
      }

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          birthdate: formData.birthdate
        })
      });

      const data = await response.json();

      if (data.success) {
        setIsEditing(false);
        onSuccess?.('User updated successfully!');
        onClose();
      } else {
        setError(data.error || 'Failed to update user');
      }
    } catch (err) {
      setError('Failed to update user. Please try again.');
      console.error('Error updating user:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${userInfo.fullName}? This action cannot be undone.`)) {
      return;
    }

    setLoading(true);
    try {
      const token = getToken();
      let endpoint = '';
      const userId = userInfo.userID;
      
      if (userType === 'staff') {
        endpoint = `http://localhost:3001/api/staff/${userId}`;
      } else if (userType === 'volunteer') {
        endpoint = `http://localhost:3001/api/volunteers/${userId}`;
      } else if (userType === 'participant') {
        endpoint = `http://localhost:3001/api/participants/${userId}`;
      }

      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        onSuccess?.('User deleted successfully!');
        onClose();
      } else {
        setError(data.error || 'Failed to delete user');
      }
    } catch (err) {
      setError('Failed to delete user. Please try again.');
      console.error('Error deleting user:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getUserTypeColor = () => {
    switch (userType) {
      case 'staff': return '#4A90E2';
      case 'volunteer': return '#e91e63';
      case 'participant': return '#4caf50';
      default: return '#64748b';
    }
  };

  const getUserTypeLabel = () => {
    switch (userType) {
      case 'staff': return 'Staff Member';
      case 'volunteer': return 'Volunteer';
      case 'participant': return 'Participant';
      default: return 'User';
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content user-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>User Details</h3>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {error && (
            <div className="error-message">
              <p>{error}</p>
            </div>
          )}

          {/* User Avatar and Type Badge */}
          <div className="user-profile-section">
            <div 
              className="user-avatar-large"
              style={{ backgroundColor: getUserTypeColor() }}
            >
              {userInfo.fullName?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="user-type-badge" style={{ backgroundColor: getUserTypeColor() }}>
              <Shield size={14} />
              {getUserTypeLabel()}
            </div>
          </div>

          {/* User Details */}
          <div className="user-details-form">
            <div className="detail-group">
              <label>
                <User size={16} />
                Full Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter full name"
                />
              ) : (
                <p className="detail-value">{userInfo.fullName || '-'}</p>
              )}
            </div>

            <div className="detail-group">
              <label>
                <Mail size={16} />
                Email
              </label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email"
                />
              ) : (
                <p className="detail-value">{userInfo.email || '-'}</p>
              )}
            </div>

            {(userType === 'participant') && (
              <>
                <div className="detail-group">
                  <label>
                    <Phone size={16} />
                    Phone Number
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      placeholder="Enter phone number"
                    />
                  ) : (
                    <p className="detail-value">{userInfo.phoneNumber || '-'}</p>
                  )}
                </div>

                <div className="detail-group">
                  <label>
                    <Calendar size={16} />
                    Birthdate
                  </label>
                  {isEditing ? (
                    <input
                      type="date"
                      name="birthdate"
                      value={formData.birthdate}
                      onChange={handleChange}
                    />
                  ) : (
                    <p className="detail-value">{formatDate(userInfo.birthdate)}</p>
                  )}
                </div>
              </>
            )}

            <div className="detail-group">
              <label>
                <Calendar size={16} />
                Created At
              </label>
              <p className="detail-value">{formatDate(userInfo.created_at)}</p>
            </div>

            {/* User ID for reference */}
            <div className="detail-group">
              <label>User ID</label>
              <p className="detail-value text-muted">
                {userInfo.userID || userInfo.staffID || userInfo.volunteerID || userInfo.participantID || '-'}
              </p>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          {isEditing ? (
            <>
              <button 
                className="btn btn-cancel" 
                onClick={() => setIsEditing(false)}
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                className="btn btn-save" 
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="spinner"></span>
                    Saving...
                  </span>
                ) : (
                  <>
                    <Save size={16} />
                    Save Changes
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <button 
                className="btn btn-delete" 
                onClick={handleDelete}
                disabled={loading}
              >
                <Trash2 size={16} />
                Delete
              </button>
              <button 
                className="btn btn-edit" 
                onClick={() => setIsEditing(true)}
              >
                <Edit2 size={16} />
                Edit User
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDetailModal;
