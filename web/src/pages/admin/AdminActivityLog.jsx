import { useState, useEffect } from 'react';
import { Activity, Loader2, Clock } from 'lucide-react';
import api from '../../services/api';
import TablePagination from '../../components/common/TablePagination';

export default function AdminActivityLog() {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get('/activitylog');
        setLogs(res.data);
      } catch (err) {
        console.error("Failed to fetch activity logs", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const paginatedLogs = logs.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

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
            <Activity className="w-6 h-6 mr-3 text-blue-600" /> System Activity Log
          </h2>
          <p className="text-sm text-gray-500 mt-1">Audit trail tracking all product, category, and staff management actions.</p>
        </div>
        <span className="text-sm font-bold bg-blue-50 text-blue-600 px-3 py-1 rounded-full">
          {logs.length} Actions Recorded
        </span>
      </div>

      {logs.length === 0 ? (
        <p className="text-gray-500 text-center py-12">No activity logs recorded yet.</p>
      ) : (
        <>
          <div className="overflow-x-auto px-8">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 text-xs uppercase tracking-wider">
                  <th className="pb-4 font-bold">Action</th>
                  <th className="pb-4 font-bold">Module</th>
                  <th className="pb-4 font-bold">Performed By</th>
                  <th className="pb-4 font-bold">Details</th>
                  <th className="pb-4 font-bold">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {paginatedLogs.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50/50">
                    <td className="py-4">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase ${
                        log.action === 'Created' ? 'bg-green-50 text-green-700' :
                        log.action === 'Updated' ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-700'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-4 font-bold text-gray-800">{log.module}</td>
                    <td className="py-4">
                      <div className="font-bold text-gray-900">{log.userName}</div>
                      <div className="text-xs text-gray-400">{log.userEmail} ({log.role})</div>
                    </td>
                    <td className="py-4 text-gray-600 font-medium">{log.details}</td>
                    <td className="py-4 text-gray-500 text-xs flex items-center pt-5">
                      <Clock className="w-3.5 h-3.5 mr-1 text-gray-400" />
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <TablePagination 
            currentPage={currentPage} 
            totalItems={logs.length} 
            rowsPerPage={rowsPerPage} 
            onPageChange={setCurrentPage} 
            onRowsPerPageChange={setRowsPerPage} 
          />
        </>
      )}
    </div>
  );
}
