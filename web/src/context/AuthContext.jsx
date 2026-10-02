import { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AuthContext = createContext(null);

// Helper to decode Base64 JWT and extract the role
const getRoleFromToken = (token) => {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    // .NET stores the role under this specific claim URL
    return payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || payload.role;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [userRole, setUserRole] = useState(getRoleFromToken(localStorage.getItem('token')));
  const navigate = useNavigate();

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const jwt = response.data.token;
    
    setToken(jwt);
    setUserRole(getRoleFromToken(jwt)); // Set role on login
    localStorage.setItem('token', jwt);
    navigate('/admin');
  };

  const logout = () => {
    setToken(null);
    setUserRole(null);
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ token, userRole, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
