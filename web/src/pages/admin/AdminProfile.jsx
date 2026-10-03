import { useState, useEffect } from 'react';
import { User, Lock, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function AdminProfile() {
  const { token } = useAuth();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [passwords, setPasswords] = useState({ newPassword: '', confirmPassword: '' });
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getUserIdFromToken = () => {
    if (!token) return 1;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return parseInt(payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || payload.sub || 1);
    } catch {
      return 1;
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userId = getUserIdFromToken();
        const res = await api.get(`/profile/${userId}`);
        setUser(res.data);
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setStatusMsg({ type: '', text: '' });

    if (passwords.newPassword !== passwords.confirmPassword) {
      setStatusMsg({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    setIsSubmitting(true);
    try {
      const userId = getUserIdFromToken();
      await api.post('/profile/admin-update-password', { userId, newPassword: passwords.newPassword });
      setStatusMsg({ type: 'success', text: 'Password updated successfully!' });
      setPasswords({ newPassword: '', confirmPassword: '' });
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update password.' });
    } finally {
      setIsSubmitting(false);
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
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Account Details Card */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
          <User className="w-5 h-5 mr-3 text-blue-600" /> Administrator Profile Details
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Full Name</span>
            <span className="font-bold text-gray-900 text-lg">{user?.name || 'N/A'}</span>
          </div>
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Role</span>
            <span className="font-bold text-purple-600 text-lg uppercase">{user?.role || 'Admin'}</span>
          </div>
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 sm:col-span-2">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Email Address</span>
            <span className="font-bold text-gray-900 text-lg">{user?.email}</span>
          </div>
        </div>
      </div>

      {/* Simple Change Password Card */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center">
          <Lock className="w-5 h-5 mr-3 text-orange-500" /> Change Password
        </h2>
        <p className="text-sm text-gray-500 mb-6">Update your account password securely.</p>

        {statusMsg.text && (
          <div className={`p-4 rounded-xl mb-6 flex items-center text-sm font-medium ${statusMsg.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
            {statusMsg.type === 'error' ? <AlertCircle className="w-5 h-5 mr-2 shrink-0" /> : <CheckCircle2 className="w-5 h-5 mr-2 shrink-0 text-green-500" />}
            {statusMsg.text}
          </div>
        )}

        <form onSubmit={handlePasswordUpdate} className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">New Password</label>
            <input 
              type="password" 
              required 
              value={passwords.newPassword}
              onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Confirm New Password</label>
            <input 
              type="password" 
              required 
              value={passwords.confirmPassword}
              onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-sm cursor-pointer inline-flex items-center"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
}
