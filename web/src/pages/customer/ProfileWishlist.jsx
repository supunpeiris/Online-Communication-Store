import { Heart, ShoppingCart, Trash2, Check, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useWishlist } from "../../context/WishlistContext";
import { useCart } from "../../context/CartContext";
import {
  isDiscountActive,
  calculateFinalPrice,
  formatDiscountBadgeText,
} from "../../utils/discount";

export default function ProfileWishlist() {
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleMoveToCart = (item) => {
    const finalPrice = calculateFinalPrice(item);
    const productPayload = {
      ...item,
      id: item.productId || item.id,
      price: finalPrice,
    };
    addToCart(productPayload, 1);
    removeFromWishlist(item.id);
  };

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center">
          <Heart className="w-5 h-5 mr-3 text-red-500 fill-red-500" /> My
          Wishlist
        </h2>
        <span className="text-xs font-bold bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
          {wishlistItems.length} {wishlistItems.length === 1 ? "Item" : "Items"}
        </span>
      </div>

      {wishlistItems.length === 0 ? (
        <div className="text-center py-20 flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300">
            <Heart className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-gray-900 text-lg">
            Your wishlist is empty
          </h3>
          <p className="text-gray-500 text-sm mt-1 mb-6 max-w-xs">
            Save your favorite items by clicking the heart icon on any product
            in the store.
          </p>
          <Link
            to="/"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-sm inline-flex items-center"
          >
            Explore Store
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistItems.map((item) => {
            const finalPrice = calculateFinalPrice(item);
            const hasActiveDiscount =
              item.discount && isDiscountActive(item.discount);
            const inStock = item.stockQuantity > 0;

            return (
              <div
                key={item.id}
                className="bg-gray-50/50 rounded-2xl border border-gray-100 p-4 flex flex-col relative group hover:shadow-md transition-shadow"
              >
                {/* Top-Left Discount Badge */}
                {hasActiveDiscount && (
                  <span className="absolute top-3 left-3 z-10 bg-red-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                    {formatDiscountBadgeText(item.discount)}
                  </span>
                )}

                {/* Remove from Wishlist Button */}
                <button
                  onClick={() => removeFromWishlist(item.id)}
                  className="absolute top-3 right-3 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                  title="Remove from wishlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <Link
                  to={`/product/${item.productId || item.id}`}
                  className="h-40 bg-white rounded-xl flex items-center justify-center p-3 mb-4 border border-gray-100 group-hover:border-blue-100 transition-colors"
                >
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <Heart className="w-10 h-10 text-gray-300" />
                  )}
                </Link>

                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                  {item.brand || "No Brand"}
                </span>

                <Link to={`/product/${item.productId || item.id}`}>
                  <h4 className="font-bold text-gray-900 text-base mb-2 truncate hover:text-blue-600 transition-colors">
                    {item.name}
                  </h4>
                </Link>

                {/* Stock Status */}
                <div className="flex items-center space-x-1 mb-3">
                  {inStock ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-green-500" />
                      <span className="text-xs font-bold text-green-600">
                        In stock
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                      <span className="text-xs font-bold text-red-600">
                        Out of stock
                      </span>
                    </>
                  )}
                </div>

                {/* Price Display */}
                <div className="flex items-baseline space-x-2 mb-4">
                  <span className="text-blue-600 font-black text-xl">
                    Rs. {finalPrice.toFixed(2)}
                  </span>
                  {hasActiveDiscount && (
                    <span className="text-xs text-gray-400 line-through font-bold">
                      Rs. {item.price.toFixed(2)}
                    </span>
                  )}
                </div>

                {/* Move to Cart Button */}
                <button
                  onClick={() => handleMoveToCart(item)}
                  disabled={!inStock}
                  className="mt-auto w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-bold py-2.5 rounded-xl transition-colors flex items-center justify-center shadow-sm cursor-pointer text-sm active:scale-[0.98]"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  {inStock ? "MOVE TO CART" : "OUT OF STOCK"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
