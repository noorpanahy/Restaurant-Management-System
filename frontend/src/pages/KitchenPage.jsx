import { useEffect, useState } from "react";
import api from "../services/api";
import DashboardLayout from "../layouts/DashboardLayout";

const statusConfig = {
  PENDING:     { label: "Pending",     color: "bg-yellow-100 border-yellow-400 text-yellow-700" },
  IN_PROGRESS: { label: "Cooking...",  color: "bg-blue-100 border-blue-400 text-blue-700" },
  READY:       { label: "Ready ✅",    color: "bg-green-100 border-green-400 text-green-700" },
};

function KitchenPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async () => {
    try {
      const res = await api.get("/orders/kitchen"); // ✅ use kitchen endpoint
      setOrders(res.data);
    } catch (err) {
      console.error("Failed to fetch kitchen orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const updateStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      await api.put(`/orders/${id}/status`, { status });
      await fetchOrders();
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">🍳 Kitchen Display</h1>
        <span className="text-sm text-gray-400 animate-pulse">
          🔄 Auto-refreshing every 5s
        </span>
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow p-6 animate-pulse h-48" />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && orders.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
          <p className="text-6xl mb-4">🎉</p>
          <p className="text-xl font-semibold">All caught up!</p>
          <p className="text-sm">No pending or in-progress orders.</p>
        </div>
      )}

      {/* Order Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {orders.map((order) => {
          const config = statusConfig[order.status] || statusConfig.PENDING;
          const isUpdating = updatingId === order.id;

          return (
            <div
              key={order.id}
              className={`bg-white rounded-xl shadow-md border-l-4 p-6 transition-all ${config.color}`}
            >
              {/* Order Header */}
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-xl font-bold text-gray-800">
                  Order #{order.id}
                </h2>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${config.color}`}>
                  {config.label}
                </span>
              </div>

              {/* Time */}
              <p className="text-xs text-gray-400 mb-4">
                🕐 {new Date(order.createdAt).toLocaleTimeString()}
              </p>

              {/* Items */}
              <ul className="mb-5 space-y-1">
                {order.items.map((item) => (
                  <li
                    key={item.id}
                    className="flex justify-between text-sm text-gray-700"
                  >
                    <span>🍽 {item.food.name}</span>
                    <span className="font-bold">× {item.quantity}</span>
                  </li>
                ))}
              </ul>

              {/* Action Buttons */}
              <div className="flex gap-2">
                {order.status === "PENDING" && (
                  <button
                    onClick={() => updateStatus(order.id, "IN_PROGRESS")}
                    disabled={isUpdating}
                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 text-white font-semibold px-3 py-2 rounded-lg transition"
                  >
                    {isUpdating ? "Updating..." : "🔥 Start Cooking"}
                  </button>
                )}
                {/*  Add inside each order card, alongside the status buttons:*/}
<button
  onClick={() => api.patch(`/orders/${order.id}/priority`).then(fetchOrders)}
  className={`px-3 py-2 rounded-lg text-sm font-semibold transition ${
    order.priority
      ? "bg-red-500 text-white"
      : "bg-gray-100 text-gray-600 hover:bg-red-50"
  }`}
>
  {order.priority ? "🔴 URGENT" : "⚑ Priority"}
</button>

{/* // And add a red border to urgent orders in the card className:*/}
<div 
className={`bg-white rounded-xl shadow-md border-l-4 p-6 transition-all ${
  order.priority ? "border-red-500 ring-2 ring-red-200" : config.color
}`}> </div>

                {order.status === "IN_PROGRESS" && (
                  <button
                    onClick={() => updateStatus(order.id, "READY")}
                    disabled={isUpdating}
                    className="flex-1 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-semibold px-3 py-2 rounded-lg transition"
                  >
                    {isUpdating ? "Updating..." : "✅ Mark Ready"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
}

export default KitchenPage;