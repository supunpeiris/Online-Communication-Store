import { useState, useEffect } from "react";
import {
  User,
  Lock,
  Mail,
  ShieldCheck,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

export default function ProfileDashboard() {
  const { token } = useAuth();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: "", text: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getUserIdFromToken = () => {
    if (!token) return 1;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return parseInt(
        payload[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
        ] ||
          payload.sub ||
          1,
      );
    } catch {
      return 1;
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = getUserIdFromToken();
        const res = await api.get(`/profile/${userId}`);
        setUser(res.data);
        setEmail(res.data.email);
      } catch (err) {
        console.error("Failed to load user profile", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMsg({ type: "", text: "" });

    try {
      await api.post("/profile/request-otp", { email });
      setStep(2);
      setStatusMsg({
        type: "success",
        text: "OTP code has been sent to your email!",
      });
    } catch (err) {
      setStatusMsg({
        type: "error",
        text: err.response?.data?.message || "Failed to send OTP.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyAndChange = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMsg({ type: "", text: "" });

    try {
      await api.post("/profile/verify-change-password", {
        email,
        otp,
        newPassword,
      });
      setStatusMsg({ type: "success", text: "Password successfully updated!" });
      setStep(1);
      setOtp("");
      setNewPassword("");
      setShowPassword(false);
    } catch (err) {
      setStatusMsg({
        type: "error",
        text: err.response?.data?.message || "Invalid or expired OTP.",
      });
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
    <div className="space-y-8">
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
          <User className="w-5 h-5 mr-3 text-blue-600" /> Account Details
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">
              Full Name
            </span>
            <span className="font-bold text-gray-900 text-lg">
              {user?.name || "N/A"}
            </span>
          </div>
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">
              Phone Number
            </span>
            <span className="font-bold text-gray-900 text-lg">
              {user?.phone || "N/A"}
            </span>
          </div>
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 sm:col-span-2">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">
              Email Address
            </span>
            <span className="font-bold text-gray-900 text-lg">
              {user?.email}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center">
          <Lock className="w-5 h-5 mr-3 text-orange-500" /> Change Password
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          We will send a 6-digit verification OTP code to your registered email.
        </p>

        {statusMsg.text && (
          <div
            className={`p-4 rounded-xl mb-6 text-sm font-medium ${statusMsg.type === "error" ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}
          >
            {statusMsg.text}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleRequestOtp} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Confirm Email for OTP
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-sm cursor-pointer inline-flex items-center"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : (
                <Mail className="w-5 h-5 mr-2" />
              )}
              Send OTP Code
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyAndChange} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Enter 6-digit OTP Code
              </label>
              <input
                type="text"
                maxLength="6"
                required
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 tracking-widest font-bold text-center text-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-4 pr-11 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer focus:outline-none transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-sm cursor-pointer inline-flex items-center"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  <ShieldCheck className="w-5 h-5 mr-2" />
                )}
                Verify & Change Password
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setShowPassword(false);
                }}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 px-4 rounded-xl transition-colors cursor-pointer"
              >
                Back
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
