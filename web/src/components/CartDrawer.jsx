import { X, ShoppingCart, Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

export default function CartDrawer() {
  const { cart, removeFromCart, updateQuantity, totalPrice, isCartOpen, setIsCartOpen } = useCart();
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      ></div>

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Shopping Cart</h2>
            </div>
            <button 
              onClick={() => setIsCartOpen(false)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-20 flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300">
                  <ShoppingCart className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg">Your cart is empty</h3>
                <p className="text-gray-500 text-sm mt-1 max-w-xs">Looks like you haven't added anything to your cart yet.</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                  <div className="w-16 h-16 bg-white rounded-xl border border-gray-100 flex items-center justify-center p-2 shrink-0">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
                    ) : (
                      <ShoppingCart className="w-6 h-6 text-gray-300" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-900 text-sm truncate">{item.name}</h4>
                    <p className="text-blue-600 font-extrabold text-sm mt-0.5">Rs. {item.price.toFixed(2)}</p>
                    
                    <div className="flex items-center mt-2 border border-gray-200 rounded-lg w-max bg-white overflow-hidden">
                      <button 
                        onClick={() => updateQuantity(item.id, item.productId || item.id, item.quantity - 1)}
                        className="px-2.5 py-1 text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-3 text-xs font-bold text-gray-900">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.productId || item.id, item.quantity + 1)}
                        className="px-2.5 py-1 text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer Subtotal & Checkout */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-gray-100 bg-gray-50/50">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-500 font-medium text-sm">Subtotal</span>
                <span className="text-2xl font-black text-gray-900">Rs. {totalPrice.toFixed(2)}</span>
              </div>
              <button 
                onClick={() => { setIsCartOpen(false); navigate('/checkout'); }}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl transition-colors shadow-sm flex items-center justify-center group cursor-pointer"
              >
                Proceed to Checkout
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
