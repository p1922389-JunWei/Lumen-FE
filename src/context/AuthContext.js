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
    // Check if user is logged in on mount
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const getToken = () => {
    return localStorage.getItem('token');
  };

  const login = async (email, password) => {
    try {
      const response = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Invalid credentials');
      }

      const data = await response.json();
      if (data.success && data.token) {
        setUser(data.data);
        localStorage.setItem('user', JSON.stringify(data.data));
        localStorage.setItem('token', data.token);
        return { success: true };
      }
      throw new Error('Login failed');
    } catch (error) {
      // Fallback for demo - accept demo credentials
      if (email === 'demo@example.com' && password === 'password') {
        const demoUser = { userID: 1, fullName: 'Marilyn Westervelt', NRIC: email, role: 'staff' };
        setUser(demoUser);
        localStorage.setItem('user', JSON.stringify(demoUser));
        localStorage.setItem('token', 'demo-token');
        return { success: true };
      }
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const updateUser = (updatedData) => {
    const newUser = { ...user, ...updatedData };
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const loginWithEmail = async (email, password) => {
    return await login(email, password);
  };

  // Step 1: Check or create participant account and send OTP
  const checkOrCreateParticipant = async (phoneNumber, fullName, birthdate) => {
    try {
      const response = await fetch('http://localhost:3001/api/participant/check-or-create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber, fullName, birthdate }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify credentials');
      }

      return { success: true, isNewUser: data.isNewUser, message: data.message };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Step 2: Verify OTP and complete login
  const loginWithOtp = async (phone, otp) => {
    try {
      const response = await fetch('http://localhost:3001/api/login-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, otp }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Invalid OTP');
      }

      if (data.success && data.token) {
        setUser(data.data);
        localStorage.setItem('user', JSON.stringify(data.data));
        localStorage.setItem('token', data.token);
        return { success: true };
      }
      throw new Error('Login failed');
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, loginWithEmail, checkOrCreateParticipant, loginWithOtp, loading, getToken, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};
