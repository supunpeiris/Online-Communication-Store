import { Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';

export default function ProfileWishlist() {
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
      <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
        <Heart className="w-5 h-5 mr-3 text-red-500" /> My Wishlist
      </h2>

      {wishlistItems.length === 0 ? (
        <div className="text-center py-20 flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300">
            <Heart className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-gray-900 text-lg">Your wishlist is empty</h3>
          <p className="text-gray-500 text-sm mt-1 mb-6 max-w-xs">Save your favorite items by clicking the heart icon on any product.</p>
          <Link 
            to="/" 
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-sm inline-flex items-center"
          >
            Explore Store
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistItems.map(item => (
            <div key={item.id} className="bg-gray-50/50 rounded-2xl border border-gray-100 p-4 flex flex-col relative group">
              <button 
                onClick={() => removeFromWishlist(item.id)}
                className="absolute top-3 right-3 z-10 p-2 bg-white rounded-full shadow-sm text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                title="Remove from wishlist"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <Link to={`/product/${item.productId || item.id}`} className="h-40 bg-white rounded-xl flex items-center justify-center p-3 mb-4 border border-gray-100">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} className="h-full object-contain mix-blend-multiply" />
                ) : (
                  <Heart className="w-10 h-10 text-gray-300" />
                )}
              </Link>

              <h4 className="font-bold text-gray-900 text-base mb-1 truncate">{item.name}</h4>
              <p className="text-blue-600 font-black text-lg mb-4">Rs. {item.price.toFixed(2)}</p>

              <button 
                onClick={() => addToCart(item, 1)}
                className="mt-auto w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-xl transition-colors flex items-center justify-center shadow-sm cursor-pointer text-sm"
              >
                <ShoppingCart className="w-4 h-4 mr-2" /> ADD TO CART
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
