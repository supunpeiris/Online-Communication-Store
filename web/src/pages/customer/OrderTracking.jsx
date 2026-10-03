import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Package, CheckCircle2, Truck, Clock, ArrowLeft, Loader2, MapPin, CreditCard } from 'lucide-react';
import api from '../../services/api';

export default function OrderTracking() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrderTracking = async () => {
      try {
        const res = await api.get(`/profile/orders/${id}`);
        setOrder(res.data);
      } catch (err) {
        setError('Failed to load order tracking details.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrderTracking();
    window.scrollTo(0, 0);
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 bg-white rounded-3xl border border-gray-100 shadow-sm">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="bg-white rounded-3xl p-8 text-center border border-gray-100 shadow-sm">
        <p className="text-red-500 font-bold mb-4">{error || "Order not found."}</p>
        <Link to="/profile/orders" className="text-blue-600 font-bold hover:underline inline-flex items-center">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Orders
        </Link>
      </div>
    );
  }

  // Determine timeline progress steps
  const steps = [
    { title: 'Order Placed', subtitle: new Date(order.createdAt).toLocaleDateString(), completed: true },
    { title: 'Processing', subtitle: 'Items are being packed', completed: true },
    { title: 'Shipped', subtitle: order.Courier, completed: order.ShippingStatus === 'Shipped' || order.Status === 'Completed' },
    { title: 'Delivered', subtitle: 'Expected in 3-5 days', completed: order.Status === 'Completed' }
  ];

  return (
    <div className="space-y-8">
      {/* Header Card */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-gray-100 pb-6">
          <div>
            <Link to="/profile/orders" className="text-xs font-bold text-blue-600 hover:underline mb-2 inline-flex items-center">
              <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to My Orders
            </Link>
            <h1 className="text-2xl font-black text-gray-900">Track Order: {order.orderNumber}</h1>
            <p className="text-sm text-gray-500 mt-1">Placed on {new Date(order.createdAt).toLocaleString()}</p>
          </div>
          <span className="bg-blue-50 text-blue-700 text-xs font-extrabold px-4 py-1.5 rounded-full uppercase tracking-wider">
            {order.status}
          </span>
        </div>

        {/* Tracking Timeline Section */}
        <div className="mb-10">
          <h3 className="font-bold text-gray-900 mb-6">Delivery Progress</h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {steps.map((step, idx) => (
              <div key={idx} className="flex flex-col items-center text-center p-4 rounded-2xl bg-gray-50/60 border border-gray-100 relative">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 font-bold ${step.completed ? 'bg-green-500 text-white shadow-sm' : 'bg-gray-200 text-gray-400'}`}>
                  {step.completed ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                </div>
                <h4 className="font-bold text-gray-900 text-sm mb-1">{step.title}</h4>
                <p className="text-xs text-gray-500">{step.subtitle}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Continue Shopping Button directly below tracking section */}
        <div className="flex justify-end pt-4 border-t border-gray-100">
          <Link 
            to="/" 
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-8 rounded-xl transition-colors shadow-sm inline-flex items-center"
          >
            Continue Shopping
          </Link>
        </div>
      </div>

      {/* Order Summary & Shipping Address Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Items List */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center">
            <Package className="w-5 h-5 mr-3 text-blue-600" /> Ordered Items
          </h3>
          <div className="space-y-4">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm p-3 bg-gray-50/50 rounded-xl border border-gray-100">
                <div className="flex items-center space-x-3 truncate">
                  <span className="font-bold text-gray-400">x{item.quantity}</span>
                  <span className="font-medium text-gray-800 truncate">{item.name}</span>
                </div>
                <span className="font-bold text-gray-900">Rs. {item.subtotal.toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 mt-6 pt-4 flex justify-between items-center text-lg font-black text-gray-900">
            <span>Total Amount</span>
            <span className="text-orange-500">Rs. {order.total.toFixed(2)}</span>
          </div>
        </div>

        {/* Delivery & Payment Info */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-6">
          <div>
            <h3 className="font-bold text-gray-900 mb-2 flex items-center">
              <MapPin className="w-5 h-5 mr-3 text-red-500" /> Shipping Address
            </h3>
            <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-xl border border-gray-100">{order.address}</p>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 mb-2 flex items-center">
              <CreditCard className="w-5 h-5 mr-3 text-green-500" /> Payment & Courier
            </h3>
            <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-1">
              <p><strong className="text-gray-900">Method:</strong> {order.paymentMethod}</p>
              <p><strong className="text-gray-900">Payment Status:</strong> <span className="text-green-600 font-bold">{order.paymentStatus}</span></p>
              <p><strong className="text-gray-900">Courier:</strong> {order.courier}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
