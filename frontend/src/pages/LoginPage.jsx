import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import PageLoader from "../components/PageLoader";

function LoginPage() {
  const [formData, setFormData]   = useState({ email: "", password: "" });
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);
  const { login }                 = useAuth();
  const navigate                  = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.post("/auth/login", formData);
      login(res.data.user, res.data.token);
      // Show loader briefly before navigating
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch {
      setLoading(false);
      setError("Invalid email or password.");
    }
  };

  // Show full-screen loader after successful login
  if (loading && !error) return <PageLoader />;

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm">

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">🍽️ Khan Restaurant</h1>
          <p className="text-gray-400 text-sm mt-1">رستوران خان</p>
        </div>

        {error && (
          <div className="bg-red-100 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            className="border border-gray-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          />
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            className="border border-gray-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          />
          <button
            type="submit"
            className="bg-black hover:bg-gray-800 text-white py-3 rounded-lg font-bold transition mt-2"
          >
            Login
          </button>
        </form>

        <p className="text-center text-gray-400 text-xs mt-6">
          Staff?{" "}
          <a href="/pin" className="underline hover:text-gray-600">
            Use PIN login →
          </a>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;