import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  RotateCcw, 
  Upload, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Loader2, 
  FileText, 
  ShieldCheck 
} from 'lucide-react';
import api from '../../services/api';

export default function RefundRequest() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [existingRefund, setExistingRefund] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Form states
  const [reason, setReason] = useState('');
  const [slipFile, setSlipFile] = useState(null);
  const [slipPreview, setSlipPreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchOrderData = async () => {
    try {
      const orderRes = await api.get(`/profile/orders/${id}`);
      setOrder(orderRes.data);

      try {
        const refundRes = await api.get(`/refunds/order/${id}`);
        setExistingRefund(refundRes.data);
      } catch {
        setExistingRefund(null);
      }
    } catch (err) {
      setErrorMsg('Failed to load order details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderData();
    window.scrollTo(0, 0);
  }, [id]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSlipFile(file);
      setSlipPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!slipFile) {
      setErrorMsg('Please upload a payment slip or transaction receipt.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      // Upload payment slip image to backend upload service
      const formData = new FormData();
      formData.append('file', slipFile);

      const uploadRes = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const slipUrl = uploadRes.data?.url || uploadRes.data?.filePath || uploadRes.data;

      // Submit refund request
      await api.post('/refunds', {
        orderId: parseInt(id),
        reason,
        slipUrl
      });

      setSuccessMsg('Refund request submitted successfully!');
      fetchOrderData();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit refund request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-80 bg-white rounded-3xl border border-gray-100 shadow-sm">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link to={`/profile/orders/${id}`} className="text-sm font-bold text-blue-600 hover:underline inline-flex items-center">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Order Tracking
      </Link>

      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-gray-100 pb-6">
          <div>
            <h1 className="text-2xl font-black text-gray-900 flex items-center">
              <RotateCcw className="w-6 h-6 mr-3 text-orange-500" /> Refund Request
            </h1>
            <p className="text-sm text-gray-500 mt-1">Order #{order?.orderNumber} • Paid via {order?.paymentMethod}</p>
          </div>

          <div className="text-right">
            <span className="text-xs text-gray-400 uppercase font-bold block">Refund Amount</span>
            <span className="text-2xl font-black text-orange-500">Rs. {order?.total?.toFixed(2)}</span>
          </div>
        </div>

        {errorMsg && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm font-medium border border-red-100">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="bg-green-50 text-green-700 p-4 rounded-xl mb-6 text-sm font-medium border border-green-100">
            {successMsg}
          </div>
        )}

        {/* Existing Refund Status Tracker */}
        {existingRefund ? (
          <div className="space-y-6">
            <div className={`p-6 rounded-2xl border ${
              existingRefund.status === 'Accepted'
                ? 'bg-green-50/70 border-green-200 text-green-800'
                : existingRefund.status === 'Rejected'
                ? 'bg-red-50/70 border-red-200 text-red-800'
                : 'bg-amber-50/70 border-amber-200 text-amber-800'
            }`}>
              <div className="flex items-center space-x-3 mb-2">
                {existingRefund.status === 'Accepted' && <CheckCircle2 className="w-6 h-6 text-green-600" />}
                {existingRefund.status === 'Pending' && <Clock className="w-6 h-6 text-amber-600" />}
                {existingRefund.status === 'Rejected' && <XCircle className="w-6 h-6 text-red-600" />}
                <h3 className="text-lg font-black">Refund Status: {existingRefund.status}</h3>
              </div>
              <p className="text-sm">
                {existingRefund.status === 'Pending' && 'Your refund request has been received and is being verified by our administration team.'}
                {existingRefund.status === 'Accepted' && 'Your refund has been verified and approved. Funds will be credited according to your banking cycle.'}
                {existingRefund.status === 'Rejected' && 'Your refund request was declined. Please see administrator notes below.'}
              </p>
              {existingRefund.adminNote && (
                <div className="mt-3 pt-3 border-t border-current/20 text-xs">
                  <strong>Admin Note:</strong> {existingRefund.adminNote}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                <span className="text-xs text-gray-400 font-bold uppercase block mb-1">Reason for Refund</span>
                <p className="text-sm text-gray-800 font-medium">{existingRefund.reason || 'No specific reason provided.'}</p>
                <span className="text-[11px] text-gray-400 block mt-4">Submitted on {new Date(existingRefund.createdAt).toLocaleString()}</span>
              </div>

              <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                <span className="text-xs text-gray-400 font-bold uppercase block mb-2">Submitted Payment Slip</span>
                {existingRefund.slipUrl ? (
                  <a href={existingRefund.slipUrl} target="_blank" rel="noopener noreferrer">
                    <img src={existingRefund.slipUrl} alt="Payment Slip" className="h-44 w-full object-contain rounded-xl bg-white border border-gray-200" />
                  </a>
                ) : (
                  <p className="text-xs text-gray-400 italic">No slip available.</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* New Refund Form */
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Reason for Refund Request *</label>
              <textarea
                required
                rows="3"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain why you are requesting a refund for this cancelled order..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Upload Payment Slip / Receipt *</label>
              <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center bg-gray-50/50 hover:bg-gray-50 transition-colors">
                <input
                  type="file"
                  id="slipUpload"
                  required
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="slipUpload" className="cursor-pointer flex flex-col items-center">
                  <Upload className="w-8 h-8 text-orange-500 mb-2" />
                  <span className="text-sm font-bold text-gray-800">Click to upload transaction receipt</span>
                  <span className="text-xs text-gray-400 mt-1">PNG, JPG, or PDF (Max 5MB)</span>
                </label>
              </div>

              {slipPreview && (
                <div className="mt-4 p-3 bg-white rounded-xl border border-gray-200 flex items-center space-x-3">
                  <img src={slipPreview} alt="Receipt preview" className="w-16 h-16 object-cover rounded-lg border border-gray-100" />
                  <span className="text-xs font-bold text-gray-700 truncate">{slipFile?.name}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white font-bold py-4 rounded-xl transition-colors shadow-sm flex items-center justify-center cursor-pointer text-sm"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <ShieldCheck className="w-5 h-5 mr-2" />}
              SUBMIT REFUND REQUEST (Rs. {order?.total?.toFixed(2)})
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
