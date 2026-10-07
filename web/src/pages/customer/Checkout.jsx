import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ShoppingCart, 
  CheckCircle2, 
  ChevronRight, 
  ArrowLeft, 
  Loader2, 
  Truck, 
  Ticket, 
  X, 
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  MapPin,
  Plus
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function Checkout() {
  const { cart, totalPrice, clearCart, getUserIdFromToken } = useCart();
  const { isAuthenticated, user, token } = useAuth();
  const navigate = useNavigate();

  // Saved Addresses State
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('new');
  const [saveToAccount, setSaveToAccount] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    paymentMethod: 'Credit Card'
  });

  // Coupon States
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  // Available Coupons List States
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [showAvailableCoupons, setShowAvailableCoupons] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Helper to split a full name
  const splitName = (fullName) => {
    if (!fullName) return { firstName: '', lastName: '' };
    const parts = fullName.trim().split(' ');
    return {
      firstName: parts[0] || '',
      lastName: parts.slice(1).join(' ') || ''
    };
  };

  // Populate address and profile details into form
  const applyAddressAndProfile = (addr, profile) => {
    const nameSource = addr?.recipientName || profile?.name || user?.name || '';
    const { firstName, lastName } = splitName(nameSource);

    setFormData(prev => ({
      ...prev,
      firstName: firstName || prev.firstName,
      lastName: lastName || prev.lastName,
      email: profile?.email || user?.email || prev.email,
      phone: addr?.phone || profile?.phone || user?.phone || prev.phone,
      address: addr ? addr.addressLine : prev.address,
      city: addr ? addr.city : prev.city,
      postalCode: addr ? addr.postalCode : prev.postalCode
    }));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch active coupons
        const couponRes = await api.get('/coupons/active').catch(() => ({ data: [] }));
        setAvailableCoupons(couponRes.data);

        // 2. Fetch logged in user profile and addresses
        if (isAuthenticated) {
          const userId = getUserIdFromToken() || user?.id || 1;
          let profileData = null;

          try {
            const profileRes = await api.get(`/profile/${userId}`);
            profileData = profileRes.data;
            setUserProfile(profileData);
          } catch (e) {
            console.error("Failed to fetch user profile", e);
          }

          const addrRes = await api.get('/addresses').catch(() => ({ data: [] }));
          if (addrRes.data && addrRes.data.length > 0) {
            setSavedAddresses(addrRes.data);
            const defaultAddr = addrRes.data.find(a => a.isDefault) || addrRes.data[0];
            setSelectedAddressId(defaultAddr.id);
            applyAddressAndProfile(defaultAddr, profileData);
          } else {
            // No saved addresses yet: autofill user contact details
            applyAddressAndProfile(null, profileData);
          }
        }
      } catch (err) {
        console.error('Failed to initialize checkout data', err);
      }
    };

    fetchData();
  }, [isAuthenticated]);

  const handleSelectAddress = (addr) => {
    setSelectedAddressId(addr.id);
    applyAddressAndProfile(addr, userProfile);
  };

  const handleSelectNewAddress = () => {
    setSelectedAddressId('new');
    // Keep user's default contact info but clear destination fields
    const { firstName, lastName } = splitName(userProfile?.name || user?.name || '');
    setFormData(prev => ({
      ...prev,
      firstName: firstName || prev.firstName,
      lastName: lastName || prev.lastName,
      email: userProfile?.email || user?.email || prev.email,
      phone: userProfile?.phone || user?.phone || prev.phone,
      address: '',
      city: '',
      postalCode: ''
    }));
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleApplyCoupon = async (codeToApply) => {
    const code = (codeToApply || couponCode).trim();
    if (!code) return;

    setCouponError('');
    setIsValidatingCoupon(true);

    try {
      const res = await api.post('/coupons/validate', {
        code: code,
        cartSubtotal: totalPrice
      });

      setAppliedCoupon(res.data);
      setCouponCode(res.data.code);
      setCouponError('');
    } catch (err) {
      setAppliedCoupon(null);
      setCouponError(err.response?.data?.message || 'Invalid or expired promo code.');
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const finalPayableTotal = Math.max(0, totalPrice - discountAmount);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const userId = getUserIdFromToken() || 1;

      let shippingAddressId = selectedAddressId !== 'new' ? selectedAddressId : null;
      if (selectedAddressId === 'new' && saveToAccount && isAuthenticated) {
        try {
          const newAddrRes = await api.post('/addresses', {
            recipientName: `${formData.firstName} ${formData.lastName}`.trim(),
            phone: formData.phone,
            addressLine: formData.address,
            city: formData.city,
            postalCode: formData.postalCode,
            isDefault: savedAddresses.length === 0
          });
          if (newAddrRes.data?.id) {
            shippingAddressId = newAddrRes.data.id;
          }
        } catch {
          // Continue even if saving address fails
        }
      }

      const orderPayload = {
        userId,
        shippingAddressId,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        postalCode: formData.postalCode,
        paymentMethod: formData.paymentMethod,
        couponId: appliedCoupon ? appliedCoupon.couponId : null,
        discountAmount: discountAmount,
        items: cart.map(item => ({
          productId: item.productId || item.id,
          quantity: item.quantity,
          unitPrice: item.price
        }))
      };

      await api.post('/orders', orderPayload);
      setOrderCompleted(true);
      clearCart();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderCompleted) {
    return (
      <div className="min-h-[calc(100vh-73px)] bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 max-w-md text-center">
          <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10"/>
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">Order Placed Successfully!</h2>
          <p className="text-gray-500 text-sm mb-6">Your order has been securely saved and is now processing.</p>
          <Link className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-colors block shadow-sm" to="/">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-[calc(100vh-73px)] bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 max-w-md text-center">
          <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-4"/>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Your Cart is Empty</h2>
          <p className="text-gray-500 text-sm mb-6">Add some products to your cart before proceeding.</p>
          <Link className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-colors inline-flex items-center" to="/">
            <ArrowLeft className="w-4 h-4 mr-2"/> Return to Store
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white border-b border-gray-100 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center text-sm">
          <Link className="text-gray-500 hover:text-blue-600 transition-colors" to="/">Home</Link>
          <ChevronRight className="w-4 h-4 text-gray-400 mx-2"/>
          <span className="font-semibold text-gray-900">Checkout</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <h1 className="text-3xl font-black text-gray-900 mb-8">Checkout</h1>

        {errorMsg && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 font-medium text-sm">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handlePlaceOrder} className="flex flex-col lg:flex-row gap-8">
          {/* Shipping Form Left Side */}
          <div className="flex-1 bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <Truck className="w-5 h-5 mr-3 text-blue-600"/> Shipping Details
            </h2>

            {/* Saved Address Cards */}
            {savedAddresses.length > 0 && (
              <div className="mb-8">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                  Select Delivery Destination
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  {savedAddresses.map((addr) => {
                    const isSelected = selectedAddressId === addr.id;
                    return (
                      <div
                        key={addr.id}
                        onClick={() => handleSelectAddress(addr)}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                          isSelected 
                            ? 'border-blue-600 bg-blue-50/30 ring-2 ring-blue-500/20' 
                            : 'border-gray-200 hover:border-gray-300 bg-gray-50/50'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-bold text-gray-900 text-sm">
                            {addr.recipientName || `${formData.firstName} ${formData.lastName}`}
                          </span>
                          {addr.isDefault && (
                            <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                              DEFAULT
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 line-clamp-1">{addr.addressLine}, {addr.city}</p>
                        <p className="text-xs text-gray-400 mt-1">{addr.phone || formData.phone}</p>
                      </div>
                    );
                  })}

                  <div
                    onClick={handleSelectNewAddress}
                    className={`p-4 rounded-2xl border-2 border-dashed flex items-center justify-center cursor-pointer transition-all ${
                      selectedAddressId === 'new'
                        ? 'border-blue-500 bg-blue-50/30 text-blue-600 font-bold'
                        : 'border-gray-200 hover:border-gray-300 text-gray-500'
                    }`}
                  >
                    <Plus className="w-4 h-4 mr-1.5" />
                    <span className="text-xs font-bold">Use Another Address</span>
                  </div>
                </div>
              </div>
            )}

            {/* Contact Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">First Name *</label>
                <input 
                  type="text" 
                  name="firstName" 
                  required 
                  value={formData.firstName} 
                  onChange={handleChange} 
                  placeholder="First Name"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium" 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Last Name *</label>
                <input 
                  type="text" 
                  name="lastName" 
                  required 
                  value={formData.lastName} 
                  onChange={handleChange} 
                  placeholder="Last Name"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium" 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Email *</label>
                <input 
                  type="email" 
                  name="email" 
                  required 
                  value={formData.email} 
                  onChange={handleChange} 
                  placeholder="name@example.com"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium" 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Phone *</label>
                <input 
                  type="tel" 
                  name="phone" 
                  required 
                  value={formData.phone} 
                  onChange={handleChange} 
                  placeholder="+94 77 123 4567"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium" 
                />
              </div>
            </div>

            {/* Destination Address Fields */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-700 mb-2">Address *</label>
              <input 
                type="text" 
                name="address" 
                required 
                value={formData.address} 
                onChange={handleChange} 
                placeholder="Street address, house number"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium" 
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">City *</label>
                <input 
                  type="text" 
                  name="city" 
                  required 
                  value={formData.city} 
                  onChange={handleChange} 
                  placeholder="City"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium" 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Postal Code *</label>
                <input 
                  type="text" 
                  name="postalCode" 
                  required 
                  value={formData.postalCode} 
                  onChange={handleChange} 
                  placeholder="Postal Code"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium" 
                />
              </div>
            </div>

            {/* Checkbox to save new address */}
            {selectedAddressId === 'new' && isAuthenticated && (
              <label className="flex items-center space-x-2.5 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={saveToAccount}
                  onChange={(e) => setSaveToAccount(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                />
                <span className="text-xs font-bold text-gray-700">Save this address to my profile for future orders</span>
              </label>
            )}
          </div>

          {/* Order Summary & Coupons Right Side */}
          <div className="w-full lg:w-96 shrink-0">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 sticky top-24 space-y-6">
              <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-4">Order Summary</h2>

              <div className="space-y-4 max-h-48 overflow-y-auto pr-2">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between items-center text-sm">
                    <div className="flex items-center space-x-3 truncate mr-4">
                      <span className="font-bold text-gray-400">x{item.quantity}</span>
                      <span className="text-gray-900 font-medium truncate">{item.name}</span>
                    </div>
                    <span className="font-bold text-gray-900 shrink-0">Rs. {(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Promo Code Input */}
              <div className="border-t border-gray-100 pt-4">
                {!appliedCoupon ? (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                      Promo Code
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Ticket className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="e.g. SAVE10"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          className="w-full pl-9 pr-3 py-2.5 text-xs border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none uppercase font-bold tracking-wider"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleApplyCoupon()}
                        disabled={isValidatingCoupon || !couponCode.trim()}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
                      >
                        {isValidatingCoupon ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Apply'}
                      </button>
                    </div>
                    {couponError && <p className="text-xs text-red-500 font-medium">{couponError}</p>}
                  </div>
                ) : (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-xl flex items-center justify-between">
                    <div className="flex items-center text-green-700 font-bold text-xs">
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      {appliedCoupon.code} (-Rs. {discountAmount.toFixed(2)})
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-gray-400 hover:text-red-500 p-1 cursor-pointer transition-colors"
                      title="Remove coupon"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Available Coupons Accordion */}
              {availableCoupons.length > 0 && (
                <div className="border border-orange-100 bg-orange-50/30 rounded-2xl p-4">
                  <div 
                    onClick={() => setShowAvailableCoupons(!showAvailableCoupons)}
                    className="flex justify-between items-center cursor-pointer select-none"
                  >
                    <span className="text-xs font-black text-gray-900 flex items-center">
                      <Sparkles className="w-3.5 h-3.5 mr-1.5 text-orange-500" />
                      Available Offers ({availableCoupons.length})
                    </span>
                    {showAvailableCoupons ? (
                      <ChevronUp className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    )}
                  </div>

                  {showAvailableCoupons && (
                    <div className="mt-3 space-y-2.5 max-h-56 overflow-y-auto pr-1">
                      {availableCoupons.map((c) => {
                        const isEligible = totalPrice >= c.minimumOrderAmount;
                        const isAlreadyApplied = appliedCoupon?.code === c.code;

                        return (
                          <div 
                            key={c.id} 
                            className={`p-3 rounded-xl border bg-white flex flex-col justify-between transition-all ${
                              isAlreadyApplied 
                                ? 'border-green-300 ring-1 ring-green-300' 
                                : 'border-gray-200/80 hover:border-orange-300'
                            }`}
                          >
                            <div className="flex justify-between items-start mb-1.5">
                              <div>
                                <span className="inline-block px-2 py-0.5 rounded-md bg-orange-100 text-orange-700 font-black text-xs tracking-wider">
                                  {c.code}
                                </span>
                                <span className="ml-2 text-xs font-bold text-gray-800">
                                  {c.discountValue}{c.discountType === 'Percentage' ? '% OFF' : ' Rs OFF'}
                                </span>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleApplyCoupon(c.code)}
                                disabled={!isEligible || isAlreadyApplied || isValidatingCoupon}
                                className={`text-[11px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider transition-colors cursor-pointer ${
                                  isAlreadyApplied
                                    ? 'bg-green-100 text-green-700'
                                    : isEligible
                                    ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-sm'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                }`}
                              >
                                {isAlreadyApplied ? 'Applied' : 'Apply'}
                              </button>
                            </div>

                            <p className="text-[11px] text-gray-500">
                              {c.minimumOrderAmount > 0 ? (
                                <>Min spend: <span className="font-semibold text-gray-700">Rs. {c.minimumOrderAmount.toFixed(2)}</span></>
                              ) : (
                                'No minimum spend required'
                              )}
                              {c.maximumDiscount > 0 && ` • Max cap: Rs. ${c.maximumDiscount}`}
                            </p>

                            {!isEligible && (
                              <p className="text-[10px] text-amber-600 font-bold mt-1">
                                Add Rs. {(c.minimumOrderAmount - totalPrice).toFixed(2)} more to unlock!
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Total Calculation */}
              <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>Rs. {totalPrice.toFixed(2)}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-green-600 font-bold">
                    <span>Coupon Discount</span>
                    <span>- Rs. {discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-gray-100 pt-3 flex justify-between text-lg font-black text-gray-900">
                  <span>Total Payable</span>
                  <span className="text-orange-500">Rs. {finalPayableTotal.toFixed(2)}</span>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white font-bold py-4 rounded-xl transition-colors shadow-sm flex items-center justify-center cursor-pointer"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin"/> : 'PLACE ORDER'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
