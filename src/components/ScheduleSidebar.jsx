import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Calendar, User, LogOut } from 'lucide-react';
import logo from '../logo.svg';
import './ScheduleSidebar.css';

const ScheduleSidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { icon: Calendar, label: 'Schedule', path: '/schedule' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <img src={logo} alt="LUMEN" className="logo-icon" style={{ width: 24, height: 24 }} />
        <h2>LUMEN</h2>
      </div>
      
      <nav className="sidebar-nav">
        {menuItems.map((item, idx) => {
          const IconComponent = item.icon;
          return (
            <Link 
              key={idx} 
              to={item.path}
              className="nav-item-link"
            >
              <div className="nav-item">
                <IconComponent size={20} className="nav-icon" />
                <span className="nav-label">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="user-avatar">{user?.fullName?.charAt(0) || 'U'}</div>
          <div className="user-info">
            <div className="user-name">{user?.fullName || 'User'}</div>
            <div className="user-email">{user?.email || ''}</div>
            <button className="logout-btn" onClick={handleLogout}>
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleSidebar;
