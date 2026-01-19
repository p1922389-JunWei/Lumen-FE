import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ScheduleSidebar from './ScheduleSidebar';
import UserCard from './UserCard';
import UserDetailModal from './UserDetailModal';
import Toast from './Toast';
import { 
  UserPlus, Mail, Lock, User, Shield, Check, AlertCircle, Heart, 
  Plus, X, Users, Briefcase, Phone, Calendar, Search, Filter
} from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const { user, getToken } = useAuth();
  const [staffList, setStaffList] = useState([]);
  const [volunteerList, setVolunteerList] = useState([]);
  const [participantList, setParticipantList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserType, setSelectedUserType] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [viewFilter, setViewFilter] = useState('all'); // 'all', 'staff', 'volunteer', 'participant'
  
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

      // print out all staffs
      console.log("All staffs:", staffData);
      // Or use JSON.stringify to see the full structure:
      // console.log("All staffs:", JSON.stringify(staffData, null, 2));

      // Fetch volunteers
      const volunteerResponse = await fetch('http://localhost:3001/api/volunteers', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const volunteerData = await volunteerResponse.json();
      if (volunteerData.success) {
        setVolunteerList(volunteerData.data || []);
      }

      // Fetch participants
      const participantResponse = await fetch('http://localhost:3001/api/participants', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const participantData = await participantResponse.json();
      if (participantData.success) {
        setParticipantList(participantData.data || []);
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

  const handleUserCardClick = (userInfo, type) => {
    setSelectedUser(userInfo);
    setSelectedUserType(type);
  };

  const handleCloseUserDetail = () => {
    setSelectedUser(null);
    setSelectedUserType(null);
  };

  const handleUserDetailSuccess = (message) => {
    setToast({ show: true, message, type: 'success' });
    fetchUsers();
  };

  // Filter and search logic
  const filterUsers = (users, type) => {
    return users.filter(u => {
      const matchesSearch = 
        u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.phoneNumber?.includes(searchTerm);
      return matchesSearch;
    });
  };

  const getFilteredLists = () => {
    const filteredStaff = filterUsers(staffList, 'staff');
    const filteredVolunteers = filterUsers(volunteerList, 'volunteer');
    const filteredParticipants = filterUsers(participantList, 'participant');

    if (viewFilter === 'all') {
      return { staff: filteredStaff, volunteers: filteredVolunteers, participants: filteredParticipants };
    } else if (viewFilter === 'staff') {
      return { staff: filteredStaff, volunteers: [], participants: [] };
    } else if (viewFilter === 'volunteer') {
      return { staff: [], volunteers: filteredVolunteers, participants: [] };
    } else if (viewFilter === 'participant') {
      return { staff: [], volunteers: [], participants: filteredParticipants };
    }
    return { staff: filteredStaff, volunteers: filteredVolunteers, participants: filteredParticipants };
  };

  const filteredLists = getFilteredLists();

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
          <>
            {/* Search and Filter Bar */}
            <div className="dashboard-toolbar">
              <div className="search-box">
                <Search size={18} />
                <input
                  type="text"
                  placeholder="Search by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button className="clear-search" onClick={() => setSearchTerm('')}>
                    <X size={16} />
                  </button>
                )}
              </div>
              <div className="filter-buttons">
                <button 
                  className={`filter-btn ${viewFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setViewFilter('all')}
                >
                  All
                </button>
                <button 
                  className={`filter-btn staff ${viewFilter === 'staff' ? 'active' : ''}`}
                  onClick={() => setViewFilter('staff')}
                >
                  <Shield size={14} />
                  Staff
                </button>
                <button 
                  className={`filter-btn volunteer ${viewFilter === 'volunteer' ? 'active' : ''}`}
                  onClick={() => setViewFilter('volunteer')}
                >
                  <Heart size={14} />
                  Volunteers
                </button>
                <button 
                  className={`filter-btn participant ${viewFilter === 'participant' ? 'active' : ''}`}
                  onClick={() => setViewFilter('participant')}
                >
                  <Users size={14} />
                  Participants
                </button>
              </div>
            </div>

            <div className="dashboard-cards-section">
              {/* Staff Cards */}
              {(viewFilter === 'all' || viewFilter === 'staff') && filteredLists.staff.length > 0 && (
                <div className="user-section">
                  <div className="section-header">
                    <h2>
                      <Briefcase size={20} />
                      Staff Members
                    </h2>
                    <span className="section-count">{filteredLists.staff.length}</span>
                  </div>
                  <div className="user-cards-list">
                    {filteredLists.staff.map((staff, idx) => (
                      <UserCard
                        key={staff.staffID || idx}
                        user={staff}
                        userType="staff"
                        onClick={handleUserCardClick}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Volunteer Cards */}
              {(viewFilter === 'all' || viewFilter === 'volunteer') && filteredLists.volunteers.length > 0 && (
                <div className="user-section">
                  <div className="section-header">
                    <h2>
                      <Heart size={20} />
                      Volunteers
                    </h2>
                    <span className="section-count volunteer">{filteredLists.volunteers.length}</span>
                  </div>
                  <div className="user-cards-list">
                    {filteredLists.volunteers.map((volunteer, idx) => (
                      <UserCard
                        key={volunteer.volunteerID || idx}
                        user={volunteer}
                        userType="volunteer"
                        onClick={handleUserCardClick}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Participant Cards */}
              {(viewFilter === 'all' || viewFilter === 'participant') && filteredLists.participants.length > 0 && (
                <div className="user-section">
                  <div className="section-header">
                    <h2>
                      <Users size={20} />
                      Participants
                    </h2>
                    <span className="section-count participant">{filteredLists.participants.length}</span>
                  </div>
                  <div className="user-cards-list">
                    {filteredLists.participants.map((participant, idx) => (
                      <UserCard
                        key={participant.participantID || idx}
                        user={participant}
                        userType="participant"
                        onClick={handleUserCardClick}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {filteredLists.staff.length === 0 && 
               filteredLists.volunteers.length === 0 && 
               filteredLists.participants.length === 0 && (
                <div className="empty-state">
                  <Users size={48} />
                  <h3>No users found</h3>
                  <p>
                    {searchTerm 
                      ? `No users match "${searchTerm}"`
                      : 'No users in this category yet'}
                  </p>
                </div>
              )}
            </div>
          </>
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

        {/* User Detail Modal */}
        {selectedUser && (
          <UserDetailModal
            userInfo={selectedUser}
            userType={selectedUserType}
            onClose={handleCloseUserDetail}
            onSuccess={handleUserDetailSuccess}
          />
        )}

        {/* Toast Notifications */}
        {toast.show && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast({ show: false, message: '', type: '' })}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
