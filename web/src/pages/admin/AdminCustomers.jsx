import { useState, useEffect, useMemo } from 'react';
import { Users, Loader2, Mail, Phone, Search, X } from 'lucide-react';
import api from '../../services/api';
import TablePagination from '../../components/common/TablePagination';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await api.get('/adminusers/customers');
        setCustomers(res.data);
      } catch (err) {
        console.error('Failed to load customers', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  // Filter customers across Name, Email, and Mobile Phone Number
  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim()) return customers;
    const query = searchQuery.toLowerCase().trim();
    return customers.filter(
      (c) =>
        c.name?.toLowerCase().includes(query) ||
        c.email?.toLowerCase().includes(query) ||
        (c.phone && c.phone.toLowerCase().includes(query))
    );
  }, [customers, searchQuery]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setCurrentPage(1);
  };

  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 bg-white rounded-2xl border border-gray-100 shadow-sm">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-8 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <Users className="w-6 h-6 mr-3 text-blue-600" /> Customers Management
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            View and search customer contact details and account history.
          </p>
        </div>
        <span className="text-xs font-bold bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full">
          {filteredCustomers.length} of {customers.length} Customers
        </span>
      </div>

      {/* Search Toolbar */}
      <div className="px-8 pb-6 pt-2">
        <div className="relative max-w-md w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, or mobile number..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-9 py-2.5 bg-gray-50 hover:bg-gray-100/70 focus:bg-white text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors font-medium text-gray-800 placeholder-gray-400"
          />
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded-full cursor-pointer"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {filteredCustomers.length === 0 ? (
        <div className="text-center py-16 px-4">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="font-bold text-gray-800 text-base">No customers found</h3>
          <p className="text-gray-400 text-xs mt-1">
            {customers.length === 0
              ? 'No customers have registered yet.'
              : 'Try adjusting your search terms.'}
          </p>
        </div>
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
                {paginatedCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 font-bold text-gray-900">{c.name}</td>
                    <td className="py-4 text-gray-600 flex items-center">
                      <Mail className="w-4 h-4 mr-2 text-gray-400 shrink-0" />
                      {c.email}
                    </td>
                    <td className="py-4 text-gray-600">
                      <Phone className="w-4 h-4 mr-2 text-gray-400 inline shrink-0" />
                      {c.phone || 'N/A'}
                    </td>
                    <td className="py-4">
                      <span className="bg-green-50 text-green-700 font-bold text-xs px-2.5 py-1 rounded-full uppercase">
                        {c.status}
                      </span>
                    </td>
                    <td className="py-4 text-gray-500">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <TablePagination
            currentPage={currentPage}
            totalItems={filteredCustomers.length}
            rowsPerPage={rowsPerPage}
            onPageChange={setCurrentPage}
            onRowsPerPageChange={setRowsPerPage}
          />
        </>
      )}
    </div>
  );
}
