import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ShoppingCart,
  Check,
  AlertCircle,
  Loader2,
  Heart,
  ChevronRight,
  Truck,
  Star,
  Tag,
  Trash2,
  ShieldCheck,
  MessageSquare,
  AlertTriangle,
  X,
} from "lucide-react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import {
  isDiscountActive,
  calculateFinalPrice,
  formatDiscountBadgeText,
} from "../../utils/discount";

export default function ProductDetails() {
  const { id } = useParams();
  const { user, token } = useAuth();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);

  // Review Form States
  const [reviewForm, setReviewForm] = useState({ rating: 0, comment: "" });
  const [hoveredStar, setHoveredStar] = useState(0);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMsg, setReviewMsg] = useState({ type: "", text: "" });

  // Custom Delete Modal States
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [isDeletingReview, setIsDeletingReview] = useState(false);

  // Robust Admin check (supports token decoding and case insensitivity)
  const isAdmin = (() => {
    if (user?.role && String(user.role).toLowerCase() === "admin") return true;
    if (user?.Role && String(user.Role).toLowerCase() === "admin") return true;
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const role =
        payload[
          "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
        ] ||
        payload["role"] ||
        payload["Role"];
      return typeof role === "string" && role.toLowerCase() === "admin";
    } catch {
      return false;
    }
  })();

  const fetchReviews = async () => {
    try {
      setReviewsLoading(true);
      const res = await api.get(`/reviews/product/${id}`);
      setReviews(res.data);
    } catch (err) {
      console.error("Failed to load reviews", err);
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const [prodRes, discRes] = await Promise.all([
          api.get(`/products/${id}`),
          api.get("/discounts").catch(() => ({ data: [] })),
        ]);
        let prod = prodRes.data;
        if (prod) {
          if (!prod.discount && discRes.data?.length > 0) {
            const matchedDisc = discRes.data.find(
              (d) =>
                (prod.discountId && d.id === prod.discountId) ||
                (d.products && d.products.some((p) => p && p.id === prod.id)),
            );
            if (matchedDisc) {
              prod = {
                ...prod,
                discountId: matchedDisc.id,
                discount: matchedDisc,
              };
            }
          }
          setProduct(prod);
        }
      } catch (err) {
        setError("Failed to load product details.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
    fetchReviews();
    window.scrollTo(0, 0);
  }, [id]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setReviewMsg({ type: "error", text: "Please log in to leave a review." });
      return;
    }
    if (reviewForm.rating === 0) {
      setReviewMsg({ type: "error", text: "Please select a star rating." });
      return;
    }

    setSubmittingReview(true);
    setReviewMsg({ type: "", text: "" });

    try {
      await api.post("/reviews", {
        productId: parseInt(id),
        rating: reviewForm.rating,
        comment: reviewForm.comment,
      });

      setReviewMsg({
        type: "success",
        text: "Thank you! Your review has been published.",
      });
      setReviewForm({ rating: 0, comment: "" });
      fetchReviews();
    } catch (err) {
      setReviewMsg({
        type: "error",
        text: err.response?.data?.message || "Failed to submit review.",
      });
    } finally {
      setSubmittingReview(false);
    }
  };

  const openDeleteModal = (review) => {
    setReviewToDelete(review);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!reviewToDelete) return;

    setIsDeletingReview(true);
    try {
      await api.delete(`/reviews/${reviewToDelete.id}`);
      setShowDeleteModal(false);
      setReviewToDelete(null);
      fetchReviews();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete review.");
    } finally {
      setIsDeletingReview(false);
    }
  };

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
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Product Not Found
          </h2>
          <p className="text-gray-500 mb-6">
            {error || "The product you are looking for does not exist."}
          </p>
          <Link
            to="/"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors"
          >
            Return to Store
          </Link>
        </div>
      </div>
    );
  }

  const activeDiscount =
    product && isDiscountActive(product.discount) ? product.discount : null;
  const finalPrice = product ? calculateFinalPrice(product) : 0;

  const avgRating =
    reviews.length > 0
      ? (
          reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
        ).toFixed(1)
      : 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 relative">
      {/* Breadcrumb Navigation */}
      <div className="bg-white border-b border-gray-100 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center text-sm">
          <Link
            to="/"
            className="text-gray-500 hover:text-blue-600 transition-colors"
          >
            Home
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />
          <Link
            to={`/?category=${product.categoryId}`}
            className="text-gray-500 hover:text-blue-600 transition-colors"
          >
            {product.categoryName}
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />
          <span className="font-semibold text-gray-900 truncate">
            {product.name}
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="flex flex-col lg:flex-row gap-8 mb-8">
          {/* Product Image */}
          <div className="w-full lg:w-1/2 bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex items-center justify-center relative min-h-[400px]">
            {activeDiscount && (
              <span className="absolute top-4 left-4 z-10 bg-gradient-to-r from-red-600 to-rose-500 text-white text-xs font-black px-3.5 py-1.5 rounded-full uppercase tracking-wider shadow-md flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" />
                {formatDiscountBadgeText(activeDiscount)}
              </span>
            )}

            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="max-w-full max-h-[500px] object-contain mix-blend-multiply"
              />
            ) : (
              <div className="text-gray-300 flex flex-col items-center">
                <svg
                  className="w-32 h-32 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  ></path>
                </svg>
                <span className="text-sm font-medium">No image available</span>
              </div>
            )}
          </div>

          {/* Product Details Header */}
          <div className="w-full lg:w-1/2 bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col">
            <h1 className="text-3xl font-black text-gray-900 mb-2 uppercase">
              {product.name}
            </h1>

            <div className="flex items-center space-x-2 mb-4">
              <div className="flex text-amber-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${star <= Math.round(avgRating) ? "fill-amber-400 text-amber-400" : "text-gray-200"}`}
                  />
                ))}
              </div>
              <span className="text-sm font-bold text-gray-700">
                {avgRating > 0 ? avgRating : "No ratings"}
              </span>
              <span className="text-sm text-gray-400">
                ({reviews.length} reviews)
              </span>
            </div>

            <div className="flex items-center space-x-2 text-sm text-gray-600 font-medium mb-6">
              <span>SKU:</span>
              <span className="text-gray-900">{product.sku}</span>
            </div>

            <div className="mb-4 border-b border-gray-100 pb-6">
              <div className="flex items-baseline space-x-3">
                <div className="text-4xl font-black text-orange-500">
                  Rs. {finalPrice.toFixed(2)}
                </div>
                {activeDiscount && (
                  <div className="text-xl text-gray-400 line-through font-bold">
                    Rs. {product.price.toFixed(2)}
                  </div>
                )}
              </div>
              {activeDiscount && (
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="bg-red-50 text-red-600 border border-red-200 text-xs font-black px-2.5 py-1 rounded-lg">
                    SAVE Rs. {(product.price - finalPrice).toFixed(2)} (
                    {formatDiscountBadgeText(activeDiscount)})
                  </span>
                  {activeDiscount.title && (
                    <span className="text-xs text-gray-500 font-medium">
                      Special Offer: {activeDiscount.title}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2 mb-8">
              {product.stockQuantity > 0 ? (
                <>
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="font-bold text-gray-900">
                    {product.stockQuantity} in stock
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <span className="font-bold text-red-600">Out of stock</span>
                </>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden shrink-0">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-3 bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold transition-colors cursor-pointer"
                >
                  -
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                  }
                  className="w-16 text-center font-bold text-gray-900 py-3 focus:outline-none"
                  min="1"
                  max={product.stockQuantity}
                />
                <button
                  onClick={() =>
                    setQuantity(Math.min(product.stockQuantity, quantity + 1))
                  }
                  className="px-4 py-3 bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold transition-colors cursor-pointer"
                >
                  +
                </button>
              </div>

              <button
                onClick={() =>
                  addToCart({ ...product, price: finalPrice }, quantity)
                }
                disabled={product.stockQuantity <= 0}
                className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-sm cursor-pointer"
              >
                ADD TO CART
              </button>

              <button
                onClick={() =>
                  addToCart({ ...product, price: finalPrice }, quantity)
                }
                disabled={product.stockQuantity <= 0}
                className="flex-1 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-sm cursor-pointer"
              >
                BUY NOW
              </button>
            </div>

            <div className="flex items-center space-x-6 text-sm font-bold text-gray-700 border-b border-gray-100 pb-6 mb-6">
              <button
                onClick={() => toggleWishlist(product)}
                className="flex items-center hover:text-blue-600 transition-colors group cursor-pointer"
              >
                <Heart
                  className={`w-4 h-4 mr-2 ${isInWishlist(product.id) ? "fill-red-500 text-red-500" : "text-gray-400 group-hover:text-red-500"}`}
                />
                {isInWishlist(product.id)
                  ? "Remove from wishlist"
                  : "Add to wishlist"}
              </button>
            </div>

            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
              <div className="flex items-start">
                <Truck className="w-6 h-6 text-blue-600 mt-1 mr-4 shrink-0" />
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">
                    Courier delivery
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Our courier will deliver to the specified address within 3-5
                    Working days.
                  </p>
                  <p className="text-xs font-bold text-gray-900 mb-3 uppercase tracking-wider">
                    Charges may apply
                  </p>
                  <div className="flex items-center space-x-2 text-xs font-bold text-gray-500 uppercase tracking-wider mt-4">
                    <span>Payment Methods:</span>
                    <div className="flex space-x-1">
                      <span className="bg-blue-800 text-white px-2 py-0.5 rounded text-[10px]">
                        VISA
                      </span>
                      <span className="bg-orange-500 text-white px-2 py-0.5 rounded text-[10px]">
                        MC
                      </span>
                      <span className="bg-blue-400 text-white px-2 py-0.5 rounded text-[10px]">
                        AMEX
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Description */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Description</h2>
          <div className="prose max-w-none text-gray-600 whitespace-pre-line">
            {product.description ||
              "No description available for this product."}
          </div>
        </div>

        {/* Customer Reviews Section */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-8 flex items-center">
            <MessageSquare className="w-5 h-5 mr-3 text-blue-600" /> Customer
            Reviews & Ratings
          </h2>

          <div className="flex flex-col lg:flex-row gap-12">
            {/* Reviews Feed */}
            <div className="flex-1 space-y-6">
              <h3 className="font-bold text-gray-900 mb-4">
                Customer Feedback ({reviews.length})
              </h3>

              {reviewsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                </div>
              ) : reviews.length === 0 ? (
                <p className="text-gray-500 text-sm italic">
                  There are no reviews yet. Be the first to review this product!
                </p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-5 rounded-2xl bg-gray-50/70 border border-gray-100 relative group"
                    >
                      {/* Admin Delete Action */}
                      {isAdmin && (
                        <button
                          onClick={() => openDeleteModal(rev)}
                          className="absolute top-4 right-4 z-10 text-gray-400 hover:text-red-600 p-2 rounded-xl hover:bg-red-50 border border-transparent hover:border-red-100 transition-all cursor-pointer shadow-none hover:shadow-sm"
                          title="Delete review (Admin action)"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      )}

                      <div className="flex items-center space-x-3 mb-2 pr-10">
                        <div className="flex text-amber-400">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-4 h-4 ${s <= rev.rating ? "fill-amber-400 text-amber-400" : "text-gray-200"}`}
                            />
                          ))}
                        </div>
                        <span className="font-bold text-gray-900 text-sm">
                          {rev.userName}
                        </span>
                        {rev.verifiedPurchase && (
                          <span className="inline-flex items-center text-[11px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                            <ShieldCheck className="w-3 h-3 mr-1 text-green-600" />{" "}
                            Verified Purchase
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-gray-700 mb-2">
                        {rev.comment}
                      </p>
                      <span className="text-[11px] text-gray-400">
                        Reviewed on{" "}
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Review Form */}
            <div className="flex-1 lg:max-w-xl">
              <h3 className="font-bold text-gray-900 mb-2">Write a Review</h3>
              <p className="text-sm text-gray-500 mb-6">
                Share your thoughts with other customers.
              </p>

              {reviewMsg.text && (
                <div
                  className={`p-4 rounded-xl mb-6 text-sm font-medium ${reviewMsg.type === "error" ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"}`}
                >
                  {reviewMsg.text}
                </div>
              )}

              <form className="space-y-5" onSubmit={handleReviewSubmit}>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Your Rating <span className="text-red-500">*</span>
                  </label>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setHoveredStar(star)}
                        onMouseLeave={() => setHoveredStar(0)}
                        onClick={() =>
                          setReviewForm({ ...reviewForm, rating: star })
                        }
                        className="focus:outline-none cursor-pointer"
                      >
                        <Star
                          className={`w-6 h-6 ${hoveredStar >= star || reviewForm.rating >= star ? "fill-amber-400 text-amber-400" : "text-gray-300"} transition-colors`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Your Review <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows="4"
                    value={reviewForm.comment}
                    onChange={(e) =>
                      setReviewForm({ ...reviewForm, comment: e.target.value })
                    }
                    placeholder="What did you like or dislike about this product?"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-gray-50 focus:bg-white transition-colors text-sm"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-xl transition-colors shadow-sm cursor-pointer inline-flex items-center"
                >
                  {submittingReview ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  SUBMIT REVIEW
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl text-center border border-gray-100 animate-in fade-in zoom-in duration-200">
            <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Delete Review
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete this review by{" "}
              <strong className="text-gray-800">
                {reviewToDelete?.userName}
              </strong>
              ? This action will be recorded in the activity logs.
            </p>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeletingReview}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 rounded-xl cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeletingReview}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl shadow-sm cursor-pointer transition-colors flex items-center justify-center"
              >
                {isDeletingReview ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
