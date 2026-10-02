import { useState, useEffect, useRef } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  ShoppingCart,
  User,
  Store,
  Search,
  RefreshCw,
  Heart,
  LogOut,
  LayoutDashboard,
  LogIn,
  UserPlus,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function CustomerLayout() {
  const { isAuthenticated, userRole, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const dropdownRef = useRef(null);

  // Read search query from URL directly
  const searchParams = new URLSearchParams(location.search);
  const currentSearchQuery = searchParams.get("search") || "";

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update URL instantly as the user types
  const handleSearchChange = (e) => {
    const val = e.target.value;
    const params = new URLSearchParams(location.search);
    if (val) {
      params.set("search", val);
    } else {
      params.delete("search");
    }
    navigate(`/?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navbar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-6">
          <Link to="/" className="flex items-center space-x-2 shrink-0">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-sm hover:scale-105 transition-transform">
              <Store className="w-6 h-6" />
            </div>
            <span className="font-bold text-2xl text-blue-600 tracking-tight">
              My<span className="text-gray-900">Shop</span>
            </span>
          </Link>

          {/* Central Search Bar (White Area) */}
          <div className="flex-1 max-w-2xl hidden md:block">
            <div className="relative">
              <input
                type="text"
                value={currentSearchQuery}
                onChange={handleSearchChange}
                placeholder="Search for products, brands, or SKUs..."
                className="w-full bg-gray-100 border-transparent text-gray-900 placeholder-gray-500 rounded-full py-2.5 pl-5 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                <Search className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Action Icons */}
          <div
            className="flex items-center space-x-3 shrink-0 relative"
            ref={dropdownRef}
          >
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200 hover:text-blue-600 transition-colors shadow-sm"
              >
                <User className="w-5 h-5" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                  {!isAuthenticated ? (
                    <>
                      <Link
                        to="/login"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 font-medium"
                      >
                        <LogIn className="w-4 h-4 mr-3" /> Sign In
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 font-medium"
                      >
                        <UserPlus className="w-4 h-4 mr-3" /> Sign Up
                      </Link>
                    </>
                  ) : (
                    <>
                      {userRole === "Admin" || userRole === "Staff" ? (
                        <Link
                          to="/admin"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 font-medium"
                        >
                          <LayoutDashboard className="w-4 h-4 mr-3" /> Dashboard
                        </Link>
                      ) : (
                        <div
                          className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 font-medium cursor-pointer"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <User className="w-4 h-4 mr-3" /> My Profile
                        </div>
                      )}
                      <div className="border-t border-gray-100 my-1"></div>
                      <button
                        onClick={() => {
                          logout();
                          setShowUserMenu(false);
                        }}
                        className="w-full flex items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 font-medium text-left"
                      >
                        <LogOut className="w-4 h-4 mr-3" /> Log Out
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            <button className="relative w-10 h-10 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200 hover:text-blue-600 transition-colors hidden sm:flex shadow-sm">
              <RefreshCw className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-blue-600 text-white w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center border border-white">
                0
              </span>
            </button>
            <button className="relative w-10 h-10 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200 hover:text-blue-600 transition-colors hidden sm:flex shadow-sm">
              <Heart className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-blue-600 text-white w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center border border-white">
                0
              </span>
            </button>

            <button className="flex items-center bg-gray-900 hover:bg-gray-800 text-white rounded-full px-4 py-2 transition-colors relative shadow-sm ml-2">
              <ShoppingCart className="w-5 h-5 sm:mr-2" />
              <span className="font-bold text-sm hidden sm:block">
                Rs. 0.00
              </span>
              <span className="absolute -top-1 -right-1 bg-red-500 text-white w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center border-2 border-white shadow-sm">
                0
              </span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        <Outlet />
      </main>

      <footer className="bg-white border-t border-gray-100 py-8 mt-auto text-center text-gray-400 text-sm font-medium">
        &copy; {new Date().getFullYear()} MyShop. All rights reserved.
      </footer>
    </div>
  );
}
