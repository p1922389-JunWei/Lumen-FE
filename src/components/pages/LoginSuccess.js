import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import LanguageToggle from '../LanguageToggle';
import { Heart, LogOut, CheckCircle, User, Mail, Phone } from 'lucide-react';

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #F0FDF4 0%, white 50%, #EFF6FF 100%)',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    backgroundColor: 'white',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    padding: '1rem',
  },
  headerContent: {
    maxWidth: '80rem',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  logoText: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    color: '#1F2937',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  main: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
  },
  successCard: {
    maxWidth: '28rem',
    width: '100%',
  },
  successIcon: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '1.5rem',
  },
  successTitle: {
    textAlign: 'center',
    color: '#16A34A',
    marginBottom: '0.5rem',
  },
  successMessage: {
    textAlign: 'center',
    color: '#4B5563',
    marginBottom: '1.5rem',
  },
  userInfo: {
    backgroundColor: '#F9FAFB',
    borderRadius: '1rem',
    padding: '1rem',
    marginBottom: '1.5rem',
  },
  infoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.5rem 0',
    borderBottom: '1px solid #E5E7EB',
  },
  infoRowLast: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.5rem 0',
  },
  label: {
    fontSize: '0.875rem',
    color: '#6B7280',
    width: '5rem',
  },
  value: {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#111827',
  },
  roleBadge: {
    display: 'inline-block',
    padding: '0.25rem 0.75rem',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
};

const getRoleBadgeStyle = (role) => {
  switch (role) {
    case 'staff':
      return { backgroundColor: '#DBEAFE', color: '#1D4ED8' };
    case 'volunteer':
      return { backgroundColor: '#FEF3C7', color: '#B45309' };
    case 'participant':
      return { backgroundColor: '#DCFCE7', color: '#15803D' };
    default:
      return { backgroundColor: '#F3F4F6', color: '#374151' };
  }
};

const LoginSuccess = () => {
  const { t } = useLanguage();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.logo}>
            <Heart style={{ width: '2rem', height: '2rem', color: '#22C55E' }} />
            <span style={styles.logoText}>{t('app.title')}</span>
          </div>
          <div style={styles.headerRight}>
            <LanguageToggle />
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut style={{ width: '1.25rem', height: '1.25rem' }} />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={styles.main}>
        <Card style={styles.successCard}>
          <CardContent style={{ padding: '2rem' }}>
            {/* Success Icon */}
            <div style={styles.successIcon}>
              <CheckCircle style={{ width: '4rem', height: '4rem', color: '#22C55E' }} />
            </div>

            {/* Success Message */}
            <h2 style={styles.successTitle}>
              🎉 Login Successful!
            </h2>
            <p style={styles.successMessage}>
              You have successfully logged in to MINDS Activity Hub.
            </p>

            {/* User Info */}
            <div style={styles.userInfo}>
              <div style={styles.infoRow}>
                <User style={{ width: '1.25rem', height: '1.25rem', color: '#22C55E' }} />
                <span style={styles.label}>Name:</span>
                <span style={styles.value}>{user?.name || user?.fullName || 'N/A'}</span>
              </div>
              
              {user?.email && (
                <div style={styles.infoRow}>
                  <Mail style={{ width: '1.25rem', height: '1.25rem', color: '#22C55E' }} />
                  <span style={styles.label}>Email:</span>
                  <span style={styles.value}>{user.email}</span>
                </div>
              )}
              
              {user?.phone && (
                <div style={styles.infoRow}>
                  <Phone style={{ width: '1.25rem', height: '1.25rem', color: '#22C55E' }} />
                  <span style={styles.label}>Phone:</span>
                  <span style={styles.value}>{user.phone}</span>
                </div>
              )}

              <div style={styles.infoRowLast}>
                <span style={{ ...styles.label, marginLeft: '2rem' }}>Role:</span>
                <span style={{ ...styles.roleBadge, ...getRoleBadgeStyle(user?.role) }}>
                  {user?.role || 'participant'}
                </span>
              </div>
            </div>

            {/* User ID for debugging */}
            <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#9CA3AF' }}>
              User ID: {user?.id || user?.userID || 'N/A'}
            </p>

            {/* Logout Button */}
            <Button 
              variant="outline" 
              size="lg" 
              style={{ width: '100%', marginTop: '1rem' }}
              onClick={handleLogout}
            >
              <LogOut style={{ width: '1.25rem', height: '1.25rem', marginRight: '0.5rem' }} />
              Logout
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default LoginSuccess;
