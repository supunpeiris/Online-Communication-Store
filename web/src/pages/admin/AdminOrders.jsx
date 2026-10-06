import { useState, useEffect, useMemo } from "react";
import { Package, Loader2, CheckCircle2, Search, Filter, X } from "lucide-react";
import api from "../../services/api";
import TablePagination from "../../components/common/TablePagination";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState("");

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

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

  // Filter orders based on Order ID search query and selected status
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesSearch =
        !searchQuery.trim() ||
        o.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        String(o.id).includes(searchQuery.trim());

      const matchesStatus =
        statusFilter === "All" ||
        o.status?.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  // Reset to page 1 whenever filters change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setStatusFilter("All");
    setCurrentPage(1);
  };

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

  const paginatedOrders = filteredOrders.slice(
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
      {/* Header Section */}
      <div className="p-8 pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <Package className="w-6 h-6 mr-3 text-blue-600" /> Customer Orders Management
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            View, filter, and update customer order fulfillment statuses.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full">
            {filteredOrders.length} of {orders.length} Orders
          </span>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="px-8 pb-6 pt-2 flex flex-col sm:flex-row items-center gap-4">
        {/* Search by Order ID */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Order ID (e.g. ORD-E7748503)..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-9 py-2.5 bg-gray-50 hover:bg-gray-100/70 focus:bg-white text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors font-medium text-gray-800 placeholder-gray-400"
          />
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(""); setCurrentPage(1); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded-full cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Status Filter Dropdown */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-56">
            <Filter className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={statusFilter}
              onChange={handleStatusFilterChange}
              className="w-full pl-10 pr-8 py-2.5 bg-gray-50 hover:bg-gray-100/70 focus:bg-white text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-gray-700 cursor-pointer transition-colors appearance-none"
            >
              <option value="All">All Statuses</option>
              <option value="Processing">Processing</option>
              <option value="Parcel Ready">Parcel Ready</option>
              <option value="Out for Delivery">Out for Delivery</option>
              <option value="Completed">Completed / Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {(searchQuery || statusFilter !== "All") && (
            <button
              onClick={handleClearFilters}
              className="text-xs font-bold text-gray-500 hover:text-red-600 bg-gray-100 hover:bg-red-50 px-3 py-2.5 rounded-xl transition-colors cursor-pointer shrink-0"
              title="Reset filters"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {successMsg && (
        <div className="mx-8 mb-6 bg-green-50 text-green-700 p-4 rounded-xl flex items-center text-sm font-medium border border-green-100 shadow-sm">
          <CheckCircle2 className="w-5 h-5 mr-2 text-green-500" />
          {successMsg}
        </div>
      )}

      {filteredOrders.length === 0 ? (
        <div className="text-center py-16 px-4">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="font-bold text-gray-800 text-base">No matching orders found</h3>
          <p className="text-gray-400 text-xs mt-1">
            Try adjusting your search terms or status filter.
          </p>
        </div>
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
                    <tr key={o.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 font-bold text-gray-900 tracking-wide">
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
                            <span className="font-bold text-gray-500">x{item.quantity}</span>{" "}
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
                            className={`px-3 py-1.5 border rounded-xl font-bold text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer uppercase shadow-xs transition-colors ${
                              o.status === "Completed"
                                ? "bg-green-50 text-green-700 border-green-200"
                                : o.status === "Out for Delivery"
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : o.status === "Parcel Ready"
                                ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                                : "bg-blue-50 text-blue-700 border-blue-200"
                            }`}
                          >
                            <option value="Processing">Processing</option>
                            <option value="Parcel Ready">Parcel Ready</option>
                            <option value="Out for Delivery">Out for Delivery</option>
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
            totalItems={filteredOrders.length}
            rowsPerPage={rowsPerPage}
            onPageChange={setCurrentPage}
            onRowsPerPageChange={setRowsPerPage}
          />
        </>
      )}
    </div>
  );
}
