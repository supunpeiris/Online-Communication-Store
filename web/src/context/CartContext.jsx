import { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated, token } = useAuth();
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Helper to extract UserId from JWT token payload
  const getUserIdFromToken = () => {
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return parseInt(payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || payload.sub || 1);
    } catch {
      return 1;
    }
  };

  // Fetch Cart from Backend Database on Load or Auth Change
  useEffect(() => {
    if (isAuthenticated) {
      fetchBackendCart();
    } else {
      // Fallback to local storage for guests
      const saved = localStorage.getItem('guest_cart');
      setCart(saved ? JSON.parse(saved) : []);
    }
  }, [isAuthenticated, token]);

  const fetchBackendCart = async () => {
    try {
      const userId = getUserIdFromToken();
      const res = await api.get(`/cart/${userId}`);
      setCart(res.data.items || []);
    } catch (err) {
      console.error("Failed to fetch database cart", err);
    }
  };

  const addToCart = async (product, quantity = 1) => {
    if (isAuthenticated) {
      try {
        const userId = getUserIdFromToken();
        await api.post('/cart/items', {
          userId,
          productId: product.id,
          quantity
        });
        await fetchBackendCart();
      } catch (err) {
        console.error("Failed to add item to database cart", err);
      }
    } else {
      // Guest local storage management
      setCart(prev => {
        const existing = prev.find(item => item.productId === product.id || item.id === product.id);
        let updated;
        if (existing) {
          updated = prev.map(item => (item.productId === product.id || item.id === product.id) ? { ...item, quantity: item.quantity + quantity } : item);
        } else {
          updated = [...prev, { id: product.id, productId: product.id, name: product.name, price: product.price, imageUrl: product.imageUrl, quantity }];
        }
        localStorage.setItem('guest_cart', JSON.stringify(updated));
        return updated;
      });
    }
    setIsCartOpen(true);
  };

  const removeFromCart = async (itemId) => {
    if (isAuthenticated) {
      try {
        await api.delete(`/cart/items/${itemId}`);
        await fetchBackendCart();
      } catch (err) {
        console.error("Failed to remove cart item", err);
      }
    } else {
      setCart(prev => {
        const updated = prev.filter(item => item.id !== itemId);
        localStorage.setItem('guest_cart', JSON.stringify(updated));
        return updated;
      });
    }
  };

  const updateQuantity = async (itemId, productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    if (isAuthenticated) {
      try {
        const userId = getUserIdFromToken();
        await api.post('/cart/items', { userId, productId, quantity });
        await fetchBackendCart();
      } catch (err) {
        console.error("Failed to update quantity", err);
      }
    } else {
      setCart(prev => {
        const updated = prev.map(item => item.id === itemId ? { ...item, quantity } : item);
        localStorage.setItem('guest_cart', JSON.stringify(updated));
        return updated;
      });
    }
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('guest_cart');
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart, 
      totalItems, 
      totalPrice, 
      isCartOpen, 
      setIsCartOpen, 
      getUserIdFromToken 
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
