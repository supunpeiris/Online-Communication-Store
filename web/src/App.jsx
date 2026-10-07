import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Admin Layout & Pages
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Categories from './pages/admin/Categories';
import Products from './pages/admin/Products';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminAdministration from './pages/admin/AdminAdministration';
import AdminActivityLog from './pages/admin/AdminActivityLog';
import AdminProfile from './pages/admin/AdminProfile';
import AdminOrders from './pages/admin/AdminOrders';
import AdminCoupons from './pages/admin/AdminCoupons';
import AdminRefunds from './pages/admin/AdminRefunds';

// Customer Layout & Pages
import CustomerLayout from './layouts/CustomerLayout'; 
import Home from './pages/customer/Home';               
import ProductDetails from './pages/customer/ProductDetails';
import Checkout from './pages/customer/Checkout';
import ProfileLayout from './layouts/ProfileLayout';
import ProfileDashboard from './pages/customer/ProfileDashboard';
import ProfileOrders from './pages/customer/ProfileOrders';
import ProfileCart from './pages/customer/ProfileCart';
import OrderTracking from './pages/customer/OrderTracking';
import ProfileWishlist from './pages/customer/ProfileWishlist';
import AdminDiscounts from './pages/admin/AdminDiscounts';
import RefundRequest from './pages/customer/RefundRequest';
import ProfileAddresses from './pages/customer/ProfileAddresses';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function AppRoutes() {
  return (
    <Routes>
      
      {/* Public Storefront Routes */}
      <Route path="/" element={<CustomerLayout />}>
        {/* The index route strictly loads the Home page */}
        <Route index element={<Home />} />
        {/* The product route strictly loads ProductDetails with an ID parameter */}
        <Route path="product/:id" element={<ProductDetails />} />
        <Route path="checkout" element={<Checkout />} />

         {/* Profile / Account Routes */}
        <Route path="profile" element={<ProfileLayout />}>
          <Route index element={<ProfileDashboard />} />
          <Route path="cart" element={<ProfileCart />} />
          <Route path="orders" element={<ProfileOrders />} />
          <Route path="orders/:id" element={<OrderTracking />} />
          <Route path="wishlist" element={<ProfileWishlist />} />
          <Route path="/profile/orders/:id/refund" element={<RefundRequest />} />
          <Route path="/profile/addresses" element={<ProfileAddresses />} />
        </Route>

      </Route>

      {/* Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Admin Routes */}
      <Route path="/admin" element={
        <ProtectedRoute>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="customers" element={<AdminCustomers />} />
        <Route path="administration" element={<AdminAdministration />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="activity-logs" element={<AdminActivityLog />} />
        <Route path="profile" element={<AdminProfile />} />
        <Route path="categories" element={<Categories />} />
        <Route path="products" element={<Products />} />
        <Route path="discounts" element={<AdminDiscounts />} />
        <Route path="coupons" element={<AdminCoupons />} />
        <Route path="refunds" element={<AdminRefunds />} />
      </Route>

    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <WishlistProvider>
          <CartProvider>
            <AppRoutes />
          </CartProvider>
        </WishlistProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
