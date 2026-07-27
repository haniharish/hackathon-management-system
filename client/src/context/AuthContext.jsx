import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext();

const normalizeUser = (user) => {
  if (!user) return null;
  const id = user.id || user._id;
  return { ...user, id, _id: id };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('hackverse-token');
    if (!token) {
      setLoading(false);
      return;
    }

    authApi.me()
      .then((response) => setUser(normalizeUser(response.data.user)))
      .catch(() => localStorage.removeItem('hackverse-token'))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const { data } = await authApi.login(email, password);
    localStorage.setItem('hackverse-token', data.token);
    const nextUser = normalizeUser(data.user);
    setUser(nextUser);
    return data;
  };

  const signup = async (name, email, password, role) => {
    const { data } = await authApi.register({ name, email, password, role });
    localStorage.setItem('hackverse-token', data.token);
    const nextUser = normalizeUser(data.user);
    setUser(nextUser);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('hackverse-token');
    setUser(null);
  };

  const refreshUser = async () => {
    const { data } = await authApi.me();
    setUser(normalizeUser(data.user));
  };

  const value = useMemo(
    () => ({ user, loading, login, signup, logout, refreshUser }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
