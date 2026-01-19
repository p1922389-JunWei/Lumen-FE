import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ScheduleSidebar from './ScheduleSidebar';
import { User, Mail, Phone, Calendar, Shield, Save, X } from 'lucide-react';
import './Profile.css';

// Timezone constant for Singapore (GMT+8)
const TIMEZONE = 'Asia/Singapore';

// Helper to format date as YYYY-MM-DD without timezone shift (for input)
const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  // Format in Singapore timezone
  const options = {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  };
  const parts = new Intl.DateTimeFormat('en-CA', options).formatToParts(date);
  const values = {};
  parts.forEach(part => {
    values[part.type] = part.value;
  });
  return `${values.year}-${values.month}-${values.day}`;
};

// Helper to format date as DD-MM-YYYY for display
const formatDateForDisplay = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    timeZone: TIMEZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const Profile = () => {
  const { user, getToken, updateUser } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedBirthdate, setEditedBirthdate] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    
      try {
      const response = await fetch('http://localhost:3001/api/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setProfileData(data.data);
        setEditedName(data.data.fullName || '');
        setEditedBirthdate(formatDateForInput(data.data.birthdate));
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    
    try {
      const response = await fetch(`http://localhost:3001/api/users/${profileData.userID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({
          fullName: editedName,
          birthdate: editedBirthdate || undefined,
          role: profileData.role,
          image_url: profileData.image_url
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setProfileData({ ...profileData, fullName: editedName, birthdate: editedBirthdate });
        updateUser({ fullName: editedName });
        setEditing(false);
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update profile' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedName(profileData?.fullName || '');
    setEditedBirthdate(formatDateForInput(profileData?.birthdate));
    setEditing(false);
  };

  if (loading) {
    return (
      <div className="schedule-container">
        <ScheduleSidebar />
        <div className="profile-content">
          <div className="profile-loading">Loading profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="schedule-container">
      <ScheduleSidebar />
      <div className="profile-content">
        <div className="profile-header">
          <h1>My Profile</h1>
        </div>

        {message.text && (
          <div className={`profile-message ${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="profile-card">
          <div className="profile-avatar-section">
            <div className="profile-avatar">
              {profileData?.fullName?.charAt(0) || 'U'}
            </div>
            <div className="profile-avatar-info">
              {editing ? (
                <input
                  type="text"
                  className="profile-name-input"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  placeholder="Enter your name"
                />
              ) : (
                <h2>{profileData?.fullName || 'User'}</h2>
              )}
              <span className="profile-role-badge">
                <Shield size={14} />
                {profileData?.role || 'user'}
              </span>
            </div>
          </div>

          <div className="profile-details">
            <div className="profile-detail-item">
              <User size={20} className="detail-icon" />
              <div className="detail-content">
                <label>Full Name</label>
                <span>{profileData?.fullName || '-'}</span>
              </div>
            </div>

            {profileData?.email && (
              <div className="profile-detail-item">
                <Mail size={20} className="detail-icon" />
                <div className="detail-content">
                  <label>Email</label>
                  <span>{profileData.email}</span>
                </div>
              </div>
            )}

            {profileData?.phoneNumber && (
              <div className="profile-detail-item">
                <Phone size={20} className="detail-icon" />
                <div className="detail-content">
                  <label>Phone Number</label>
                  <span>{profileData.phoneNumber}</span>
                </div>
              </div>
            )}

            {profileData?.role === 'participant' && (
              <div className="profile-detail-item">
                <Calendar size={20} className="detail-icon" />
                <div className="detail-content">
                  <label>Birthdate</label>
                  {editing ? (
                    <input
                      type="date"
                      className="profile-date-input"
                      value={editedBirthdate}
                      onChange={(e) => setEditedBirthdate(e.target.value)}
                    />
                  ) : (
                    <span>{formatDateForDisplay(profileData?.birthdate)}</span>
                  )}
                </div>
              </div>
            )}

            <div className="profile-detail-item">
              <Calendar size={20} className="detail-icon" />
              <div className="detail-content">
                <label>Member Since</label>
                <span>{profileData?.created_at ? new Date(profileData.created_at).toLocaleDateString() : '-'}</span>
              </div>
            </div>
          </div>

          <div className="profile-actions">
            {editing ? (
              <>
                <button className="profile-btn save-btn" onClick={handleSave} disabled={saving}>
                  <Save size={16} />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button className="profile-btn cancel-btn" onClick={handleCancel}>
                  <X size={16} />
                  Cancel
                </button>
              </>
            ) : (
              <button className="profile-btn edit-btn" onClick={() => setEditing(true)}>
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
