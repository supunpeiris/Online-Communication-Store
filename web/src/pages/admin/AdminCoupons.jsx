import { useState, useEffect } from 'react';
import { Ticket, Plus, Edit, Trash2, Loader2, AlertCircle, CheckCircle2, X, AlertTriangle } from 'lucide-react';
import api from '../../services/api';
import TablePagination from '../../components/common/TablePagination';
import { getLocalTodayString, getFutureDateString } from '../../utils/discount';

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState(null);

  const [formData, setFormData] = useState({
    code: '',
    discountType: 'Percentage',
    discountValue: '',
    minimumOrderAmount: '',
    maximumDiscount: '',
    usageLimit: '',
    startDate: '',
    endDate: '',
    status: 'Active'
  });

  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchCoupons = async () => {
    try {
      const res = await api.get('/coupons');
      setCoupons(res.data);
    } catch (err) {
      console.error("Failed to fetch coupons", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleOpenAdd = () => {
    setEditMode(false);
    setFormData({
      code: '',
      discountType: 'Percentage',
      discountValue: '',
      minimumOrderAmount: '0',
      maximumDiscount: '0',
      usageLimit: '0',
      startDate: getLocalTodayString(),
      endDate: getFutureDateString(30),
      status: 'Active'
    });
    setErrorMsg('');
    setShowModal(true);
  };

  const handleOpenEdit = (c) => {
    setEditMode(true);
    setCurrentId(c.id);
    setFormData({
      code: c.code,
      discountType: c.discountType,
      discountValue: c.discountValue,
      minimumOrderAmount: c.minimumOrderAmount,
      maximumDiscount: c.maximumDiscount,
      usageLimit: c.usageLimit,
      startDate: c.startDate ? c.startDate.split('T')[0] : getLocalTodayString(),
      endDate: c.endDate ? c.endDate.split('T')[0] : getFutureDateString(30),
      status: c.status
    });
    setErrorMsg('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (formData.endDate <= formData.startDate) {
      setErrorMsg('End date must be greater than start date.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        code: formData.code.trim().toUpperCase(),
        discountValue: parseFloat(formData.discountValue),
        minimumOrderAmount: parseFloat(formData.minimumOrderAmount) || 0,
        maximumDiscount: parseFloat(formData.maximumDiscount) || 0,
        usageLimit: parseInt(formData.usageLimit) || 0,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString()
      };

      if (editMode) {
        await api.put(`/coupons/${currentId}`, payload);
        setSuccessMsg('Coupon updated successfully!');
      } else {
        await api.post('/coupons', payload);
        setSuccessMsg('Coupon created successfully!');
      }

      setShowModal(false);
      fetchCoupons();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to save coupon.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!couponToDelete) return;
    try {
      await api.delete(`/coupons/${couponToDelete.id}`);
      setSuccessMsg('Coupon deleted successfully!');
      setShowDeleteModal(false);
      setCouponToDelete(null);
      fetchCoupons();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setShowDeleteModal(false);
      setErrorMsg('Failed to delete coupon.');
    }
  };

  const paginatedCoupons = coupons.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

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
            <Ticket className="w-6 h-6 mr-3 text-blue-600" /> Coupons & Voucher Codes
          </h2>
          <p className="text-sm text-gray-500 mt-1">Create promotional discount codes for customers to apply at checkout.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl transition-colors inline-flex items-center shadow-sm cursor-pointer"
        >
          <Plus className="w-5 h-5 mr-2" /> Add Coupon
        </button>
      </div>

      {successMsg && (
        <div className="mx-8 mb-6 bg-green-50 text-green-700 p-4 rounded-xl flex items-center text-sm font-medium border border-green-100 shadow-sm">
          <CheckCircle2 className="w-5 h-5 mr-2 text-green-500" /> {successMsg}
        </div>
      )}

      {errorMsg && !showModal && (
        <div className="mx-8 mb-6 bg-red-50 text-red-600 p-4 rounded-xl flex items-center text-sm font-medium border border-red-100 shadow-sm">
          <AlertCircle className="w-5 h-5 mr-2 text-red-500" /> {errorMsg}
        </div>
      )}

      {coupons.length === 0 ? (
        <p className="text-gray-500 text-center py-12">No coupons created yet.</p>
      ) : (
        <>
          <div className="overflow-x-auto px-8">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 text-xs uppercase tracking-wider">
                  <th className="pb-4 font-bold">Code</th>
                  <th className="pb-4 font-bold">Type & Value</th>
                  <th className="pb-4 font-bold">Min Spend</th>
                  <th className="pb-4 font-bold">Max Cap</th>
                  <th className="pb-4 font-bold">Validity Period</th>
                  <th className="pb-4 font-bold">Status</th>
                  <th className="pb-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {paginatedCoupons.map((c) => {
                  const todayStr = getLocalTodayString();
                  const endStr = c.endDate ? String(c.endDate).slice(0, 10) : '';
                  const isExpired = endStr && todayStr > endStr;
                  const displayStatus = isExpired ? 'INACTIVE' : c.status;

                  return (
                    <tr key={c.id} className="hover:bg-gray-50/50">
                      <td className="py-4 font-black tracking-wider text-blue-600">{c.code}</td>
                      <td className="py-4 font-bold text-gray-900">
                        {c.discountValue}{c.discountType === 'Percentage' ? '%' : ' Rs'}
                      </td>
                      <td className="py-4 text-xs text-gray-600">
                        {c.minimumOrderAmount > 0 ? `Rs. ${c.minimumOrderAmount}` : 'None'}
                      </td>
                      <td className="py-4 text-xs text-gray-600">
                        {c.maximumDiscount > 0 ? `Rs. ${c.maximumDiscount}` : 'No Cap'}
                      </td>
                      <td className="py-4 text-xs text-gray-500">
                        {new Date(c.startDate).toLocaleDateString()} — {new Date(c.endDate).toLocaleDateString()}
                      </td>
                      <td className="py-4">
                        <span className={`font-bold text-xs px-2.5 py-1 rounded-full uppercase ${
                          displayStatus.toLowerCase() === 'active'
                            ? 'bg-green-50 text-green-700'
                            : 'bg-red-50 text-red-600'
                        }`}>
                          {displayStatus}
                        </span>
                      </td>
                      <td className="py-4 text-right space-x-2">
                        <button onClick={() => handleOpenEdit(c)} className="p-2 bg-gray-100 hover:bg-blue-50 text-gray-600 hover:text-blue-600 rounded-xl inline-flex cursor-pointer"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => { setCouponToDelete(c); setShowDeleteModal(true); }} className="p-2 bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 rounded-xl inline-flex cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <TablePagination
            currentPage={currentPage}
            totalItems={coupons.length}
            rowsPerPage={rowsPerPage}
            onPageChange={setCurrentPage}
            onRowsPerPageChange={setRowsPerPage}
          />
        </>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl relative border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">{editMode ? 'Edit Coupon' : 'Create New Coupon'}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-full cursor-pointer"><X className="w-5 h-5" /></button>
            </div>

            {errorMsg && <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm font-medium">{errorMsg}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Coupon Code</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-2.5 border rounded-xl bg-gray-50 focus:bg-white uppercase tracking-wider font-bold"
                  placeholder="SAVE15"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Discount Type</label>
                  <select value={formData.discountType} onChange={(e) => setFormData({ ...formData, discountType: e.target.value })} className="w-full px-4 py-2.5 border rounded-xl bg-gray-50 focus:bg-white">
                    <option value="Percentage">Percentage (%)</option>
                    <option value="Fixed">Fixed Amount (Rs)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Discount Value</label>
                  <input type="number" step="0.01" required min="0" value={formData.discountValue} onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })} className="w-full px-4 py-2.5 border rounded-xl bg-gray-50 focus:bg-white" placeholder="15" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Min Spend (Rs)</label>
                  <input type="number" step="0.01" value={formData.minimumOrderAmount} onChange={(e) => setFormData({ ...formData, minimumOrderAmount: e.target.value })} className="w-full px-4 py-2.5 border rounded-xl bg-gray-50 focus:bg-white" placeholder="1000" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Max Cap (Rs, 0=None)</label>
                  <input type="number" step="0.01" value={formData.maximumDiscount} onChange={(e) => setFormData({ ...formData, maximumDiscount: e.target.value })} className="w-full px-4 py-2.5 border rounded-xl bg-gray-50 focus:bg-white" placeholder="500" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Start Date</label>
                  <input type="date" required value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} className="w-full px-4 py-2.5 border rounded-xl bg-gray-50 focus:bg-white" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">End Date</label>
                  <input type="date" required value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} className="w-full px-4 py-2.5 border rounded-xl bg-gray-50 focus:bg-white" />
                </div>
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors shadow-sm cursor-pointer mt-4">
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (editMode ? 'Update Coupon' : 'Create Coupon')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl text-center border border-gray-100">
            <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Coupon</h3>
            <p className="text-sm text-gray-500 mb-6">Are you sure you want to delete <strong className="text-gray-800">{couponToDelete?.code}</strong>?</p>
            <div className="flex space-x-3">
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 bg-gray-100 text-gray-700 font-bold py-2.5 rounded-xl cursor-pointer">Cancel</button>
              <button onClick={handleDelete} className="flex-1 bg-red-600 text-white font-bold py-2.5 rounded-xl shadow-sm cursor-pointer">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
