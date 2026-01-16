import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import LanguageToggle from '../LanguageToggle';
import { User, Briefcase, Phone, ArrowLeft, Heart } from 'lucide-react';

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #EFF6FF 0%, white 50%, #F0FDF4 100%)',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    width: '100%',
    padding: '1rem',
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
  main: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1.5rem',
  },
  content: {
    width: '100%',
    maxWidth: '28rem',
  },
  titleSection: {
    textAlign: 'center',
    marginBottom: '2rem',
  },
  title: {
    fontSize: '1.875rem',
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: '0.5rem',
  },
  subtitle: {
    fontSize: '1.125rem',
    color: '#4B5563',
  },
  roleCard: {
    cursor: 'pointer',
    marginBottom: '1rem',
  },
  roleCardContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  iconBox: {
    width: '4rem',
    height: '4rem',
    borderRadius: '1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#4B5563',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0.5rem 0',
    marginBottom: '1rem',
  },
  formTitle: {
    textAlign: 'center',
    marginBottom: '1.5rem',
  },
  formIcon: {
    width: '5rem',
    height: '5rem',
    borderRadius: '1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 1rem',
  },
  successMessage: {
    fontSize: '0.875rem',
    color: '#16A34A',
    backgroundColor: '#F0FDF4',
    padding: '0.75rem',
    borderRadius: '0.75rem',
    marginBottom: '1rem',
  },
  errorMessage: {
    fontSize: '0.875rem',
    color: '#DC2626',
    backgroundColor: '#FEF2F2',
    padding: '0.75rem',
    borderRadius: '0.75rem',
    marginBottom: '1rem',
  },
  footer: {
    padding: '1rem',
    textAlign: 'center',
    color: '#6B7280',
    fontSize: '0.875rem',
  },
  formGroup: {
    marginBottom: '1rem',
  },
};

const ChoiceGate = () => {
  const { t } = useLanguage();
  const { loginWithOtp, loginWithEmail } = useAuth();
  const navigate = useNavigate();
  
  const [step, setStep] = useState('choice');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = () => {
    if (phone.length >= 8) {
      setOtpSent(true);
      setError('');
    }
  };

  const handleSeniorLogin = async () => {
    setLoading(true);
    setError('');
    const result = await loginWithOtp(phone, otp);
    setLoading(false);
    
    if (result.success) {
      navigate('/schedule');
    } else {
      setError(t('login.invalidOtp'));
    }
  };

  const handleStaffLogin = async () => {
    setLoading(true);
    setError('');
    const result = await loginWithEmail(email, password);
    setLoading(false);
    
    if (result.success) {
      navigate('/admin');
    } else {
      setError(t('login.loginError'));
    }
  };

  const handleBack = () => {
    setStep('choice');
    setError('');
    setOtpSent(false);
    setOtp('');
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.logo}>
          <Heart style={{ width: '2rem', height: '2rem', color: '#3B82F6' }} />
          <span style={styles.logoText}>{t('app.title')}</span>
        </div>
        <LanguageToggle />
      </header>

      {/* Main Content */}
      <main style={styles.main}>
        <div style={styles.content}>
          {/* Choice Screen */}
          {step === 'choice' && (
            <div>
              <div style={styles.titleSection}>
                <h1 style={styles.title}>{t('login.welcome')}</h1>
                <p style={styles.subtitle}>{t('login.selectRole')}</p>
              </div>

              {/* Senior Button */}
              <Card style={styles.roleCard} onClick={() => setStep('senior')}>
                <div style={styles.roleCardContent}>
                  <div style={{ ...styles.iconBox, backgroundColor: '#DBEAFE' }}>
                    <User style={{ width: '2rem', height: '2rem', color: '#2563EB' }} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827' }}>
                      {t('login.seniorTitle')}
                    </h3>
                    <p style={{ color: '#4B5563' }}>{t('login.seniorDesc')}</p>
                  </div>
                </div>
              </Card>

              {/* Staff Button */}
              <Card style={styles.roleCard} onClick={() => setStep('staff')}>
                <div style={styles.roleCardContent}>
                  <div style={{ ...styles.iconBox, backgroundColor: '#DCFCE7' }}>
                    <Briefcase style={{ width: '2rem', height: '2rem', color: '#16A34A' }} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827' }}>
                      {t('login.staffTitle')}
                    </h3>
                    <p style={{ color: '#4B5563' }}>{t('login.staffDesc')}</p>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Senior Login */}
          {step === 'senior' && (
            <Card>
              <button style={styles.backButton} onClick={handleBack}>
                <ArrowLeft style={{ width: '1.25rem', height: '1.25rem' }} />
                {t('login.back')}
              </button>

              <div style={styles.formTitle}>
                <div style={{ ...styles.formIcon, backgroundColor: '#DBEAFE' }}>
                  <Phone style={{ width: '2.5rem', height: '2.5rem', color: '#2563EB' }} />
                </div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>
                  {t('login.seniorTitle')}
                </h2>
              </div>

              <div style={styles.formGroup}>
                <Input
                  label={t('login.phoneLabel')}
                  placeholder={t('login.phonePlaceholder')}
                  type="tel"
                  size="lg"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={otpSent}
                />
              </div>

              {!otpSent ? (
                <Button 
                  variant="primary" 
                  size="lg" 
                  style={{ width: '100%' }}
                  onClick={handleSendOtp}
                  disabled={phone.length < 8}
                >
                  {t('login.sendOtp')}
                </Button>
              ) : (
                <>
                  <p style={styles.successMessage}>{t('login.otpSent')}</p>
                  <div style={styles.formGroup}>
                    <Input
                      label={t('login.otpLabel')}
                      placeholder={t('login.otpPlaceholder')}
                      type="text"
                      size="lg"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                    />
                  </div>
                  {error && <p style={styles.errorMessage}>{error}</p>}
                  <Button 
                    variant="primary" 
                    size="lg" 
                    style={{ width: '100%' }}
                    onClick={handleSeniorLogin}
                    disabled={otp.length !== 6 || loading}
                  >
                    {loading ? t('common.loading') : t('login.verifyOtp')}
                  </Button>
                </>
              )}
            </Card>
          )}

          {/* Staff Login */}
          {step === 'staff' && (
            <Card>
              <button style={styles.backButton} onClick={handleBack}>
                <ArrowLeft style={{ width: '1.25rem', height: '1.25rem' }} />
                {t('login.back')}
              </button>

              <div style={styles.formTitle}>
                <div style={{ ...styles.formIcon, backgroundColor: '#DCFCE7' }}>
                  <Briefcase style={{ width: '2.5rem', height: '2.5rem', color: '#16A34A' }} />
                </div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>
                  {t('login.staffTitle')}
                </h2>
              </div>

              <div style={styles.formGroup}>
                <Input
                  label={t('login.emailLabel')}
                  placeholder={t('login.emailPlaceholder')}
                  type="email"
                  size="lg"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div style={styles.formGroup}>
                <Input
                  label={t('login.passwordLabel')}
                  placeholder={t('login.passwordPlaceholder')}
                  type="password"
                  size="lg"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {error && <p style={styles.errorMessage}>{error}</p>}

              <Button 
                variant="primary" 
                size="lg" 
                style={{ width: '100%', backgroundColor: '#22C55E' }}
                onClick={handleStaffLogin}
                disabled={!email || !password || loading}
              >
                {loading ? t('common.loading') : t('login.signIn')}
              </Button>
            </Card>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer style={styles.footer}>
        © 2026 MINDS Activity Hub
      </footer>
    </div>
  );
};

export default ChoiceGate;
