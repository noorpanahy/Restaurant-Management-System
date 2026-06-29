import { useEffect, useState } from "react";
import api from "../services/api";
import {
  FaShoppingCart,
  FaDollarSign,
  FaUtensils,
  FaFire,
} from "react-icons/fa";

const statusColors = {
  PENDING:     "bg-yellow-100 text-yellow-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  COMPLETED:   "bg-green-100 text-green-700",
  CANCELLED:   "bg-red-100 text-red-700",
};

function StatCard({ icon, label, value, color }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow flex items-center gap-4">
      <div className={`p-4 rounded-full text-white text-xl ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-gray-500 text-sm">{label}</p>
        <p className="text-3xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr className="border-b animate-pulse">
      {[...Array(4)].map((_, i) => (
        <td key={i} className="p-3">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
        </td>
      ))}
    </tr>
  );
}

function DashboardPage() {

  return <DashboardStats />;
}

function DashboardStats() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get("/dashboard");
        setData(response.data);
      } catch (err) {
        console.error("Dashboard Error:", err);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = data
    ? [
        {
          icon: <FaShoppingCart />,
          label: "Total Orders",
          value: data.totalOrders,
          color: "bg-blue-500",
        },
        {
          icon: <FaDollarSign />,
          label: "Revenue",
          value: `$${data.totalRevenue}`,
          color: "bg-green-500",
        },
        {
          icon: <FaUtensils />,
          label: "Foods",
          value: data.totalFoods,
          color: "bg-purple-500",
        },
        {
          icon: <FaFire />,
          label: "Active Orders",
          value: data.activeOrders,
          color: "bg-orange-500",
        },
      ]
    : [];

  return (
    <>
      {/* Error */}
      {error && (
        <div className="bg-red-100 text-red-700 px-4 py-3 rounded-xl mb-6">
          {error}
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        {loading
          ? [...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-xl shadow animate-pulse h-24"
              />
            ))
          : stats.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Recent Orders
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-gray-500 uppercase text-xs">
                <th className="text-left p-3">ID</th>
                <th className="text-left p-3">Customer</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Total</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
              ) : data?.recentOrders?.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center text-gray-400 py-8">
                    No recent orders found.
                  </td>
                </tr>
              ) : (
                data?.recentOrders?.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-3 font-mono text-gray-600">
                      #{order.id}
                    </td>
                    <td className="p-3 font-medium text-gray-800">
                      {order.user?.name || "Guest"}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          statusColors[order.status] || "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-gray-800">
                      ${order.totalPrice}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default DashboardStats;