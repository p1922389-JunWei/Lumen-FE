import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Calendar, User, LogOut, Sun } from 'lucide-react';
import './ScheduleSidebar.css';

const ScheduleSidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { icon: Calendar, label: 'Schedule', path: '/' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <Sun size={24} className="logo-icon" />
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
          <div className="user-avatar">{user?.name?.charAt(0) || 'U'}</div>
          <div className="user-info">
            <div className="user-name">{user?.name || 'User'}</div>
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
