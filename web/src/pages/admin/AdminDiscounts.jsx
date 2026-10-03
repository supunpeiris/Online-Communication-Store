import { useState, useEffect } from 'react';
import { Tag, Plus, Edit, Trash2, Loader2, AlertCircle, CheckCircle2, X, AlertTriangle, Search } from 'lucide-react';
import api from '../../services/api';
import TablePagination from '../../components/common/TablePagination';
import { getLocalTodayString, getFutureDateString } from '../../utils/discount';

export default function AdminDiscounts() {
  const [discounts, setDiscounts] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [discountToDelete, setDiscountToDelete] = useState(null);

  // Product search filter inside modal
  const [productSearchQuery, setProductSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    title: '', discountType: 'Percentage', discountValue: '', startDate: '', endDate: '', status: 'Active', productIds: []
  });

  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchData = async () => {
    try {
      const [discRes, prodRes] = await Promise.all([
        api.get('/discounts'),
        api.get('/products')
      ]);
      setDiscounts(discRes.data);
      setProducts(prodRes.data);
    } catch (err) {
      console.error("Failed to fetch data", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAdd = () => {
    setEditMode(false);
    setProductSearchQuery('');
    setFormData({
      title: '',
      discountType: 'Percentage',
      discountValue: '',
      startDate: getLocalTodayString(),
      endDate: getFutureDateString(30),
      status: 'Active',
      productIds: []
    });
    setErrorMsg('');
    setShowModal(true);
  };

  const handleOpenEdit = (disc) => {
    setEditMode(true);
    setCurrentId(disc.id);
    setProductSearchQuery('');
    const linkedFromProducts = products.filter(p => p.discountId === disc.id).map(p => p.id);
    const linkedFromDisc = disc.products ? disc.products.map(p => p.id) : [];
    const allLinkedIds = Array.from(new Set([...linkedFromDisc, ...linkedFromProducts]));

    setFormData({
      title: disc.title,
      discountType: disc.discountType,
      discountValue: disc.discountValue,
      startDate: disc.startDate ? disc.startDate.split('T')[0] : getLocalTodayString(),
      endDate: disc.endDate ? disc.endDate.split('T')[0] : getFutureDateString(30),
      status: disc.status,
      productIds: allLinkedIds
    });
    setErrorMsg('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Frontend Date Validations
    const today = getLocalTodayString();
    if (!editMode && formData.startDate < today) {
      setErrorMsg('Start date must be today or a future date.');
      return;
    }
    if (formData.endDate <= formData.startDate) {
      setErrorMsg('End date must be greater than the start date.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        discountValue: parseFloat(formData.discountValue),
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString()
      };

      if (editMode) {
        await api.put(`/discounts/${currentId}`, payload);
        setSuccessMsg('Discount updated successfully!');
      } else {
        await api.post('/discounts', payload);
        setSuccessMsg('Discount created successfully!');
      }

      setShowModal(false);
      fetchData();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to save discount.');
    } finally {
      setIsSubmitting(false);
    }
  };


  const confirmDelete = (disc) => {
    setDiscountToDelete(disc);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!discountToDelete) return;
    try {
      await api.delete(`/discounts/${discountToDelete.id}`);
      setSuccessMsg('Discount deleted successfully!');
      setShowDeleteModal(false);
      setDiscountToDelete(null);
      fetchData();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setShowDeleteModal(false);
      setErrorMsg('Failed to delete discount.');
    }
  };

  const filteredProductsForModal = products.filter(p => 
    p.name.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
    (p.brand && p.brand.toLowerCase().includes(productSearchQuery.toLowerCase()))
  );

  const paginatedDiscounts = discounts.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

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
            <Tag className="w-6 h-6 mr-3 text-blue-600" /> Discounts Management
          </h2>
          <p className="text-sm text-gray-500 mt-1">Manage promotional discounts and apply them to products.</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl transition-colors inline-flex items-center shadow-sm cursor-pointer"
        >
          <Plus className="w-5 h-5 mr-2" /> Add Discount
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

      {discounts.length === 0 ? (
        <p className="text-gray-500 text-center py-12">No discounts created yet.</p>
      ) : (
        <>
          <div className="overflow-x-auto px-8">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 text-xs uppercase tracking-wider">
                  <th className="pb-4 font-bold">Title</th>
                  <th className="pb-4 font-bold">Type & Value</th>
                  <th className="pb-4 font-bold">Validity Period</th>
                  <th className="pb-4 font-bold">Applied Products</th>
                  <th className="pb-4 font-bold">Status</th>
                  <th className="pb-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {paginatedDiscounts.map(d => (
                  <tr key={d.id} className="hover:bg-gray-50/50">
                    <td className="py-4 font-bold text-gray-900">{d.title}</td>
                    <td className="py-4 font-bold text-blue-600">
                      {d.discountValue}{d.discountType === 'Percentage' ? '%' : ' Rs'}
                    </td>
                    <td className="py-4 text-xs text-gray-500">
                      {new Date(d.startDate).toLocaleDateString()} — {new Date(d.endDate).toLocaleDateString()}
                    </td>
                    <td className="py-4 text-xs text-gray-600">
                      {(() => {
                        const linked = products.filter(p => p.discountId === d.id);
                        const displayList = linked.length > 0 ? linked : (d.products || []);
                        return displayList.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {displayList.map(p => (
                              <span key={p.id} className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md font-medium">{p.name}</span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400">None</span>
                        );
                      })()}
                    </td>
                                        <td className="py-4">
                      {(() => {
                        const todayStr = getLocalTodayString();
                        const endStr = d.endDate ? String(d.endDate).slice(0, 10) : "";
                        const isExpired = endStr && todayStr > endStr;
                        const displayStatus = isExpired ? "INACTIVE" : d.status;

                        return (
                          <span className={`font-bold text-xs px-2.5 py-1 rounded-full uppercase ${
                            displayStatus.toLowerCase() === 'active' 
                              ? 'bg-green-50 text-green-700' 
                              : 'bg-red-50 text-red-600'
                          }`}>
                            {displayStatus}
                          </span>
                        );
                      })()}
                    </td>

                    <td className="py-4 text-right space-x-2">
                      <button onClick={() => handleOpenEdit(d)} className="p-2 bg-gray-100 hover:bg-blue-50 text-gray-600 hover:text-blue-600 rounded-xl inline-flex cursor-pointer"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => confirmDelete(d)} className="p-2 bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 rounded-xl inline-flex cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <TablePagination 
            currentPage={currentPage} 
            totalItems={discounts.length} 
            rowsPerPage={rowsPerPage} 
            onPageChange={setCurrentPage} 
            onRowsPerPageChange={setRowsPerPage} 
          />
        </>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl relative border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">{editMode ? 'Edit Discount' : 'Add New Discount'}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-full cursor-pointer"><X className="w-5 h-5" /></button>
            </div>

            {errorMsg && <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm font-medium">{errorMsg}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Discount Title</label>
                <input type="text" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2.5 border rounded-xl bg-gray-50 focus:bg-white" placeholder="Summer Sale 20%" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Discount Type</label>
                  <select value={formData.discountType} onChange={(e) => setFormData({...formData, discountType: e.target.value})} className="w-full px-4 py-2.5 border rounded-xl bg-gray-50 focus:bg-white">
                    <option value="Percentage">Percentage (%)</option>
                    <option value="Fixed">Fixed Amount (Rs)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Discount Value</label>
                  <input type="number" step="0.01" required min="0" value={formData.discountValue} onChange={(e) => setFormData({...formData, discountValue: e.target.value})} className="w-full px-4 py-2.5 border rounded-xl bg-gray-50 focus:bg-white" placeholder="20" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Start Date</label>
                  <input type="date" required value={formData.startDate} onChange={(e) => setFormData({...formData, startDate: e.target.value})} className="w-full px-4 py-2.5 border rounded-xl bg-gray-50 focus:bg-white" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">End Date</label>
                  <input type="date" required value={formData.endDate} onChange={(e) => setFormData({...formData, endDate: e.target.value})} className="w-full px-4 py-2.5 border rounded-xl bg-gray-50 focus:bg-white" />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-bold text-gray-700">Apply to Products</label>
                  {/* Search Bar Right Side of Label */}
                  <div className="relative w-48">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Search products..." 
                      value={productSearchQuery}
                      onChange={(e) => setProductSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1 text-xs border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-xl p-3 space-y-2 bg-gray-50">
                  {filteredProductsForModal.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-4">No matching products found.</p>
                  ) : (
                    filteredProductsForModal.map(p => (
                      <label key={p.id} className="flex items-center space-x-3 text-sm font-medium text-gray-700 cursor-pointer">
                        <input 
                          type="checkbox"
                          checked={formData.productIds.includes(p.id)}
                          onChange={(e) => {
                            const ids = e.target.checked 
                              ? [...formData.productIds, p.id] 
                              : formData.productIds.filter(id => id !== p.id);
                            setFormData({...formData, productIds: ids});
                          }}
                          className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <span>{p.name} (Rs. {p.price})</span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors shadow-sm cursor-pointer mt-4">
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (editMode ? 'Update Discount' : 'Create Discount')}
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
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Discount</h3>
            <p className="text-sm text-gray-500 mb-6">Are you sure you want to delete <strong className="text-gray-800">{discountToDelete?.title}</strong>?</p>
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
