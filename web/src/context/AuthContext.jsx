import { createContext, useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';

const AuthContext = createContext(null);

// Helper to decode JWT, extract role, and check expiration
const validateToken = (token) => {
  if (!token) return { isValid: false, role: null };
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    
    // Check if token is expired (payload.exp is in seconds, Date.now() is in ms)
    if (payload.exp * 1000 < Date.now()) {
      return { isValid: false, role: null };
    }
    
    // Extract role using the standard .NET Claim Type URL
    const role = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || payload.role;
    return { isValid: true, role };
  } catch {
    return { isValid: false, role: null };
  }
};

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize token state. If expired, automatically clear it out.
  const [token, setToken] = useState(() => {
    const savedToken = localStorage.getItem('token');
    const { isValid } = validateToken(savedToken);
    
    if (!isValid && savedToken) {
      localStorage.removeItem('token');
    }
    
    return isValid ? savedToken : null;
  });

  const [userRole, setUserRole] = useState(() => {
    const savedToken = localStorage.getItem('token');
    const { isValid, role } = validateToken(savedToken);
    return isValid ? role : null;
  });

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const jwt = response.data.token;
    const { role } = validateToken(jwt);
    
    setToken(jwt);
    setUserRole(role);
    localStorage.setItem('token', jwt);
    
    // Redirect logic based on Role
    if (role === 'Admin' || role === 'Staff') {
      navigate('/admin');
    } else {
      navigate('/');
    }
  };

  const logout = () => {
    setToken(null);
    setUserRole(null);
    localStorage.removeItem('token');
    
    // Better UX: If an admin logs out, send them to login. 
    // If a customer logs out, keep them on the storefront.
    if (location.pathname.startsWith('/admin')) {
      navigate('/login');
    } else {
      navigate('/');
    }
  };

  return (
    <AuthContext.Provider value={{ token, userRole, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
