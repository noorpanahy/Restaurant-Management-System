import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const emptyForm = { name: "" };

function CategoriesPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [categories, setCategories] = useState([]);
  const [formData, setFormData]     = useState(emptyForm);
  const [editingId, setEditingId]   = useState(null);
  const [loading, setLoading]       = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError]           = useState(null);

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (editingId) {
        await api.put(`/categories/${editingId}`, formData);
      } else {
        await api.post("/categories", formData);
      }
      await fetchCategories();
      setFormData(emptyForm);
      setEditingId(null);
    } catch (err) {
      console.error(err);
      setError("Failed to save category. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (category) => {
    setEditingId(category.id);
    setFormData({ name: category.name });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setError(null);
  };

  const deleteCategory = async (id) => {
    if (!confirm("Delete this category? Foods in this category may be affected.")) return;
    setDeletingId(id);
    try {
      await api.delete(`/categories/${id}`);
      await fetchCategories();
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">📂 Categories Management</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* Left — Form (ADMIN only) */}
        {isAdmin && (
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl shadow p-6 sticky top-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">
                {editingId ? "✏️ Edit Category" : "➕ New Category"}
              </h2>

              {error && (
                <div className="bg-red-100 text-red-600 px-4 py-2 rounded-lg mb-4 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <input
                  type="text"
                  placeholder="Category name"
                  value={formData.name}
                  onChange={(e) => setFormData({ name: e.target.value })}
                  required
                  className="border border-gray-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />

                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-black hover:bg-gray-800 disabled:opacity-50 text-white py-3 rounded-lg font-semibold transition"
                >
                  {submitting ? "Saving..." : editingId ? "Update Category" : "Add Category"}
                </button>

                {editingId && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold transition"
                  >
                    Cancel
                  </button>
                )}
              </form>
            </div>
          </div>
        )}

        {/* Right — Category List */}
        <div className={isAdmin ? "md:col-span-2" : "md:col-span-3"}>

          {/* Loading */}
          {loading && (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow p-5 animate-pulse h-16" />
              ))}
            </div>
          )}

          {/* Empty */}
          {!loading && categories.length === 0 && (
            <div className="bg-white rounded-xl shadow p-12 text-center text-gray-400">
              <p className="text-5xl mb-4">📂</p>
              <p className="text-lg font-semibold">No categories yet</p>
              <p className="text-sm">Add your first category from the form</p>
            </div>
          )}

          {/* List */}
          <div className="space-y-3">
            {categories.map((category, index) => (
              <div
                key={category.id}
                className="bg-white rounded-xl shadow px-6 py-4 flex items-center justify-between hover:shadow-md transition"
              >
                <div className="flex items-center gap-4">
                  <span className="text-gray-300 font-mono text-sm w-6">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-gray-800">{category.name}</p>
                    <p className="text-xs text-gray-400">ID: {category.id}</p>
                  </div>
                </div>

                {/* Edit & Delete — ADMIN only */}
                {isAdmin && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(category)}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => deleteCategory(category.id)}
                      disabled={deletingId === category.id}
                      className="bg-red-50 hover:bg-red-100 text-red-500 px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
                    >
                      {deletingId === category.id ? "..." : "🗑️ Delete"}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}

export default CategoriesPage;