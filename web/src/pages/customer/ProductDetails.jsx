import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, Check, AlertCircle, Loader2, Heart, ChevronRight, Truck, Star } from 'lucide-react';
import api from '../../services/api';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

export default function ProductDetails() {
  const { id } = useParams();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  const [reviewForm, setReviewForm] = useState({ rating: 0, review: '', name: '', email: '' });
  const [hoveredStar, setHoveredStar] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/${id}`);
        setProduct(response.data);
      } catch (err) {
        setError('Failed to load product details.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
    window.scrollTo(0, 0);
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-136px)] bg-gray-50">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-136px)] bg-gray-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-gray-100 max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-gray-500 mb-6">{error || "The product you are looking for does not exist."}</p>
          <Link to="/" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors">
            Return to Store
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      
      <div className="bg-white border-b border-gray-100 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center text-sm">
          <Link to="/" className="text-gray-500 hover:text-blue-600 transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />
          <Link to={`/?category=${product.categoryId}`} className="text-gray-500 hover:text-blue-600 transition-colors">
            {product.categoryName}
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />
          <span className="font-semibold text-gray-900 truncate">{product.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        <div className="flex flex-col lg:flex-row gap-8 mb-8">
          
          <div className="w-full lg:w-1/2 bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex items-center justify-center relative min-h-[400px]">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} className="max-w-full max-h-[500px] object-contain mix-blend-multiply" />
            ) : (
              <div className="text-gray-300 flex flex-col items-center">
                <svg className="w-32 h-32 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                <span className="text-sm font-medium">No image available</span>
              </div>
            )}
          </div>

          <div className="w-full lg:w-1/2 bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col">
            <h1 className="text-3xl font-black text-gray-900 mb-6 uppercase">{product.name}</h1>
            
            <div className="flex items-center space-x-2 text-sm text-gray-600 font-medium mb-6 mt-auto">
              <span>SKU:</span>
              <span className="text-gray-900">{product.sku}</span>
            </div>

            <div className="text-4xl font-black text-orange-500 mb-4 border-b border-gray-100 pb-6">
              Rs. {product.price.toFixed(2)}
            </div>

            <div className="flex items-center space-x-2 mb-8">
              {product.stockQuantity > 0 ? (
                <><Check className="w-5 h-5 text-green-500" /><span className="font-bold text-gray-900">{product.stockQuantity} in stock</span></>
              ) : (
                <><AlertCircle className="w-5 h-5 text-red-500" /><span className="font-bold text-red-600">Out of stock</span></>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden shrink-0">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-3 bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold transition-colors"
                >-</button>
                <input 
                  type="number" 
                  value={quantity} 
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 text-center font-bold text-gray-900 py-3 focus:outline-none"
                  min="1"
                  max={product.stockQuantity}
                />
                <button 
                  onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                  className="px-4 py-3 bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold transition-colors"
                >+</button>
              </div>
              
              <button 
                onClick={() => addToCart(product, quantity)}
                disabled={product.stockQuantity <= 0}
                className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-sm cursor-pointer"
              >
                ADD TO CART
              </button>
              
              <button 
                onClick={() => { addToCart(product, quantity); }}
                disabled={product.stockQuantity <= 0}
                className="flex-1 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-sm cursor-pointer"
              >
                BUY NOW
              </button>
            </div>

            {/* Wishlist Toggle Action */}
            <div className="flex items-center space-x-6 text-sm font-bold text-gray-700 border-b border-gray-100 pb-6 mb-6">
              <button 
                onClick={() => toggleWishlist(product)}
                className="flex items-center hover:text-blue-600 transition-colors group cursor-pointer"
              >
                <Heart className={`w-4 h-4 mr-2 ${isInWishlist(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-400 group-hover:text-red-500'}`} /> 
                {isInWishlist(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
              </button>
            </div>

            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
              <div className="flex items-start">
                <Truck className="w-6 h-6 text-blue-600 mt-1 mr-4 shrink-0" />
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Courier delivery</h4>
                  <p className="text-sm text-gray-600 mb-3">Our courier will deliver to the specified address within 3-5 Working days.</p>
                  <p className="text-xs font-bold text-gray-900 mb-3 uppercase tracking-wider">Charges may apply</p>
                  
                  <div className="flex items-center space-x-2 text-xs font-bold text-gray-500 uppercase tracking-wider mt-4">
                    <span>Payment Methods:</span>
                    <div className="flex space-x-1">
                      <span className="bg-blue-800 text-white px-2 py-0.5 rounded text-[10px]">VISA</span>
                      <span className="bg-orange-500 text-white px-2 py-0.5 rounded text-[10px]">MC</span>
                      <span className="bg-blue-400 text-white px-2 py-0.5 rounded text-[10px]">AMEX</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Description</h2>
          <div className="prose max-w-none text-gray-600 whitespace-pre-line">
            {product.description || "No description available for this product."}
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-8">Customer Reviews</h2>
          
          <div className="flex flex-col lg:flex-row gap-12">
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 mb-4">Reviews</h3>
              <p className="text-gray-500 text-sm">There are no reviews yet.</p>
            </div>

            <div className="flex-1 lg:max-w-xl">
              <h3 className="font-bold text-gray-900 mb-2">Be the first to review "{product.name}"</h3>
              <p className="text-sm text-gray-500 mb-6">Your email address will not be published. Required fields are marked *</p>
              
              <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); alert("Review submitted!"); }}>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Your rating <span className="text-red-500">*</span></label>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button 
                        key={star}
                        type="button"
                        onMouseEnter={() => setHoveredStar(star)}
                        onMouseLeave={() => setHoveredStar(0)}
                        onClick={() => setReviewForm({...reviewForm, rating: star})}
                        className="focus:outline-none cursor-pointer"
                      >
                        <Star 
                          className={`w-5 h-5 ${
                            (hoveredStar >= star || reviewForm.rating >= star) 
                              ? 'fill-orange-400 text-orange-400' 
                              : 'text-gray-300'
                          } transition-colors`} 
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Your review <span className="text-red-500">*</span></label>
                  <textarea 
                    required
                    rows="4" 
                    value={reviewForm.review}
                    onChange={(e) => setReviewForm({...reviewForm, review: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-gray-50 focus:bg-white transition-colors"
                  ></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Name <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      required
                      value={reviewForm.name}
                      onChange={(e) => setReviewForm({...reviewForm, name: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-gray-50 focus:bg-white transition-colors" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Email <span className="text-red-500">*</span></label>
                    <input 
                      type="email" 
                      required
                      value={reviewForm.email}
                      onChange={(e) => setReviewForm({...reviewForm, email: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-gray-50 focus:bg-white transition-colors" 
                    />
                  </div>
                </div>

                <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-xl transition-colors shadow-sm cursor-pointer">
                  SUBMIT
                </button>
              </form>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
