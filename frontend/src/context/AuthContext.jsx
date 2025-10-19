import { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const data = await api.getCurrentUser();
        setUser(data.user);
        setSubscription(data.subscription);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      api.logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const data = await api.login(email, password);
    setUser(data.user);
    await checkAuth();
    return data;
  };

  const register = async (email, password, name) => {
    const data = await api.register(email, password, name);
    setUser(data.user);
    await checkAuth();
    return data;
  };

  const logout = () => {
    api.logout();
    setUser(null);
    setSubscription(null);
  };

  const refreshSubscription = async () => {
    try {
      const data = await api.getCurrentSubscription();
      setSubscription(data.subscription);
    } catch (error) {
      console.error('Failed to refresh subscription:', error);
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        subscription, 
        loading, 
        login, 
        register, 
        logout,
        refreshSubscription,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
