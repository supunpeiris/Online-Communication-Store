import { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated, token } = useAuth();
  const [wishlistItems, setWishlistItems] = useState([]);

  const getUserIdFromToken = () => {
    if (!token) return 1;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return parseInt(payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || payload.sub || 1);
    } catch {
      return 1;
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist();
    } else {
      const saved = localStorage.getItem('guest_wishlist');
      setWishlistItems(saved ? JSON.parse(saved) : []);
    }
  }, [isAuthenticated, token]);

  const fetchWishlist = async () => {
    try {
      const userId = getUserIdFromToken();
      const res = await api.get(`/wishlist/${userId}`);
      setWishlistItems(res.data.items || []);
    } catch (err) {
      console.error("Failed to load wishlist", err);
    }
  };

  const toggleWishlist = async (product) => {
    const productId = product.id || product.productId;
    if (isAuthenticated) {
      try {
        const userId = getUserIdFromToken();
        await api.post('/wishlist/items', { userId, productId });
        await fetchWishlist();
      } catch (err) {
        console.error("Failed to toggle wishlist", err);
      }
    } else {
      setWishlistItems(prev => {
        const exists = prev.some(item => item.productId === productId || item.id === productId);
        let updated;
        if (exists) {
          updated = prev.filter(item => item.productId !== productId && item.id !== productId);
        } else {
          updated = [...prev, { id: productId, productId, name: product.name, price: product.price, imageUrl: product.imageUrl, brand: product.brand }];
        }
        localStorage.setItem('guest_wishlist', JSON.stringify(updated));
        return updated;
      });
    }
  };

  const removeFromWishlist = async (wishlistItemId) => {
    if (isAuthenticated) {
      try {
        await api.delete(`/wishlist/items/${wishlistItemId}`);
        await fetchWishlist();
      } catch (err) {
        console.error("Failed to remove wishlist item", err);
      }
    } else {
      setWishlistItems(prev => {
        const updated = prev.filter(item => item.id !== wishlistItemId && item.productId !== wishlistItemId);
        localStorage.setItem('guest_wishlist', JSON.stringify(updated));
        return updated;
      });
    }
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item.productId === productId || item.id === productId);
  };

  const totalWishlistCount = wishlistItems.length;

  return (
    <WishlistContext.Provider value={{ wishlistItems, toggleWishlist, removeFromWishlist, isInWishlist, totalWishlistCount, getUserIdFromToken }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
