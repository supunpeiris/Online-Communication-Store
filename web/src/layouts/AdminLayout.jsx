import { useState, useRef, useEffect } from "react";
import { Outlet, Link, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BarChart2,
  Users,
  Layout,
  Search,
  Bell,
  Mail,
  Moon,
  Package,
  ShieldCheck,
  Activity,
  User as UserIcon,
  Home as HomeIcon,
  LogOut,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function AdminLayout() {
  const { logout, token } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [userRole, setUserRole] = useState("Admin");
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const role = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || payload.role || "Admin";
        setUserRole(role);
      } catch (err) {
        console.error("Failed to parse token role", err);
      }
    }
  }, [token]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
            <span className="text-white font-bold">{userRole.charAt(0)}</span>
          </div>
          <span className="text-lg font-bold capitalize">{userRole} Portal</span>
        </div>

        <div className="p-4 flex-1">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-2">
            Dashboards
          </p>
          <nav className="space-y-1">
            <Link
              to="/admin"
              className="flex items-center px-3 py-2.5 bg-blue-50 text-blue-600 rounded-xl font-medium"
            >
              <LayoutDashboard className="w-5 h-5 mr-3" />
              eCommerce
            </Link>
            <Link
              to="#"
              className="flex items-center px-3 py-2.5 text-gray-600 hover:bg-gray-50 rounded-xl font-medium transition-colors"
            >
              <BarChart2 className="w-5 h-5 mr-3 text-gray-400" />
              Analytics
            </Link>
            <NavLink
              to="/admin/customers"
              className={({ isActive }) =>
                `flex items-center px-4 py-2.5 rounded-xl font-medium text-sm ${isActive ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50"}`
              }
            >
              <Users className="w-5 h-5 mr-3" /> Customers
            </NavLink>

            <NavLink
              to="/admin/administration"
              className={({ isActive }) =>
                `flex items-center px-4 py-2.5 rounded-xl font-medium text-sm ${isActive ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50"}`
              }
            >
              <ShieldCheck className="w-5 h-5 mr-3" /> Manage Administration
            </NavLink>
            <NavLink
              to="/admin/orders"
              className={({ isActive }) =>
                `flex items-center px-4 py-2.5 rounded-xl font-medium text-sm ${isActive ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50"}`
              }
            >
              <Package className="w-5 h-5 mr-3" /> Orders
            </NavLink>
            <NavLink
              to="/admin/activity-logs"
              className={({ isActive }) =>
                `flex items-center px-4 py-2.5 rounded-xl font-medium text-sm ${isActive ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50"}`
              }
            >
              <Activity className="w-5 h-5 mr-3" /> Activity Logs
            </NavLink>
          </nav>

          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-8 mb-4 px-2">
            Catalog
          </p>
          <nav className="space-y-1">
            <Link
              to="/admin/categories"
              className="flex items-center px-3 py-2.5 text-gray-600 hover:bg-gray-50 rounded-xl font-medium transition-colors"
            >
              <Layout className="w-5 h-5 mr-3 text-gray-400" />
              Categories
            </Link>
            <Link
              to="/admin/products"
              className="flex items-center px-3 py-2.5 text-gray-600 hover:bg-gray-50 rounded-xl font-medium transition-colors"
            >
              <Package className="w-5 h-5 mr-3 text-gray-400" />
              Products
            </Link>
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 bg-[#f8f9fa] flex items-center justify-between px-6 relative">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center font-bold text-white text-sm shadow-sm">
              {userRole.charAt(0)}
            </div>
            <span className="font-bold text-gray-900 text-base">{userRole} Panel</span>
          </div>

          <div className="flex items-center space-x-4">
            <Moon className="w-5 h-5 text-gray-400 cursor-pointer" />
            <Mail className="w-5 h-5 text-gray-400 cursor-pointer" />
            <div className="relative">
              <Bell className="w-5 h-5 text-gray-400 cursor-pointer" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center border-2 border-[#f8f9fa]">
                5
              </span>
            </div>

            {/* Person Icon with Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <div
                onClick={() => setShowDropdown(!showDropdown)}
                className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden border border-gray-200 cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
              >
                <img
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin"
                  alt="Profile"
                />
              </div>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <button
                    onClick={() => { setShowDropdown(false); navigate('/admin/profile'); }}
                    className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 font-medium cursor-pointer"
                  >
                    <UserIcon className="w-4 h-4 mr-3 text-gray-400" /> Profile
                  </button>
                  <button
                    onClick={() => { setShowDropdown(false); navigate('/'); }}
                    className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 font-medium cursor-pointer"
                  >
                    <HomeIcon className="w-4 h-4 mr-3 text-gray-400" /> Home
                  </button>
                  <div className="border-t border-gray-100 my-1"></div>
                  <button
                    onClick={() => { setShowDropdown(false); logout(); }}
                    className="w-full flex items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 font-medium cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 mr-3" /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
