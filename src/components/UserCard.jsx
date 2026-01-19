import React from 'react';
import { Mail, Phone, Calendar, ChevronRight } from 'lucide-react';
import './UserCard.css';

const UserCard = ({ user, userType, onClick }) => {
  const getTypeColor = () => {
    switch (userType) {
      case 'staff': return '#4A90E2';
      case 'volunteer': return '#e91e63';
      case 'participant': return '#4caf50';
      default: return '#64748b';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="user-card" onClick={() => onClick(user, userType)}>
      <div className="user-card-left">
        <div 
          className="user-card-avatar"
          style={{ backgroundColor: getTypeColor() }}
        >
          {user.fullName?.charAt(0)?.toUpperCase() || 'U'}
        </div>
        <div className="user-card-info">
          <h4 className="user-card-name">{user.fullName || 'Unknown User'}</h4>
          <div className="user-card-meta">
            {user.email && (
              <span className="user-card-meta-item">
                <Mail size={14} />
                {user.email}
              </span>
            )}
            {user.phoneNumber && (
              <span className="user-card-meta-item">
                <Phone size={14} />
                {user.phoneNumber}
              </span>
            )}
          </div>
        </div>
      </div>
      
      <div className="user-card-right">
        <div className="user-card-date">
          <Calendar size={14} />
          <span>Joined {formatDate(user.created_at)}</span>
        </div>
        <div 
          className="user-card-type"
          style={{ backgroundColor: `${getTypeColor()}15`, color: getTypeColor() }}
        >
          {userType}
        </div>
        <ChevronRight size={20} className="user-card-arrow" />
      </div>
    </div>
  );
};

export default UserCard;
