import { Outlet, NavLink, Link } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Package, Heart, ChevronRight, Store, MapPin } from 'lucide-react';

export default function ProfileLayout() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Breadcrumb */}
      <div className="bg-white border-b border-gray-100 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center text-sm">
          <Link to="/" className="text-gray-500 hover:text-blue-600 transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />
          <span className="font-semibold text-gray-900">My Account</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar */}
        <aside className="w-full lg:w-72 bg-white rounded-3xl p-6 shadow-sm border border-gray-100 shrink-0 h-max">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-3">Navigation</p>
          <nav className="space-y-1">
            <NavLink 
              to="/profile" 
              end
              className={({ isActive }) => `w-full flex items-center px-4 py-3 rounded-2xl font-bold text-sm transition-colors ${isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <LayoutDashboard className="w-5 h-5 mr-3" /> Dashboard
            </NavLink>

            <NavLink 
              to="/profile/cart" 
              className={({ isActive }) => `w-full flex items-center px-4 py-3 rounded-2xl font-bold text-sm transition-colors ${isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <ShoppingCart className="w-5 h-5 mr-3" /> My Cart
            </NavLink>

            <NavLink 
              to="/profile/orders" 
              className={({ isActive }) => `w-full flex items-center px-4 py-3 rounded-2xl font-bold text-sm transition-colors ${isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <Package className="w-5 h-5 mr-3" /> My Orders
            </NavLink>

            <NavLink 
              to="/profile/wishlist" 
              className={({ isActive }) => `w-full flex items-center px-4 py-3 rounded-2xl font-bold text-sm transition-colors ${isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <Heart className="w-5 h-5 mr-3" /> Wishlist
            </NavLink>
            <NavLink
  to="/profile/addresses"
  className={({ isActive }) =>
    `flex items-center px-4 py-3 rounded-2xl font-bold text-sm transition-colors ${
      isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
    }`
  }
>
  <MapPin className="w-5 h-5 mr-3" /> Saved Addresses
</NavLink>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>

      </div>
    </div>
  );
}
