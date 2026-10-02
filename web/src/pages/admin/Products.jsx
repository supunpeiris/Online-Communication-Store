import { useState, useEffect } from 'react';
import { Package, Plus, Edit, Trash2, Loader2, AlertCircle, CheckCircle2, X, ArrowUpDown } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function Products() {
  const { userRole } = useAuth();
  const isAdmin = userRole === 'Admin';
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState('desc');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, name: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [editingId, setEditingId] = useState(null);
  
  // Updated state with sku and brand
  const [formData, setFormData] = useState({
    name: '', sku: '', brand: '', description: '', price: '', stockQuantity: '', categoryId: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        api.get('/products'),
        api.get('/categories')
      ]);
      setProducts(prodRes.data);
      setCategories(catRes.data);
    } catch (err) {
      notify('Failed to load data.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const notify = (msg, type = 'success') => {
    if (type === 'error') {
      setError(msg); setTimeout(() => setError(''), 4000);
    } else {
      setSuccess(msg); setTimeout(() => setSuccess(''), 4000);
    }
  };

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({ name: '', sku: '', brand: '', description: '', price: '', stockQuantity: '', categoryId: categories.length > 0 ? categories[0].id : '' });
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      sku: product.sku,
      brand: product.brand || '',
      description: product.description || '',
      price: product.price,
      stockQuantity: product.stockQuantity,
      categoryId: product.categoryId
    });
    setShowModal(true);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.categoryId) return notify('Please select a category', 'error');
    
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        stockQuantity: parseInt(formData.stockQuantity),
        categoryId: parseInt(formData.categoryId)
      };

      if (editingId) {
        const res = await api.put(`/products/${editingId}`, payload);
        setProducts(products.map(p => p.id === editingId ? res.data : p));
        notify('Product updated successfully!');
      } else {
        const res = await api.post('/products', payload);
        setProducts([...products, res.data]);
        notify('Product created successfully!');
      }
      setShowModal(false);
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to save product.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    setIsSubmitting(true);
    try {
      await api.delete(`/products/${deleteModal.id}`);
      setProducts(products.filter(p => p.id !== deleteModal.id));
      notify('Product deleted successfully!');
      setDeleteModal({ isOpen: false, id: null, name: '' });
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to delete product.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const sortedProducts = [...products].sort((a, b) => 
    sortOrder === 'asc' ? a.id - b.id : b.id - a.id
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 relative">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Products</h1>
            <p className="text-sm text-gray-500">Manage inventory and catalog items</p>
          </div>
        </div>
        
        {isAdmin && (
          <button onClick={openCreateModal} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium transition-colors flex items-center shadow-sm">
            <Plus className="w-5 h-5 mr-2" />
            Add Product
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="w-5 h-5 mr-3" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-green-50 text-green-700 p-4 rounded-xl flex items-center animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 mr-3" />
          <span className="font-medium">{success}</span>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')} className="p-4 font-semibold text-sm text-gray-600 cursor-pointer hover:bg-gray-200 group w-20">
                    <div className="flex items-center space-x-1"><span>ID</span><ArrowUpDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600" /></div>
                  </th>
                  <th className="p-4 font-semibold text-sm text-gray-600">Product Name</th>
                  <th className="p-4 font-semibold text-sm text-gray-600">SKU / Brand</th>
                  <th className="p-4 font-semibold text-sm text-gray-600">Category</th>
                  <th className="p-4 font-semibold text-sm text-gray-600">Price</th>
                  <th className="p-4 font-semibold text-sm text-gray-600">Stock</th>
                  {isAdmin && <th className="p-4 font-semibold text-sm text-gray-600 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {sortedProducts.length === 0 ? (
                  <tr><td colSpan={isAdmin ? 7 : 6} className="p-8 text-center text-gray-500">No products found.</td></tr>
                ) : (
                  sortedProducts.map((prod) => (
                    <tr key={prod.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="p-4 text-sm text-gray-500">#{prod.id}</td>
                      <td className="p-4 font-medium text-gray-900">{prod.name}</td>
                      <td className="p-4 text-sm text-gray-500">
                        <span className="block text-xs uppercase tracking-wider text-gray-400">{prod.sku}</span>
                        {prod.brand || '-'}
                      </td>
                      <td className="p-4 text-sm text-gray-600"><span className="bg-gray-100 px-3 py-1 rounded-full">{prod.categoryName}</span></td>
                      <td className="p-4 text-sm font-semibold text-gray-900">${prod.price.toFixed(2)}</td>
                      <td className="p-4 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${prod.stockQuantity > 10 ? 'bg-green-100 text-green-700' : prod.stockQuantity > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                          {prod.stockQuantity} in stock
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="p-4 flex justify-end space-x-2">
                          <button onClick={() => openEditModal(prod)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => setDeleteModal({ isOpen: true, id: prod.id, name: prod.name })} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">{editingId ? 'Edit Product' : 'Add New Product'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:bg-gray-100 p-2 rounded-full"><X className="w-4 h-4" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                  <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SKU (Optional)</label>
                  <input type="text" name="sku" placeholder="Auto-generated if blank" value={formData.sku} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                  <input type="text" name="brand" value={formData.brand} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select name="categoryId" required value={formData.categoryId} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white">
                  <option value="" disabled>Select a Category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                  <input type="number" step="0.01" name="price" required min="0" value={formData.price} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                  <input type="number" name="stockQuantity" required min="0" value={formData.stockQuantity} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea name="description" rows="3" value={formData.description} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white"></textarea>
              </div>
              
              <div className="flex space-x-3 pt-4 border-t border-gray-50 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-lg font-medium">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2.5 rounded-lg font-medium flex justify-center items-center">
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><AlertCircle className="w-8 h-8 text-red-600" /></div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Product?</h3>
            <p className="text-gray-500 mb-6 text-sm">Are you sure you want to delete "{deleteModal.name}"?</p>
            <div className="flex space-x-3">
              <button onClick={() => setDeleteModal({ isOpen: false })} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-lg font-medium">Cancel</button>
              <button onClick={confirmDelete} disabled={isSubmitting} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg font-medium flex justify-center">
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
