import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './ScheduleSidebar.css';

const ScheduleSidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { icon: '📅', label: 'Schedule', path: '/' },
    { icon: '👥', label: 'Patients', path: '/patients' },
    { icon: '📋', label: 'Programs', path: '/programs' },
    { icon: '📊', label: 'Reports', path: '/reports' },
    { icon: '🧪', label: 'Laboratory', path: '/laboratory' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <h2>LUMEN</h2>
      </div>
      
      <nav className="sidebar-nav">
        {menuItems.map((item, idx) => (
          <Link 
            key={idx} 
            to={item.path}
            className="nav-item-link"
          >
            <div className="nav-item">
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </div>
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="user-avatar">{user?.name?.charAt(0) || 'U'}</div>
          <div className="user-info">
            <div className="user-name">{user?.name || 'User'}</div>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleSidebar;
