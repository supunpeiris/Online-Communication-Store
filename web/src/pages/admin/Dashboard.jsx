import { TrendingUp, RefreshCw, DollarSign } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Top Row: Welcome Banner & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Welcome Banner */}
        <div className="lg:col-span-1 bg-blue-500 rounded-2xl p-6 text-white relative overflow-hidden flex flex-col justify-between shadow-sm">
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-1">Welcome Admin</h2>
            <p className="text-blue-100 text-sm mb-6">Check all the statistics</p>
            
            <div className="flex space-x-8">
              <div>
                <p className="text-2xl font-bold">573</p>
                <p className="text-blue-100 text-xs">New Orders</p>
              </div>
              <div>
                <p className="text-2xl font-bold">87%</p>
                <p className="text-blue-100 text-xs">Conversion</p>
              </div>
            </div>
          </div>
          {/* Decorative Circle matching theme */}
          <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-blue-400 rounded-full opacity-50 blur-2xl"></div>
        </div>

        {/* Small Stat Cards */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            title="Sales" 
            value="2358" 
            trend="+23%" 
            trendUp={true}
            icon={<TrendingUp className="w-5 h-5 text-pink-500" />} 
            bgColor="bg-pink-50"
          />
          <StatCard 
            title="Refunds" 
            value="434" 
            trend="-12%" 
            trendUp={false}
            icon={<RefreshCw className="w-5 h-5 text-purple-500" />} 
            bgColor="bg-purple-50"
          />
          <StatCard 
            title="Earnings" 
            value="$245k" 
            trend="+8%" 
            trendUp={true}
            icon={<DollarSign className="w-5 h-5 text-teal-500" />} 
            bgColor="bg-teal-50"
          />
        </div>
      </div>

      {/* Chart Area Placeholder */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 min-h-[400px]">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-gray-800">Sales Profit</h3>
          <div className="flex bg-gray-50 rounded-lg p-1">
            <button className="px-4 py-1 text-sm font-medium bg-white shadow-sm rounded-md text-gray-800">Profit</button>
            <button className="px-4 py-1 text-sm font-medium text-gray-500">Expenses</button>
          </div>
        </div>
        <div className="h-64 w-full flex items-center justify-center border-2 border-dashed border-gray-100 rounded-xl">
          <p className="text-gray-400">Chart rendering area (Recharts can go here)</p>
        </div>
      </div>
    </div>
  );
}

// Helper Component for the small stat cards
function StatCard({ title, value, trend, trendUp, icon, bgColor }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
      <div className={`w-10 h-10 rounded-full ${bgColor} flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <div>
        <div className="flex items-baseline space-x-2">
          <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${trendUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {trend}
          </span>
        </div>
        <p className="text-gray-500 text-sm mt-1">{title}</p>
      </div>
    </div>
  );
}
