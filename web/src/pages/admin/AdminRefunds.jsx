import { useState, useEffect, useMemo } from 'react';
import { 
  RotateCcw, 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  AlertTriangle, 
  X, 
  Search, 
  Filter 
} from 'lucide-react';
import api from '../../services/api';
import TablePagination from '../../components/common/TablePagination';

export default function AdminRefunds() {
  const [refunds, setRefunds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Slip modal preview
  const [slipModalUrl, setSlipModalUrl] = useState('');

  // Action modal (Accept/Reject)
  const [activeRefund, setActiveRefund] = useState(null);
  const [actionType, setActionType] = useState('Accepted');
  const [adminNote, setAdminNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchRefunds = async () => {
    try {
      const res = await api.get('/refunds');
      setRefunds(res.data);
    } catch (err) {
      console.error('Failed to load refunds', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRefunds();
  }, []);

  // Filter refunds based on Order ID search and selected status
  const filteredRefunds = useMemo(() => {
    return refunds.filter((r) => {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        r.orderNumber?.toLowerCase().includes(query) ||
        String(r.orderId).includes(query) ||
        r.customerName?.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === 'All' ||
        r.status?.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [refunds, searchQuery, statusFilter]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setCurrentPage(1);
  };

  const handleUpdateStatus = async () => {
    if (!activeRefund) return;
    setIsProcessing(true);

    try {
      await api.put(`/refunds/${activeRefund.id}/status`, {
        status: actionType,
        adminNote
      });

      setSuccessMsg(`Refund request marked as '${actionType}' successfully!`);
      setActiveRefund(null);
      setAdminNote('');
      fetchRefunds();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update refund status.');
    } finally {
      setIsProcessing(false);
    }
  };

  const paginatedRefunds = filteredRefunds.slice(
    (currentPage - 1) * rowsPerPage, 
    currentPage * rowsPerPage
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
      {/* Header */}
      <div className="p-8 pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <RotateCcw className="w-6 h-6 mr-3 text-orange-500" /> Refund Requests
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Review customer payment slips and accept online refund claims for cancelled orders.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold bg-orange-50 text-orange-600 px-3 py-1.5 rounded-full">
            {filteredRefunds.length} of {refunds.length} Requests
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
            placeholder="Search by Order ID (e.g. ORD-F6521A54)..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-9 py-2.5 bg-gray-50 hover:bg-gray-100/70 focus:bg-white text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors font-medium text-gray-800 placeholder-gray-400"
          />
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(''); setCurrentPage(1); }}
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
              className="w-full pl-10 pr-8 py-2.5 bg-gray-50 hover:bg-gray-100/70 focus:bg-white text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 font-bold text-gray-700 cursor-pointer transition-colors appearance-none"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending / Processing</option>
              <option value="Accepted">Accepted</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {(searchQuery || statusFilter !== 'All') && (
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
          <CheckCircle2 className="w-5 h-5 mr-2 text-green-500" /> {successMsg}
        </div>
      )}

      {filteredRefunds.length === 0 ? (
        <div className="text-center py-16 px-4">
          <RotateCcw className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="font-bold text-gray-800 text-base">No refund requests found</h3>
          <p className="text-gray-400 text-xs mt-1">
            {refunds.length === 0 
              ? 'No refund requests have been submitted yet.' 
              : 'Try adjusting your search terms or status filter.'}
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
                  <th className="pb-4 font-bold">Refund Amount</th>
                  <th className="pb-4 font-bold">Reason</th>
                  <th className="pb-4 font-bold">Receipt Slip</th>
                  <th className="pb-4 font-bold">Status</th>
                  <th className="pb-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {paginatedRefunds.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 font-bold text-gray-900 tracking-wide">{r.orderNumber}</td>
                    <td className="py-4">
                      <div className="font-bold text-gray-900">{r.customerName}</div>
                      <div className="text-xs text-gray-400">{r.customerEmail}</div>
                    </td>
                    <td className="py-4 font-black text-orange-500">Rs. {r.amount.toFixed(2)}</td>
                    <td className="py-4 text-xs text-gray-600 max-w-xs truncate">{r.reason}</td>
                    <td className="py-4">
                      {r.slipUrl ? (
                        <button
                          onClick={() => setSlipModalUrl(r.slipUrl)}
                          className="inline-flex items-center text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" /> View Slip
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400">No slip</span>
                      )}
                    </td>
                    <td className="py-4">
                      <span className={`font-bold text-xs px-2.5 py-1 rounded-full uppercase tracking-wider ${
                        r.status === 'Accepted'
                          ? 'bg-green-50 text-green-700'
                          : r.status === 'Rejected'
                          ? 'bg-red-50 text-red-600'
                          : 'bg-amber-50 text-amber-700'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="py-4 text-right space-x-2">
                      {r.status === 'Pending' ? (
                        <>
                          <button
                            onClick={() => { setActiveRefund(r); setActionType('Accepted'); }}
                            className="p-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl inline-flex cursor-pointer transition-colors"
                            title="Accept Refund"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => { setActiveRefund(r); setActionType('Rejected'); }}
                            className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl inline-flex cursor-pointer transition-colors"
                            title="Reject Refund"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Resolved</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <TablePagination
            currentPage={currentPage}
            totalItems={filteredRefunds.length}
            rowsPerPage={rowsPerPage}
            onPageChange={setCurrentPage}
            onRowsPerPageChange={setRowsPerPage}
          />
        </>
      )}

      {/* Payment Slip Image Preview Modal */}
      {slipModalUrl && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-900">Payment Receipt</h3>
              <button 
                onClick={() => setSlipModalUrl('')} 
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <img 
              src={slipModalUrl} 
              alt="Customer Slip" 
              className="max-h-[70vh] w-full object-contain rounded-xl bg-gray-50 border border-gray-100" 
            />
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {activeRefund && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl text-center border border-gray-100">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${
              actionType === 'Accepted' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
            }`}>
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">{actionType} Refund Request</h3>
            <p className="text-sm text-gray-500 mb-4">
              Are you sure you want to mark refund for <strong className="text-gray-800">{activeRefund.orderNumber}</strong> (Rs. {activeRefund.amount.toFixed(2)}) as <strong>{actionType}</strong>?
            </p>

            <textarea
              rows="2"
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder="Optional admin note / transaction reference..."
              className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white text-xs mb-4 focus:outline-none"
            ></textarea>

            <div className="flex space-x-3">
              <button 
                onClick={() => setActiveRefund(null)} 
                className="flex-1 bg-gray-100 font-bold py-2.5 rounded-xl cursor-pointer hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStatus}
                disabled={isProcessing}
                className={`flex-1 text-white font-bold py-2.5 rounded-xl shadow-sm cursor-pointer transition-colors ${
                  actionType === 'Accepted' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {isProcessing ? 'Saving...' : `Confirm ${actionType}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
