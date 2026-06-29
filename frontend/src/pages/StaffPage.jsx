import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const emptyForm = { name: "", email: "", password: "", role: "CASHIER" };

const roleColors = {
  ADMIN:   "bg-purple-100 text-purple-700",
  CASHIER: "bg-blue-100 text-blue-700",
  KITCHEN: "bg-orange-100 text-orange-700",
};

function StaffPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [staff, setStaff]           = useState([]);
  const [formData, setFormData]     = useState(emptyForm);
  const [editingId, setEditingId]   = useState(null);
  const [loading, setLoading]       = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError]           = useState(null);

  const fetchStaff = async () => {
    try {
      const res = await api.get("/staff");
      setStaff(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("current user:", user);
    console.log("staff list:", staff);
  }, [user, staff]);

  useEffect(() => { fetchStaff(); }, []);

  // 👇 Admins see all, others see only themselves
  const visibleStaff = isAdmin ? staff : staff.filter(m => m.id == user?.id);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (editingId) {
        const payload = { name: formData.name, email: formData.email, role: formData.role };
        if (formData.password) payload.password = formData.password;
        await api.put(`/staff/${editingId}`, payload);
      } else {
        await api.post("/staff", formData);
      }
      await fetchStaff();
      setFormData(emptyForm);
      setEditingId(null);
    } catch (err) {
      console.error(err);
      setError("Failed to save staff member. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (member) => {
    setEditingId(member.id);
    setFormData({ name: member.name, email: member.email, password: "", role: member.role });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setError(null);
  };

  const deleteStaff = async (id) => {
    if (!confirm("Delete this staff member?")) return;
    setDeletingId(id);
    try {
      await api.delete(`/staff/${id}`);
      await fetchStaff();
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  const getInitials = (name) =>
    name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "?";

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">👥 Staff Management</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* Left — Form (ADMIN only) */}
        {isAdmin && (
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl shadow p-6 sticky top-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">
                {editingId ? "✏️ Edit Staff" : "➕ Add Staff"}
              </h2>

              {error && (
                <div className="bg-red-100 text-red-600 px-4 py-2 rounded-lg mb-4 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="border border-gray-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="border border-gray-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
                <input
                  type="password"
                  name="password"
                  placeholder={editingId ? "New password (leave blank to keep)" : "Password"}
                  value={formData.password}
                  onChange={handleChange}
                  required={!editingId}
                  className="border border-gray-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="border border-gray-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-black bg-white"
                >
                  <option value="CASHIER">Cashier</option>
                  <option value="KITCHEN">Kitchen</option>
                  <option value="ADMIN">Admin</option>
                </select>

                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-black hover:bg-gray-800 disabled:opacity-50 text-white py-3 rounded-lg font-semibold transition mt-1"
                >
                  {submitting ? "Saving..." : editingId ? "Update Staff" : "Add Staff"}
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

        {/* Right — Staff List */}
        <div className={isAdmin ? "md:col-span-2" : "md:col-span-3"}>

          {/* Stats — ADMIN only */}
          {isAdmin && !loading && (
            <div className="grid grid-cols-3 gap-4 mb-6">
              {["ADMIN", "CASHIER", "KITCHEN"].map((role) => (
                <div key={role} className="bg-white rounded-xl shadow p-4 text-center">
                  <p className="text-2xl font-bold text-gray-800">
                    {staff.filter((s) => s.role === role).length}
                  </p>
                  <p className={`text-xs font-semibold mt-1 px-2 py-1 rounded-full inline-block ${roleColors[role]}`}>
                    {role}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow p-5 animate-pulse h-20" />
              ))}
            </div>
          )}

          {/* Empty */}
          {!loading && visibleStaff.length === 0 && (
            <div className="bg-white rounded-xl shadow p-12 text-center text-gray-400">
              <p className="text-5xl mb-4">👤</p>
              <p className="text-lg font-semibold">No staff members found</p>
            </div>
          )}

          {/* Staff Cards */}
          <div className="space-y-3">
            {visibleStaff.map((member) => (
              <div
                key={member.id}
                className="bg-white rounded-xl shadow px-6 py-4 flex items-center justify-between hover:shadow-md transition"
              >
                {/* Avatar + Info */}
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm">
                    {getInitials(member.name)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{member.name}</p>
                    <p className="text-xs text-gray-400">{member.email}</p>
                  </div>
                </div>

                {/* Role + Actions */}
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${roleColors[member.role] || "bg-gray-100 text-gray-600"}`}>
                    {member.role}
                  </span>

                  {/* Edit & Delete — ADMIN only */}
                  {isAdmin && (
                    <>
                      <button
                        onClick={() => handleEdit(member)}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => deleteStaff(member.id)}
                        disabled={deletingId === member.id}
                        className="bg-red-50 hover:bg-red-100 text-red-500 px-3 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
                      >
                        {deletingId === member.id ? "..." : "🗑️ Delete"}
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}

export default StaffPage;