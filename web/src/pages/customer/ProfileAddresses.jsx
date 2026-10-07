import { useState, useEffect } from 'react';
import { 
  MapPin, 
  Plus, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  Loader2, 
  AlertCircle, 
  X, 
  AlertTriangle, 
  Phone, 
  Star 
} from 'lucide-react';
import api from '../../services/api';

export default function ProfileAddresses() {
  const [addresses, setAddresses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState(null);

  const [formData, setFormData] = useState({
    recipientName: '',
    phone: '',
    addressLine: '',
    city: '',
    district: '',
    province: '',
    postalCode: '',
    isDefault: false
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAddresses = async () => {
    try {
      const res = await api.get('/addresses');
      setAddresses(res.data);
    } catch (err) {
      console.error('Failed to load addresses', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleOpenAdd = () => {
    setEditMode(false);
    setFormData({
      recipientName: '',
      phone: '',
      addressLine: '',
      city: '',
      district: '',
      province: '',
      postalCode: '',
      isDefault: addresses.length === 0
    });
    setErrorMsg('');
    setShowModal(true);
  };

  const handleOpenEdit = (addr) => {
    setEditMode(true);
    setCurrentId(addr.id);
    setFormData({
      recipientName: addr.recipientName,
      phone: addr.phone,
      addressLine: addr.addressLine,
      city: addr.city,
      district: addr.district || '',
      province: addr.province || '',
      postalCode: addr.postalCode,
      isDefault: addr.isDefault
    });
    setErrorMsg('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      if (editMode) {
        await api.put(`/addresses/${currentId}`, formData);
        setSuccessMsg('Address updated successfully!');
      } else {
        await api.post('/addresses', formData);
        setSuccessMsg('Address added successfully!');
      }

      setShowModal(false);
      fetchAddresses();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to save address.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await api.put(`/addresses/${id}/set-default`);
      setSuccessMsg('Default address updated!');
      fetchAddresses();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to set default address.');
    }
  };

  const handleDelete = async () => {
    if (!addressToDelete) return;
    try {
      await api.delete(`/addresses/${addressToDelete.id}`);
      setSuccessMsg('Address removed.');
      setShowDeleteModal(false);
      setAddressToDelete(null);
      fetchAddresses();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert('Failed to delete address.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 bg-white rounded-3xl border border-gray-100 shadow-sm">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <MapPin className="w-5 h-5 mr-3 text-red-500" /> Saved Addresses
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage your delivery destinations for quick 1-click checkout.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-5 rounded-xl transition-colors inline-flex items-center shadow-sm cursor-pointer text-sm"
        >
          <Plus className="w-4 h-4 mr-2" /> Add New Address
        </button>
      </div>

      {successMsg && (
        <div className="bg-green-50 text-green-700 p-4 rounded-xl mb-6 flex items-center text-sm font-medium border border-green-100 shadow-sm">
          <CheckCircle2 className="w-5 h-5 mr-2 text-green-500" /> {successMsg}
        </div>
      )}

      {addresses.length === 0 ? (
        <div className="text-center py-16">
          <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="font-bold text-gray-900 text-lg">No addresses saved</h3>
          <p className="text-gray-500 text-sm mt-1 mb-6">
            Add a shipping destination to use during checkout.
          </p>
          <button
            onClick={handleOpenAdd}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-xl transition-colors text-sm cursor-pointer shadow-sm"
          >
            Add Address Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`p-6 rounded-2xl border transition-all relative flex flex-col justify-between ${
                addr.isDefault 
                  ? 'border-blue-300 bg-blue-50/20 shadow-xs ring-1 ring-blue-200' 
                  : 'border-gray-100 bg-gray-50/50 hover:border-gray-200'
              }`}
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-bold text-gray-900 text-base">{addr.recipientName}</h4>
                  {addr.isDefault && (
                    <span className="bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center">
                      <Star className="w-3 h-3 mr-1 fill-blue-700" /> Default
                    </span>
                  )}
                </div>

                <div className="text-sm text-gray-600 space-y-1 mb-4">
                  <p className="flex items-center text-gray-700 font-medium">
                    <Phone className="w-3.5 h-3.5 mr-2 text-gray-400" /> {addr.phone}
                  </p>
                  <p>{addr.addressLine}</p>
                  <p>
                    {addr.city}
                    {addr.district ? `, ${addr.district}` : ''}
                    {addr.province ? `, ${addr.province}` : ''}
                  </p>
                  <p className="font-bold text-gray-500 text-xs">Postal Code: {addr.postalCode}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-bold">
                {!addr.isDefault ? (
                  <button
                    onClick={() => handleSetDefault(addr.id)}
                    className="text-blue-600 hover:underline cursor-pointer"
                  >
                    Set as Default
                  </button>
                ) : (
                  <span className="text-gray-400">Primary Delivery</span>
                )}

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleOpenEdit(addr)}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-white rounded-lg transition-colors cursor-pointer"
                    title="Edit address"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => { setAddressToDelete(addr); setShowDeleteModal(true); }}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-white rounded-lg transition-colors cursor-pointer"
                    title="Delete address"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Address Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl relative border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {editMode ? 'Edit Address' : 'Add New Address'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-full cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-xs font-medium">{errorMsg}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Recipient Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.recipientName}
                    onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm border rounded-xl bg-gray-50 focus:bg-white"
                    placeholder="e.g. Supun Vidarshana"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm border rounded-xl bg-gray-50 focus:bg-white"
                    placeholder="+94 77 123 4567"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Address Line *</label>
                <input
                  type="text"
                  required
                  value={formData.addressLine}
                  onChange={(e) => setFormData({ ...formData, addressLine: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm border rounded-xl bg-gray-50 focus:bg-white"
                  placeholder="Street address, apartment, house number"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm border rounded-xl bg-gray-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Postal Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm border rounded-xl bg-gray-50 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">District</label>
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm border rounded-xl bg-gray-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Province</label>
                  <input
                    type="text"
                    value={formData.province}
                    onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm border rounded-xl bg-gray-50 focus:bg-white"
                  />
                </div>
              </div>

              <label className="flex items-center space-x-2 pt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                />
                <span className="text-xs font-bold text-gray-700">Set as default shipping address</span>
              </label>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors shadow-sm cursor-pointer mt-4 text-sm"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (editMode ? 'Update Address' : 'Save Address')}
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
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Address</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to remove this delivery address?
            </p>
            <div className="flex space-x-3">
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 bg-gray-100 font-bold py-2.5 rounded-xl cursor-pointer">Cancel</button>
              <button onClick={handleDelete} className="flex-1 bg-red-600 text-white font-bold py-2.5 rounded-xl shadow-sm cursor-pointer">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
