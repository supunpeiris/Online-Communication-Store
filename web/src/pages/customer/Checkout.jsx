import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingCart, CheckCircle2, ChevronRight, ArrowLeft, Loader2, ShieldCheck, Truck } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function Checkout() {
  const { cart, totalPrice, clearCart, getUserIdFromToken } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    paymentMethod: 'Credit Card'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const userId = getUserIdFromToken() || 1;
      const orderPayload = {
        userId,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        postalCode: formData.postalCode,
        paymentMethod: formData.paymentMethod,
        items: cart.map(item => ({
          productId: item.productId || item.id,
          quantity: item.quantity,
          unitPrice: item.price
        }))
      };

      await api.post('/orders', orderPayload);
      setOrderCompleted(true);
      clearCart();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderCompleted) {
    return (
      <div className="min-h-[calc(100vh-73px)] bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 max-w-md text-center">
          <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10"/>
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">Order Placed Successfully!</h2>
          <p className="text-gray-500 text-sm mb-6">Your order has been securely saved to the database and is now processing.</p>
          <Link className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-colors block shadow-sm" to="/">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-[calc(100vh-73px)] bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 max-w-md text-center">
          <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-4"/>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Your Cart is Empty</h2>
          <p className="text-gray-500 text-sm mb-6">Add some products to your cart before proceeding.</p>
          <Link className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-colors inline-flex items-center" to="/">
            <ArrowLeft className="w-4 h-4 mr-2"/> Return to Store
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white border-b border-gray-100 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center text-sm">
          <Link className="text-gray-500 hover:text-blue-600 transition-colors" to="/">Home</Link>
          <ChevronRight className="w-4 h-4 text-gray-400 mx-2"/>
          <span className="font-semibold text-gray-900">Checkout</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <h1 className="text-3xl font-black text-gray-900 mb-8">Checkout</h1>

        {errorMsg && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 font-medium text-sm">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handlePlaceOrder} className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <Truck className="w-5 h-5 mr-3 text-blue-600"/> Shipping Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">First Name *</label>
                <input type="text" name="firstName" required value={formData.firstName} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Last Name *</label>
                <input type="text" name="lastName" required value={formData.lastName} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Email *</label>
                <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Phone *</label>
                <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white" />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-700 mb-2">Address *</label>
              <input type="text" name="address" required value={formData.address} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">City *</label>
                <input type="text" name="city" required value={formData.city} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Postal Code *</label>
                <input type="text" name="postalCode" required value={formData.postalCode} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white" />
              </div>
            </div>
          </div>

          <div className="w-full lg:w-96 shrink-0">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Order Summary</h2>

              <div className="space-y-4 max-h-72 overflow-y-auto mb-6 pr-2">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between items-center text-sm">
                    <div className="flex items-center space-x-3 truncate mr-4">
                      <span className="font-bold text-gray-400">x{item.quantity}</span>
                      <span className="text-gray-900 font-medium truncate">{item.name}</span>
                    </div>
                    <span className="font-bold text-gray-900 shrink-0">Rs. {(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-3 mb-6">
                <div className="flex justify-between text-lg font-black text-gray-900">
                  <span>Total</span>
                  <span className="text-orange-500">Rs. {totalPrice.toFixed(2)}</span>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white font-bold py-4 rounded-xl transition-colors shadow-sm flex items-center justify-center cursor-pointer"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin"/> : 'PLACE ORDER'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
