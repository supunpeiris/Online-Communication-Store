import { useState, useEffect } from "react";
import {
  ShieldCheck,
  Loader2,
  Plus,
  Edit2,
  Trash2,
  X,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import TablePagination from "../../components/common/TablePagination";

export default function AdminAdministration() {
  const { userRole } = useAuth();
  const isAdmin = userRole === "Admin";

  const [staffList, setStaffList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  // Custom Delete Confirmation Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "Staff",
    status: "Active",
    password: "",
  });

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchStaff = async () => {
    try {
      const res = await api.get("/adminusers/staff");
      setStaffList(res.data);
    } catch (err) {
      console.error("Failed to load staff list", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleOpenAddModal = () => {
    setEditMode(false);
    setFormData({
      name: "",
      email: "",
      phone: "",
      role: "Staff",
      status: "Active",
      password: "",
    });
    setError("");
    setShowModal(true);
  };

  const handleOpenEditModal = (staff) => {
    setEditMode(true);
    setCurrentId(staff.id);
    setFormData({
      name: staff.name,
      email: staff.email,
      phone: staff.phone || "",
      role: staff.role,
      status: staff.status,
      password: "",
    });
    setError("");
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    try {
      if (editMode) {
        await api.put(`/adminusers/${currentId}`, formData);
        setSuccessMessage("Staff member updated successfully!");
      } else {
        await api.post("/adminusers", formData);
        setSuccessMessage("Staff member created successfully!");
      }
      setShowModal(false);
      fetchStaff();
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err) {
      setError(err.response?.data?.message || "Operation failed.");
    }
  };

  const confirmDelete = (staff) => {
    setStaffToDelete(staff);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!staffToDelete) return;
    setError("");
    setSuccessMessage("");

    try {
      await api.delete(`/adminusers/${staffToDelete.id}`);
      setSuccessMessage("Staff member deleted successfully!");
      setShowDeleteModal(false);
      setStaffToDelete(null);
      fetchStaff();
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err) {
      setShowDeleteModal(false);
      setError(err.response?.data?.message || "Failed to delete user.");
    }
  };

  const paginatedStaff = staffList.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage,
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 bg-white rounded-2xl border border-gray-100 shadow-sm">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <ShieldCheck className="w-6 h-6 mr-3 text-orange-500" /> Manage
            Administration
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            View and manage system administrators and staff members.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenAddModal}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl transition-colors inline-flex items-center shadow-sm cursor-pointer"
          >
            <Plus className="w-5 h-5 mr-2" /> Add Staff Member
          </button>
        )}
      </div>

      {successMessage && (
        <div className="bg-green-50 text-green-700 p-4 rounded-xl mb-6 flex items-center text-sm font-medium border border-green-100 shadow-sm">
          <CheckCircle2 className="w-5 h-5 mr-2 flex-shrink-0 text-green-500" />
          {successMessage}
        </div>
      )}

      {error && !showModal && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 flex items-center text-sm font-medium border border-red-100 shadow-sm">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 text-red-500" />
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 text-gray-400 text-xs uppercase tracking-wider">
              <th className="pb-4 font-bold">Name</th>
              <th className="pb-4 font-bold">Email</th>
              <th className="pb-4 font-bold">Phone</th>
              <th className="pb-4 font-bold">Role</th>
              <th className="pb-4 font-bold">Status</th>
              {isAdmin && (
                <th className="pb-4 font-bold text-right">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {paginatedStaff.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50/50">
                <td className="py-4 font-bold text-gray-900">{s.name}</td>
                <td className="py-4 text-gray-600">{s.email}</td>
                <td className="py-4 text-gray-600">{s.phone || "N/A"}</td>
                <td className="py-4">
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full uppercase ${s.role === "Admin" ? "bg-purple-50 text-purple-700" : "bg-blue-50 text-blue-700"}`}
                  >
                    {s.role}
                  </span>
                </td>
                <td className="py-4">
                  <span className="bg-green-50 text-green-700 font-bold text-xs px-2.5 py-1 rounded-full uppercase">
                    {s.status}
                  </span>
                </td>
                {isAdmin && (
                  <td className="py-4 text-right space-x-2">
                    <button
                      onClick={() => handleOpenEditModal(s)}
                      className="p-2 bg-gray-100 hover:bg-blue-50 text-gray-600 hover:text-blue-600 rounded-xl transition-colors cursor-pointer inline-flex"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => confirmDelete(s)}
                      className="p-2 bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 rounded-xl transition-colors cursor-pointer inline-flex"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <TablePagination
        currentPage={currentPage}
        totalItems={staffList.length}
        rowsPerPage={rowsPerPage}
        onPageChange={setCurrentPage}
        onRowsPerPageChange={setRowsPerPage}
      />

      {/* Custom Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl text-center border border-gray-100">
            <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Delete Staff Member
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete{" "}
              <strong className="text-gray-800">{staffToDelete?.name}</strong>?
              This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl transition-colors shadow-sm cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl relative border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {editMode ? "Edit Staff Member" : "Add New Staff Member"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Staff">Staff</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Password {editMode && "(Leave blank to keep current)"}
                </label>
                <input
                  type="password"
                  required={!editMode}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors shadow-sm cursor-pointer mt-6"
              >
                {editMode ? "Update Staff Member" : "Create Staff Member"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
