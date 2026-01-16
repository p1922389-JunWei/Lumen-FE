import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem('minds_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Senior login with OTP (simulated)
  const loginWithOtp = async (phone, otp) => {
    // Simulated OTP verification - in production, call backend
    if (otp === '123456') {
      const userData = {
        id: `senior_${phone}`,
        phone,
        role: 'participant',
        name: `Participant ${phone.slice(-4)}`,
      };
      setUser(userData);
      localStorage.setItem('minds_user', JSON.stringify(userData));
      return { success: true };
    }
    return { success: false, error: 'Invalid OTP' };
  };

  // Staff login with email/password
  const loginWithEmail = async (email, password) => {
    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.user) {
        const userData = {
          ...data.user,
          role: 'staff',
        };
        setUser(userData);
        localStorage.setItem('minds_user', JSON.stringify(userData));
        return { success: true };
      }
      return { success: false, error: data.message || 'Login failed' };
    } catch (error) {
      // For demo purposes, allow mock login
      if (email && password) {
        const userData = {
          id: `staff_${Date.now()}`,
          email,
          role: 'staff',
          name: email.split('@')[0],
        };
        setUser(userData);
        localStorage.setItem('minds_user', JSON.stringify(userData));
        return { success: true };
      }
      return { success: false, error: 'Connection failed' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('minds_user');
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAuthenticated: !!user,
      isStaff: user?.role === 'staff',
      isParticipant: user?.role === 'participant',
      loginWithOtp,
      loginWithEmail,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
