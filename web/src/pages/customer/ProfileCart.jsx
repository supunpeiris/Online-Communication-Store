import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';

export default function ProfileCart() {
  const { cart, removeFromCart, updateQuantity, totalPrice } = useCart();
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
      <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
        <ShoppingCart className="w-5 h-5 mr-3 text-blue-600" /> My Cart Items
      </h2>

      {cart.length === 0 ? (
        <div className="text-center py-20 flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300">
            <ShoppingCart className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-gray-900 text-lg">Your cart is empty</h3>
          <p className="text-gray-500 text-sm mt-1 mb-6 max-w-xs">Looks like you haven't added anything to your cart yet.</p>
          <button 
            onClick={() => navigate('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-sm cursor-pointer inline-flex items-center"
          >
            <ShoppingBag className="w-4 h-4 mr-2" /> Start Shopping
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="space-y-4">
            {cart.map(item => (
              <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-white rounded-xl border border-gray-100 flex items-center justify-center p-2 shrink-0">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
                    ) : (
                      <ShoppingCart className="w-6 h-6 text-gray-300" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-base">{item.name}</h4>
                    <p className="text-blue-600 font-extrabold text-sm mt-0.5">Rs. {item.price.toFixed(2)}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between w-full sm:w-auto gap-6">
                  <div className="flex items-center border border-gray-200 rounded-xl bg-white overflow-hidden shadow-sm">
                    <button 
                      onClick={() => updateQuantity(item.id, item.productId || item.id, item.quantity - 1)}
                      className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-4 text-sm font-bold text-gray-900">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.productId || item.id, item.quantity + 1)}
                      className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <span className="font-black text-gray-900 text-base w-24 text-right">
                    Rs. {(item.price * item.quantity).toFixed(2)}
                  </span>

                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Subtotal & Checkout Actions */}
          <div className="border-t border-gray-100 pt-6 mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <span className="text-gray-500 font-medium text-sm block">Subtotal Amount</span>
              <span className="text-3xl font-black text-gray-900">Rs. {totalPrice.toFixed(2)}</span>
            </div>
            
            <button 
              onClick={() => navigate('/checkout')}
              className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 px-8 rounded-xl transition-colors shadow-sm flex items-center justify-center group cursor-pointer"
            >
              Proceed to Checkout
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
