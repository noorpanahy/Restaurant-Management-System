import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import api from "../services/api";

const emptyForm = { name: "", price: "", categoryId: "" };

function FoodsPage() {
  const [foods, setFoods]         = useState([]);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData]   = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError]         = useState(null);

  const fetchFoods = async () => {
    try {
      const res = await api.get("/foods");
      setFoods(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchFoods();
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        price: Number(formData.price),
        categoryId: Number(formData.categoryId),
      };

      if (editingId) {
        await api.put(`/foods/${editingId}`, payload);
      } else {
        await api.post("/foods", payload);
      }

      await fetchFoods();
      setFormData(emptyForm);
      setEditingId(null);
    } catch (err) {
      console.error(err);
      setError("Failed to save food. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (food) => {
    setEditingId(food.id);
    setFormData({
      name: food.name,
      price: food.price,
      categoryId: food.categoryId || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setError(null);
  };

  const deleteFood = async (id) => {
    if (!confirm("Delete this food item?")) return;
    setDeletingId(id);
    try {
      await api.delete(`/foods/${id}`);
      await fetchFoods();
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        🍔 Food Management
      </h1>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow rounded-xl p-6 mb-10"
      >
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          {editingId ? "✏️ Edit Food" : "➕ Add New Food"}
        </h2>

        {error && (
          <div className="bg-red-100 text-red-600 px-4 py-2 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            name="name"
            placeholder="Food Name"
            value={formData.name}
            onChange={handleChange}
            required
            className="border border-gray-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          />

          <input
            type="number"
            name="price"
            placeholder="Price ($)"
            value={formData.price}
            onChange={handleChange}
            step="0.01"
            required
            min="0"
            className="border border-gray-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          />

          {/* ✅ Category Dropdown instead of raw ID input */}
          <select
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            required
            className="border border-gray-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-black bg-white"
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-3 mt-4">
          <button
            type="submit"
            disabled={submitting}
            className="bg-black hover:bg-gray-800 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            {submitting ? "Saving..." : editingId ? "Update Food" : "Add Food"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold transition"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow p-6 animate-pulse h-40" />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && foods.length === 0 && (
        <div className="text-center text-gray-400 py-16">
          <p className="text-5xl mb-4">🍽️</p>
          <p className="text-lg font-semibold">No foods yet</p>
          <p className="text-sm">Add your first food item above</p>
        </div>
      )}

      {/* Food Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {foods.map((food) => (
          <div
            key={food.id}
            className="bg-white shadow rounded-xl p-6 flex flex-col justify-between hover:shadow-md transition"
          >
            <div>
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-xl font-bold text-gray-800">{food.name}</h2>
                <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                  {food.category?.name || "No Category"}
                </span>
              </div>
              <p className="text-2xl font-bold text-green-600 mt-2">
                ${Number(food.price).toFixed(2)}
              </p>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => handleEdit(food)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition"
              >
                ✏️ Edit
              </button>
              <button
                onClick={() => deleteFood(food.id)}
                disabled={deletingId === food.id}
                className="flex-1 bg-red-50 hover:bg-red-100 text-red-500 px-3 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
              >
                {deletingId === food.id ? "..." : "🗑️ Delete"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}

export default FoodsPage;