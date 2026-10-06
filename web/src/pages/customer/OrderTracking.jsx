import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Package,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Loader2,
  MapPin,
  CreditCard,
  XCircle,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import api from "../../services/api";

export default function OrderTracking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [refund, setRefund] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    const fetchOrderAndRefund = async () => {
      try {
        const orderRes = await api.get(`/profile/orders/${id}`);
        setOrder(orderRes.data);

        // Check if a refund request exists
        if (orderRes.data?.status === "Cancelled") {
          try {
            const refundRes = await api.get(`/refunds/order/${id}`);
            setRefund(refundRes.data);
          } catch {
            setRefund(null);
          }
        }
      } catch (err) {
        setError("Failed to load order tracking details.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrderAndRefund();
    window.scrollTo(0, 0);
  }, [id]);

  const handleCancelOrder = async () => {
    setIsCancelling(true);
    try {
      await api.put(`/orders/${id}/cancel`);
      setShowCancelModal(false);
      navigate("/profile/orders");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel order.");
      setIsCancelling(false);
      setShowCancelModal(false);
    }
  };

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
        <p className="text-red-500 font-bold mb-4">
          {error || "Order not found."}
        </p>
        <Link
          to="/profile/orders"
          className="text-blue-600 font-bold hover:underline inline-flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Orders
        </Link>
      </div>
    );
  }

  const statusStr = (order.status || "").toLowerCase();
  const isCancelled = statusStr === "cancelled";
  const paymentMethod = (order.paymentMethod || "").toLowerCase();
  const isOnlinePayment =
    !paymentMethod.includes("cash") && !paymentMethod.includes("cod");

  // Calculate 7-day window from order placement
  const orderDate = new Date(order.createdAt);
  const daysElapsed = (new Date() - orderDate) / (1000 * 60 * 60 * 24);
  const isWithin7Days = daysElapsed <= 7;
  const remainingDays = Math.max(0, Math.ceil(7 - daysElapsed));

  const isEligibleForRefund = isCancelled && isOnlinePayment && isWithin7Days;

  const getBadgeColor = () => {
    switch (statusStr) {
      case "completed":
        return "bg-green-50 text-green-700 border border-green-200/60";
      case "cancelled":
        return "bg-red-50 text-red-600 border border-red-200/60";
      case "out for delivery":
        return "bg-amber-50 text-amber-700 border border-amber-200/60";
      case "parcel ready":
        return "bg-indigo-50 text-indigo-700 border border-indigo-200/60";
      default:
        return "bg-blue-50 text-blue-700 border border-blue-200/60";
    }
  };

  return (
    <div className="space-y-8 relative">
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-gray-100 pb-6">
          <div>
            <Link
              to="/profile/orders"
              className="text-xs font-bold text-blue-600 hover:underline mb-2 inline-flex items-center"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to My Orders
            </Link>
            <h1 className="text-2xl font-black text-gray-900">
              Track Order: {order.orderNumber}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Placed on {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
          <span
            className={`text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wider ${getBadgeColor()}`}
          >
            {order.status}
          </span>
        </div>

        {isCancelled ? (
          <div className="mb-8 p-6 rounded-2xl bg-red-50/60 border border-red-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <p className="text-red-700 font-bold text-base">
                This order has been cancelled.
              </p>

              {refund ? (
                <p className="text-xs text-gray-600 mt-1">
                  A refund request has been logged and is currently{" "}
                  <strong className="text-gray-900">{refund.status}</strong>.
                </p>
              ) : isEligibleForRefund ? (
                <p className="text-xs text-gray-600 mt-1">
                  Paid online via {order.paymentMethod}. You have{" "}
                  <strong className="text-orange-600 font-bold">
                    {remainingDays} {remainingDays === 1 ? "day" : "days"} remaining
                  </strong>{" "}
                  to claim your refund.
                </p>
              ) : !isOnlinePayment ? (
                <p className="text-xs text-gray-500 mt-1">
                  Cash on Delivery orders are not eligible for online refund requests.
                </p>
              ) : (
                <p className="text-xs text-red-600 font-medium mt-1">
                  The 7-day refund request window from the order placement date has expired.
                </p>
              )}
            </div>

            {/* Refund Action Buttons */}
            <div>
              {refund ? (
                <Link
                  to={`/profile/orders/${order.id}/refund`}
                  className={`inline-flex items-center px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors shadow-sm ${
                    refund.status === "Accepted"
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : refund.status === "Rejected"
                        ? "bg-red-600 text-white hover:bg-red-700"
                        : "bg-amber-500 text-white hover:bg-amber-600"
                  }`}
                >
                  <RotateCcw className="w-4 h-4 mr-2" /> Refund: {refund.status}
                </Link>
              ) : isEligibleForRefund ? (
                <Link
                  to={`/profile/orders/${order.id}/refund`}
                  className="inline-flex items-center px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-sm"
                >
                  <RotateCcw className="w-4 h-4 mr-2" /> Request Refund
                </Link>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="mb-10">
            <h3 className="font-bold text-gray-900 mb-6">Delivery Progress</h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              {[
                {
                  title: "Order Placed",
                  subtitle: new Date(order.createdAt).toLocaleDateString(),
                  completed: true,
                },
                {
                  title: "Processing",
                  subtitle: "Items are being packed",
                  completed: true,
                },
                {
                  title: "Shipped",
                  subtitle: order.courier || "Express Delivery",
                  completed:
                    order.status === "Out for Delivery" ||
                    order.status === "Completed",
                },
                {
                  title: "Delivered",
                  subtitle:
                    order.status === "Completed"
                      ? "Delivered"
                      : "Expected in 3-5 days",
                  completed: order.status === "Completed",
                },
              ].map((step, idx) => (
                <div
                  key={idx}
                  className="flex flex-col items-center text-center p-4 rounded-2xl bg-gray-50/60 border border-gray-100"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 font-bold ${step.completed ? "bg-green-500 text-white shadow-sm" : "bg-gray-200 text-gray-400"}`}
                  >
                    {step.completed ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <Clock className="w-5 h-5" />
                    )}
                  </div>
                  <h4 className="font-bold text-gray-900 text-sm mb-1">
                    {step.title}
                  </h4>
                  <p className="text-xs text-gray-500">{step.subtitle}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
          {order.status === "Processing" && (
            <button
              onClick={() => setShowCancelModal(true)}
              className="bg-red-50 hover:bg-red-100 text-red-600 font-bold py-3 px-6 rounded-xl transition-colors inline-flex items-center cursor-pointer"
            >
              <XCircle className="w-5 h-5 mr-2" /> Cancel Order
            </button>
          )}
          <Link
            to="/"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-8 rounded-xl transition-colors shadow-sm inline-flex items-center ml-auto"
          >
            Continue Shopping
          </Link>
        </div>
      </div>

      {/* Summary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center">
            <Package className="w-5 h-5 mr-3 text-blue-600" /> Ordered Items
          </h3>
          <div className="space-y-4">
            {order.items.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-sm p-3 bg-gray-50/50 rounded-xl border border-gray-100"
              >
                <div className="flex items-center space-x-3 truncate">
                  <span className="font-bold text-gray-400">
                    x{item.quantity}
                  </span>
                  <span className="font-medium text-gray-800 truncate">
                    {item.name}
                  </span>
                </div>
                <span className="font-bold text-gray-900">
                  Rs. {item.subtotal.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 mt-6 pt-4 flex justify-between items-center text-lg font-black text-gray-900">
            <span>Total Amount</span>
            <span className="text-orange-500">
              Rs. {order.total.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-6">
          <div>
            <h3 className="font-bold text-gray-900 mb-2 flex items-center">
              <MapPin className="w-5 h-5 mr-3 text-red-500" /> Shipping Address
            </h3>
            <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-xl border border-gray-100">
              {order.address}
            </p>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 mb-2 flex items-center">
              <CreditCard className="w-5 h-5 mr-3 text-green-500" /> Payment & Courier
            </h3>
            <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-1">
              <p>
                <strong className="text-gray-900">Method:</strong>{" "}
                {order.paymentMethod}
              </p>
              <p>
                <strong className="text-gray-900">Payment Status:</strong>{" "}
                <span className="text-green-600 font-bold">
                  {order.paymentStatus}
                </span>
              </p>
              <p>
                <strong className="text-gray-900">Courier:</strong>{" "}
                {order.courier || "Express Delivery"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Order Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl text-center border border-gray-100">
            <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Cancel Order
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to cancel order{" "}
              <strong className="text-gray-800">{order.orderNumber}</strong>?
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 bg-gray-100 font-bold py-2.5 rounded-xl cursor-pointer transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={isCancelling}
                className="flex-1 bg-red-600 text-white font-bold py-2.5 rounded-xl shadow-sm cursor-pointer transition-colors"
              >
                {isCancelling ? "Cancelling..." : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
