import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import {
  ShoppingCart,
  Check,
  AlertCircle,
  Loader2,
  LayoutGrid,
  Tag,
  Filter,
  Heart,
} from "lucide-react";
import api from "../../services/api";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";

export default function Home() {
  const [products, setProducts] = useState([]);
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const urlSearchQuery = searchParams.get("search") || "";
  const urlCategoryQuery = searchParams.get("category") || "all";

  const [selectedCategory, setSelectedCategory] = useState(urlCategoryQuery);

  useEffect(() => {
    setSelectedCategory(urlCategoryQuery);
  }, [urlCategoryQuery]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          api.get("/products"),
          api.get("/categories"),
        ]);
        setProducts(prodRes.data);
        setCategories(catRes.data);
      } catch (err) {
        console.error("Failed to fetch catalog data", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(urlSearchQuery.toLowerCase()) ||
      (p.brand &&
        p.brand.toLowerCase().includes(urlSearchQuery.toLowerCase())) ||
      (p.sku && p.sku.toLowerCase().includes(urlSearchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === "all" ||
      p.categoryId.toString() === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    if (urlSearchQuery) {
      navigate(`/?category=${categoryId}`);
    }
  };

  return (
    <div className="flex w-full min-h-[calc(100vh-[73px])] bg-gray-50">
      {/* Left Sidebar */}
      <aside className="hidden lg:block w-64 bg-white border-r border-gray-100 flex-shrink-0 sticky top-[73px] h-[calc(100vh-73px)] overflow-y-auto">
        <div className="p-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-2">
            Catalog
          </p>
          <nav className="space-y-1">
            <button
              onClick={() => handleCategorySelect("all")}
              className={`w-full flex items-center px-3 py-2.5 rounded-xl font-medium transition-colors ${
                selectedCategory === "all"
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <LayoutGrid
                className={`w-5 h-5 mr-3 ${selectedCategory === "all" ? "text-blue-500" : "text-gray-400"}`}
              />
              All Products
            </button>

            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategorySelect(category.id.toString())}
                className={`w-full flex items-center px-3 py-2.5 rounded-xl font-medium transition-colors ${
                  selectedCategory === category.id.toString()
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Tag
                  className={`w-5 h-5 mr-3 ${selectedCategory === category.id.toString() ? "text-blue-500" : "text-gray-400"}`}
                />
                {category.name}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        <div className="p-4 sm:p-6 lg:p-8 flex-1 pb-16">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 max-w-7xl mx-auto gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {urlSearchQuery
                  ? `Search Results for "${urlSearchQuery}"`
                  : selectedCategory !== "all"
                    ? `${categories.find((c) => c.id.toString() === selectedCategory)?.name || "Category"} Products`
                    : "Featured Products"}
              </h2>
            </div>

            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <div className="lg:hidden w-full sm:w-48 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Filter className="h-4 w-4 text-gray-400" />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => handleCategorySelect(e.target.value)}
                  className="block w-full pl-9 pr-8 py-2.5 border border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm shadow-sm appearance-none font-medium"
                >
                  <option value="all">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <span className="hidden sm:inline-flex text-sm font-medium text-gray-500 bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-sm">
                {filteredProducts.length} Items
              </span>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64 bg-white rounded-2xl border border-gray-100 shadow-sm max-w-7xl mx-auto">
              <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center max-w-7xl mx-auto">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                No products found
              </h3>
              <p className="text-gray-500 mt-1 max-w-sm text-sm">
                We couldn't find any products matching your current search or
                category filters.
              </p>
              <button
                onClick={() => {
                  navigate("/");
                  setSelectedCategory("all");
                }}
                className="mt-6 bg-blue-50 text-blue-600 font-semibold px-6 py-2 rounded-xl hover:bg-blue-100 transition-colors"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col group relative"
                >
                  {/* Top-Right Heart Wishlist Button */}
                  <button
                    onClick={() => toggleWishlist(product)}
                    className="absolute top-3 right-3 z-10 w-9 h-9 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Heart
                      className={`w-5 h-5 ${isInWishlist(product.id) ? "fill-red-500 text-red-500" : "text-gray-400 hover:text-gray-600"}`}
                    />
                  </button>

                  <Link
                    to={`/product/${product.id}`}
                    className="h-48 bg-gray-50 flex items-center justify-center p-4 relative group-hover:bg-blue-50/30 transition-colors cursor-pointer block"
                  >
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="text-gray-300">
                        <svg
                          className="w-20 h-20"
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
                      </div>
                    )}
                  </Link>

                  <div className="p-5 flex-grow flex flex-col">
                    <div className="mb-1 flex justify-between items-center">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                        {product.brand || "No Brand"}
                      </span>
                    </div>

                    <Link to={`/product/${product.id}`}>
                      <h3 className="font-bold text-gray-900 text-lg leading-tight mb-2 line-clamp-2 hover:text-blue-600 transition-colors cursor-pointer">
                        {product.name}
                      </h3>
                    </Link>

                    <div className="mt-auto pt-4 flex items-end justify-between">
                      <div>
                        <div className="flex items-center space-x-1 mb-1">
                          {product.stockQuantity > 0 ? (
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
                        <span className="font-extrabold text-xl text-blue-600">
                          Rs. {product.price.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Add to Cart Action */}
                  <div className="p-4 pt-0">
                    <button
                      onClick={() => addToCart(product, 1)}
                      disabled={product.stockQuantity <= 0}
                      className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center shadow-sm hover:shadow active:scale-[0.98] cursor-pointer"
                    >
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      ADD TO CART
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
