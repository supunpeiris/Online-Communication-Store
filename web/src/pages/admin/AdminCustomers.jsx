import { useState, useEffect } from 'react';
import { Users, Loader2, Mail, Phone } from 'lucide-react';
import api from '../../services/api';
import TablePagination from '../../components/common/TablePagination';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await api.get('/adminusers/customers');
        setCustomers(res.data);
      } catch (err) {
        console.error("Failed to load customers", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  const paginatedCustomers = customers.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

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
        <h2 className="text-xl font-bold text-gray-900 flex items-center">
          <Users className="w-6 h-6 mr-3 text-blue-600" /> Customers Management
        </h2>
        <span className="text-sm font-bold bg-blue-50 text-blue-600 px-3 py-1 rounded-full">
          {customers.length} Customers
        </span>
      </div>

      {customers.length === 0 ? (
        <p className="text-gray-500 text-center py-12">No customers found.</p>
      ) : (
        <>
          <div className="overflow-x-auto px-8">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 text-xs uppercase tracking-wider">
                  <th className="pb-4 font-bold">Name</th>
                  <th className="pb-4 font-bold">Email</th>
                  <th className="pb-4 font-bold">Phone</th>
                  <th className="pb-4 font-bold">Status</th>
                  <th className="pb-4 font-bold">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {paginatedCustomers.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50/50">
                    <td className="py-4 font-bold text-gray-900">{c.name}</td>
                    <td className="py-4 text-gray-600 flex items-center"><Mail className="w-4 h-4 mr-2 text-gray-400" />{c.email}</td>
                    <td className="py-4 text-gray-600"><Phone className="w-4 h-4 mr-2 text-gray-400 inline" />{c.phone || 'N/A'}</td>
                    <td className="py-4">
                      <span className="bg-green-50 text-green-700 font-bold text-xs px-2.5 py-1 rounded-full uppercase">{c.status}</span>
                    </td>
                    <td className="py-4 text-gray-500">{new Date(c.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <TablePagination 
            currentPage={currentPage} 
            totalItems={customers.length} 
            rowsPerPage={rowsPerPage} 
            onPageChange={setCurrentPage} 
            onRowsPerPageChange={setRowsPerPage} 
          />
        </>
      )}
    </div>
  );
}
