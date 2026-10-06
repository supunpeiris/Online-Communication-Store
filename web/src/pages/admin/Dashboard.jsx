import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  XCircle, 
  DollarSign, 
  Package, 
  Users, 
  AlertTriangle, 
  Loader2 
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function Dashboard() {
  const { token } = useAuth();
  const [userName, setUserName] = useState('Admin');
  const [metrics, setMetrics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (token) {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const userId = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || payload.sub;
          const userRes = await api.get(`/profile/${userId}`).catch(() => null);
          if (userRes?.data?.name) {
            setUserName(userRes.data.name);
          }
        }

        const statsRes = await api.get('/analytics/dashboard');
        setMetrics(statsRes.data);
      } catch (err) {
        console.error("Failed to load dashboard metrics", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [token]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-80 bg-white rounded-3xl border border-gray-100 shadow-sm">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Section: Welcome Banner & KPI Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Welcome Card */}
        <div className="lg:col-span-1 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl p-7 text-white relative overflow-hidden flex flex-col justify-between shadow-sm">
          <div className="relative z-10">
            <h2 className="text-2xl font-black mb-1">Welcome back, {userName}!</h2>
            <p className="text-blue-100 text-xs mb-8">Here is your store summary for today.</p>
            
            <div className="flex space-x-8">
              <div>
                <p className="text-3xl font-black">{metrics?.totalOrders || 0}</p>
                <p className="text-blue-100 text-xs font-semibold uppercase tracking-wider mt-0.5">Total Orders</p>
              </div>
              <div>
                <p className="text-3xl font-black">{metrics?.conversionRate || 0}%</p>
                <p className="text-blue-100 text-xs font-semibold uppercase tracking-wider mt-0.5">Completion</p>
              </div>
            </div>
          </div>
          <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-blue-400 rounded-full opacity-30 blur-2xl pointer-events-none"></div>
        </div>

        {/* Dynamic Metric Cards */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            title="Total Revenue" 
            value={`Rs. ${(metrics?.totalRevenue || 0).toLocaleString()}`} 
            trend="Live" 
            trendUp={true}
            icon={<DollarSign className="w-5 h-5 text-teal-600" />} 
            bgColor="bg-teal-50"
          />
          <StatCard 
            title="Active Customers" 
            value={metrics?.totalCustomers || 0} 
            trend="Registered" 
            trendUp={true}
            icon={<Users className="w-5 h-5 text-blue-600" />} 
            bgColor="bg-blue-50"
          />
          <StatCard 
            title="Cancelled Orders" 
            value={metrics?.cancelledOrders || 0} 
            trend="Total" 
            trendUp={false}
            icon={<XCircle className="w-5 h-5 text-red-500" />} 
            bgColor="bg-red-50"
          />
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h3 className="text-lg font-black text-gray-900">Revenue Performance</h3>
            <p className="text-xs text-gray-400 mt-0.5">Daily gross sales recorded over the past 7 days</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl">
              <TrendingUp className="w-4 h-4 mr-1.5" /> 7-Day Sales Trend
            </span>
            {metrics?.lowStockCount > 0 && (
              <span className="flex items-center text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-xl">
                <AlertTriangle className="w-4 h-4 mr-1.5" /> {metrics.lowStockCount} Low Stock
              </span>
            )}
          </div>
        </div>

        {/* Recharts Area Chart */}
        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={metrics?.salesTimeline || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12, fill: '#94a3b8' }} 
                axisLine={false} 
                tickLine={false} 
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#94a3b8' }} 
                axisLine={false} 
                tickLine={false} 
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="sales" 
                stroke="#2563eb" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#salesGradient)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, trend, trendUp, icon, bgColor }) {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
      <div className={`w-11 h-11 rounded-2xl ${bgColor} flex items-center justify-center mb-4 shadow-xs`}>
        {icon}
      </div>
      <div>
        <div className="flex items-baseline justify-between mb-1">
          <h3 className="text-2xl font-black text-gray-900 truncate">{value}</h3>
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg ${trendUp ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
            {trend}
          </span>
        </div>
        <p className="text-gray-400 text-xs font-semibold">{title}</p>
      </div>
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 text-white text-xs rounded-xl p-3 shadow-xl space-y-1">
        <p className="font-bold text-gray-300">{label}</p>
        <p className="text-blue-400 font-black text-sm">Rs. {payload[0].value.toFixed(2)}</p>
        <p className="text-gray-400 text-[10px]">{payload[0].payload.orders} order(s)</p>
      </div>
    );
  }
  return null;
}
