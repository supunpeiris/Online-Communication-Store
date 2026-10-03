import { Outlet, Link, NavLink } from "react-router-dom";
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
  Activity, // <-- Added Activity icon import
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function AdminLayout() {
  const { logout } = useAuth();
  return (
    <div className="min-h-screen bg-[#f8f9fa] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
            <span className="text-white font-bold">M</span>
          </div>
          <span className="text-lg font-bold">Store Admin</span>
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
        <header className="h-16 bg-[#f8f9fa] flex items-center justify-between px-6">
          <div className="flex items-center">
            <Search className="w-5 h-5 text-gray-400 cursor-pointer" />
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
            <div
              onClick={logout}
              title="Logout"
              className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden border border-gray-200 cursor-pointer hover:ring-2 hover:ring-red-500 transition-all"
            >
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin"
                alt="Profile"
              />
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
