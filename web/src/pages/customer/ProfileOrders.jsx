import { useState, useEffect } from 'react';
import { Package, Loader2, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function ProfileOrders() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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
    const fetchOrders = async () => {
      try {
        const userId = getUserIdFromToken();
        const res = await api.get(`/profile/${userId}/orders`);
        setOrders(res.data);
      } catch (err) {
        console.error("Failed to load user orders", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-50 text-green-700 border border-green-200/60';
      case 'cancelled':
        return 'bg-red-50 text-red-600 border border-red-200/60';
      case 'out for delivery':
        return 'bg-amber-50 text-amber-700 border border-amber-200/60';
      case 'parcel ready':
        return 'bg-indigo-50 text-indigo-700 border border-indigo-200/60';
      case 'processing':
      default:
        return 'bg-blue-50 text-blue-700 border border-blue-200/60';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 bg-white rounded-3xl border border-gray-100 shadow-sm">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
      <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
        <Package className="w-5 h-5 mr-3 text-blue-600" /> My Orders History
      </h2>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="font-bold text-gray-900 text-lg">No orders placed yet</h3>
          <p className="text-gray-500 text-sm mt-1">When you place orders, they will appear here.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map(order => (
            <Link 
              key={order.id} 
              to={`/profile/orders/${order.id}`}
              className="block border border-gray-100 rounded-2xl p-6 bg-gray-50/50 hover:bg-blue-50/20 hover:border-blue-200 transition-all duration-300 group cursor-pointer"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-gray-200 gap-2 mb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-gray-900 text-base group-hover:text-blue-600 transition-colors">{order.orderNumber}</span>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <span className="text-xs text-gray-500 block mt-0.5">{new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider ${getStatusBadgeClass(order.status)}`}>
                    {order.status}
                  </span>
                  <span className="font-black text-gray-900 text-lg">Rs. {order.total.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-3">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-3 truncate">
                      <span className="font-bold text-gray-400">x{item.quantity}</span>
                      <span className="font-medium text-gray-800 truncate">{item.name}</span>
                    </div>
                    <span className="font-bold text-gray-900">Rs. {item.subtotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
