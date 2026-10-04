import { useState, useEffect } from "react";
import { Package, Loader2, CheckCircle2 } from "lucide-react";
import api from "../../services/api";
import TablePagination from "../../components/common/TablePagination";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchOrders = async () => {
    try {
      const res = await api.get("/orders/admin");
      setOrders(res.data);
    } catch (err) {
      console.error("Failed to load admin orders", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      setSuccessMsg(`Order status updated to '${newStatus}' successfully!`);
      fetchOrders();
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update order status.");
    }
  };

  const paginatedOrders = orders.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage,
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 bg-white rounded-2xl border border-gray-100 shadow-sm">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-8 pb-6 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <Package className="w-6 h-6 mr-3 text-blue-600" /> Customer Orders
            Management
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            View and update customer order fulfillment statuses.
          </p>
        </div>
        <span className="text-sm font-bold bg-blue-50 text-blue-600 px-3 py-1 rounded-full">
          {orders.length} Total Orders
        </span>
      </div>

      {successMsg && (
        <div className="mx-8 mb-6 bg-green-50 text-green-700 p-4 rounded-xl flex items-center text-sm font-medium border border-green-100 shadow-sm">
          <CheckCircle2 className="w-5 h-5 mr-2 text-green-500" />
          {successMsg}
        </div>
      )}

      {orders.length === 0 ? (
        <p className="text-gray-500 text-center py-12">No orders found.</p>
      ) : (
        <>
          <div className="overflow-x-auto px-8">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 text-xs uppercase tracking-wider">
                  <th className="pb-4 font-bold">Order #</th>
                  <th className="pb-4 font-bold">Customer</th>
                  <th className="pb-4 font-bold">Items</th>
                  <th className="pb-4 font-bold">Total</th>
                  <th className="pb-4 font-bold">Date</th>
                  <th className="pb-4 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {paginatedOrders.map((o) => {
                  const isCancelled = o.status === "Cancelled";
                  return (
                    <tr key={o.id} className="hover:bg-gray-50/50">
                      <td className="py-4 font-bold text-gray-900">
                        {o.orderNumber}
                      </td>
                      <td className="py-4">
                        <div className="font-bold text-gray-900">
                          {o.customerName}
                        </div>
                        <div className="text-xs text-gray-400">
                          {o.customerEmail}
                        </div>
                      </td>
                      <td className="py-4 text-gray-600">
                        {o.items.map((item, idx) => (
                          <div key={idx} className="text-xs">
                            <span className="font-bold">x{item.quantity}</span>{" "}
                            {item.name}
                          </div>
                        ))}
                      </td>
                      <td className="py-4 font-black text-gray-900">
                        Rs. {o.total.toFixed(2)}
                      </td>
                      <td className="py-4 text-gray-500 text-xs">
                        {new Date(o.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4">
                        {isCancelled ? (
                          <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-black bg-red-50 text-red-600 border border-red-100 uppercase tracking-wider">
                            Cancelled
                          </span>
                        ) : (
                          <select
                            value={o.status}
                            onChange={(e) =>
                              handleStatusChange(o.id, e.target.value)
                            }
                            className="px-3 py-1.5 border border-gray-200 rounded-xl bg-gray-50 font-bold text-xs text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer uppercase shadow-sm"
                          >
                            <option value="Processing">Processing</option>
                            <option value="Parcel Ready">Parcel Ready</option>
                            <option value="Out for Delivery">
                              Out for Delivery
                            </option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <TablePagination
            currentPage={currentPage}
            totalItems={orders.length}
            rowsPerPage={rowsPerPage}
            onPageChange={setCurrentPage}
            onRowsPerPageChange={setRowsPerPage}
          />
        </>
      )}
    </div>
  );
}
