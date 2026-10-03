import { useState, useEffect } from "react";
import {
  FolderTree,
  Plus,
  Edit,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X,
  ArrowUpDown,
} from "lucide-react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import TablePagination from "../../components/common/TablePagination";

export default function Categories() {
  const { userRole } = useAuth();
  const isAdmin = userRole === "Admin";

  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [sortOrder, setSortOrder] = useState("asc");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [categoryName, setCategoryName] = useState("");

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    categoryId: null,
    categoryName: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchCategories();
  }, []);

  const notify = (msg, type = "success") => {
    if (type === "error") {
      setError(msg);
      setSuccess("");
      setTimeout(() => setError(""), 4000);
    } else {
      setSuccess(msg);
      setError("");
      setTimeout(() => setSuccess(""), 4000);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories");
      setCategories(response.data);
    } catch (err) {
      notify("Failed to load categories.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingId(null);
    setCategoryName("");
    setShowModal(true);
  };

  const openEditModal = (category) => {
    setEditingId(category.id);
    setCategoryName(category.name);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingId) {
        const response = await api.put(`/categories/${editingId}`, {
          name: categoryName,
        });
        setCategories(
          categories.map((c) => (c.id === editingId ? response.data : c)),
        );
        notify("Category updated successfully!");
      } else {
        const response = await api.post("/categories", { name: categoryName });
        setCategories([...categories, response.data]);
        notify("Category created successfully!");
      }
      setShowModal(false);
    } catch (err) {
      notify(
        err.response?.data?.message || "Failed to save category.",
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (category) => {
    setDeleteModal({
      isOpen: true,
      categoryId: category.id,
      categoryName: category.name,
    });
  };

  const confirmDelete = async () => {
    if (!deleteModal.categoryId) return;

    setIsSubmitting(true);
    try {
      await api.delete(`/categories/${deleteModal.categoryId}`);
      setCategories(categories.filter((c) => c.id !== deleteModal.categoryId));
      notify("Category deleted successfully!");
      setDeleteModal({ isOpen: false, categoryId: null, categoryName: "" });
    } catch (err) {
      notify(
        err.response?.data?.message || "Failed to delete category.",
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleSort = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const sortedCategories = [...categories].sort((a, b) => {
    return sortOrder === "asc" ? a.id - b.id : b.id - a.id;
  });

  const paginatedCategories = sortedCategories.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage,
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 relative">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center">
            <FolderTree className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Categories</h1>
            <p className="text-sm text-gray-500">
              Manage your product catalog categories
            </p>
          </div>
        </div>

        {isAdmin && (
          <button
            onClick={openCreateModal}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium transition-colors flex items-center shadow-sm"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Category
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl flex items-center shadow-sm">
          <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-100 text-green-700 p-4 rounded-xl flex items-center shadow-sm">
          <CheckCircle2 className="w-5 h-5 mr-3 flex-shrink-0" />
          <span className="font-medium">{success}</span>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th
                    onClick={toggleSort}
                    className="p-4 font-semibold text-sm text-gray-600 cursor-pointer hover:bg-gray-200 transition-colors group w-24 select-none"
                  >
                    <div className="flex items-center space-x-1">
                      <span>ID</span>
                      <ArrowUpDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                    </div>
                  </th>
                  <th className="p-4 font-semibold text-sm text-gray-600">
                    Category Name
                  </th>
                  {isAdmin && (
                    <th className="p-4 font-semibold text-sm text-gray-600 text-right">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {paginatedCategories.length === 0 ? (
                  <tr>
                    <td
                      colSpan={isAdmin ? 3 : 2}
                      className="p-8 text-center text-gray-500"
                    >
                      No categories found.
                    </td>
                  </tr>
                ) : (
                  paginatedCategories.map((cat) => (
                    <tr
                      key={cat.id}
                      className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="p-4 text-sm text-gray-500 w-24">
                        #{cat.id}
                      </td>
                      <td className="p-4 font-medium text-gray-900">
                        {cat.name}
                      </td>

                      {isAdmin && (
                        <td className="p-4 flex justify-end space-x-2">
                          <button
                            onClick={() => openEditModal(cat)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(cat)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <TablePagination
              currentPage={currentPage}
              totalItems={categories.length}
              rowsPerPage={rowsPerPage}
              onPageChange={setCurrentPage}
              onRowsPerPageChange={setRowsPerPage}
            />
          </>
        )}
      </div>

      {/* Add / Edit Category Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">
                {editingId ? "Edit Category" : "Add New Category"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 p-2 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white"
                />
              </div>

              <div className="flex space-x-3 pt-4 border-t border-gray-50 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !categoryName.trim()}
                  className="flex-1 bg-blue-500 text-white py-2.5 rounded-lg font-medium flex justify-center items-center"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Delete Category?
            </h3>
            <p className="text-gray-500 mb-6 text-sm">
              Are you sure you want to delete "{deleteModal.categoryName}"?
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setDeleteModal({ isOpen: false })}
                className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isSubmitting}
                className="flex-1 bg-red-600 text-white py-2.5 rounded-lg font-medium flex justify-center"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
