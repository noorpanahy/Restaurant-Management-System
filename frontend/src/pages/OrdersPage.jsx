import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import api from "../services/api";
import Receipt from "../components/Receipt";

const statusColors = {
  PENDING:     "bg-yellow-100 text-yellow-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  READY:       "bg-green-100 text-green-700",
  DELIVERED:   "bg-gray-100 text-gray-600",
  CANCELLED:   "bg-red-100 text-red-700",
};

const TABLE_COUNT = 12;

// ─── New Order Modal ──────────────────────────────────────────────────────────
function NewOrderModal({ onClose, onCreated }) {
  const [foods, setFoods]           = useState([]);
  const [search, setSearch]         = useState("");
  const [cart, setCart]             = useState([]);
  const [tableNumber, setTableNumber] = useState("");
  const [notes, setNotes]           = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState(null);

  useEffect(() => {
    api.get("/foods").then(r => setFoods(r.data)).catch(console.error);
  }, []);

  const filtered = foods.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  const addToCart = (food) => {
    setCart(prev => {
      const existing = prev.find(i => i.foodId === food.id);
      if (existing)
        return prev.map(i => i.foodId === food.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { foodId: food.id, name: food.name, price: food.price, quantity: 1 }];
    });
  };

  const updateQty = (foodId, qty) => {
    if (qty < 1) return removeFromCart(foodId);
    setCart(prev => prev.map(i => i.foodId === foodId ? { ...i, quantity: qty } : i));
  };

  const removeFromCart = (foodId) => {
    setCart(prev => prev.filter(i => i.foodId !== foodId));
  };

  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const handleSubmit = async () => {
    if (cart.length === 0) return setError("Add at least one item.");
    if (!tableNumber)      return setError("Please select a table.");
    setError(null);
    setSubmitting(true);
    try {
      await api.post("/orders", {
        items:       cart.map(i => ({ foodId: i.foodId, quantity: i.quantity })),
        tableNumber: Number(tableNumber),
        notes:       notes.trim() || undefined,
      });
      onCreated();
      onClose();
    } catch {
      setError("Failed to create order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">🛒 New Order</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>

        <div className="flex flex-1 overflow-hidden">

          {/* Left — Food picker */}
          <div className="flex-1 flex flex-col border-r overflow-hidden">
            <div className="p-4">
              <input
                type="text"
                placeholder="Search food..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <div className="overflow-y-auto flex-1 px-4 pb-4 grid grid-cols-2 gap-2 content-start">
              {filtered.map(food => (
                <button
                  key={food.id}
                  onClick={() => addToCart(food)}
                  className="bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl p-3 text-left transition"
                >
                  <p className="font-semibold text-gray-800 text-sm">{food.name}</p>
                  <p className="text-xs text-gray-400 mt-1">؋{food.price}</p>
                  {food.category && (
                    <p className="text-xs text-indigo-400 mt-1">{food.category.name}</p>
                  )}
                </button>
              ))}
              {filtered.length === 0 && (
                <p className="text-gray-400 text-sm col-span-2 text-center py-8">No items found.</p>
              )}
            </div>
          </div>

          {/* Right — Cart */}
          <div className="w-64 flex flex-col p-4 gap-3">
            <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Order Summary</p>

            {/* ✅ Table selector */}
            <div>
              <label className="text-xs text-gray-500 font-medium mb-1 block">Table *</label>
              <select
                value={tableNumber}
                onChange={e => setTableNumber(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white"
              >
                <option value="">Select table...</option>
                {Array.from({ length: TABLE_COUNT }, (_, i) => (
                  <option key={i + 1} value={i + 1}>Table {i + 1}</option>
                ))}
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="text-xs text-gray-500 font-medium mb-1 block">Notes (optional)</label>
              <input
                type="text"
                placeholder="e.g. no onions"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            {cart.length === 0 && (
              <p className="text-gray-300 text-sm text-center mt-4">Tap items to add</p>
            )}

            <div className="flex-1 overflow-y-auto space-y-2">
              {cart.map(item => (
                <div key={item.foodId} className="bg-gray-50 rounded-lg p-2">
                  <p className="text-xs font-semibold text-gray-700 truncate">{item.name}</p>
                  <p className="text-xs text-gray-400">؋{(item.price * item.quantity).toFixed(2)}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      onClick={() => updateQty(item.foodId, item.quantity - 1)}
                      className="w-6 h-6 rounded bg-gray-200 hover:bg-gray-300 text-sm font-bold"
                    >−</button>
                    <span className="text-sm font-semibold w-4 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQty(item.foodId, item.quantity + 1)}
                      className="w-6 h-6 rounded bg-gray-200 hover:bg-gray-300 text-sm font-bold"
                    >+</button>
                    <button
                      onClick={() => removeFromCart(item.foodId)}
                      className="ml-auto text-red-400 hover:text-red-600 text-xs"
                    >✕</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Total + Submit */}
            <div className="border-t pt-3 space-y-2">
              <div className="flex justify-between text-sm font-bold text-gray-800">
                <span>Total</span>
                <span>؋{total.toFixed(2)}</span>
              </div>
              {error && <p className="text-red-500 text-xs">{error}</p>}
              <button
                onClick={handleSubmit}
                disabled={submitting || cart.length === 0}
                className="w-full bg-black hover:bg-gray-800 disabled:opacity-50 text-white py-2 rounded-lg text-sm font-semibold transition"
              >
                {submitting ? "Placing..." : "Place Order"}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// ─── Orders Page ──────────────────────────────────────────────────────────────
function OrdersPage() {
  const [orders, setOrders]             = useState([]);
  const [loading, setLoading]           = useState(true);
  const [updatingId, setUpdatingId]     = useState(null);
  const [deletingId, setDeletingId]     = useState(null);
  const [receiptId, setReceiptId]       = useState(null);
  const [showNewOrder, setShowNewOrder] = useState(false);

  const fetchOrders = async () => {
    try {
      const response = await api.get("/orders");
      setOrders(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const updateStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      await api.put(`/orders/${id}/status`, { status });
      await fetchOrders();
    } catch (error) {
      console.error(error);
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteOrder = async (id) => {
    if (!confirm("Delete this order?")) return;
    setDeletingId(id);
    try {
      await api.delete(`/orders/${id}`);
      await fetchOrders();
    } catch (error) {
      console.error(error);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Orders</h1>
          <span className="text-sm text-gray-400">{orders.length} total orders</span>
        </div>
        <button
          onClick={() => setShowNewOrder(true)}
          className="bg-black hover:bg-gray-800 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition flex items-center gap-2"
        >
          + New Order
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 uppercase text-xs border-b">
                <th className="text-left p-4">ID</th>
                <th className="text-left p-4">Customer</th>
                <th className="text-left p-4">Table</th>
                <th className="text-left p-4">Items</th>
                <th className="text-left p-4">Total</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Date</th>
                <th className="text-left p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && [...Array(5)].map((_, i) => (
                <tr key={i} className="border-b animate-pulse">
                  {[...Array(8)].map((_, j) => (
                    <td key={j} className="p-4"><div className="h-4 bg-gray-200 rounded w-3/4" /></td>
                  ))}
                </tr>
              ))}

              {!loading && orders.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center text-gray-400 py-12">No orders found.</td>
                </tr>
              )}

              {!loading && orders.map((order) => (
                <tr key={order.id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-mono text-gray-500">#{order.id}</td>
                  <td className="p-4 font-medium text-gray-800">{order.user?.name || "Guest"}</td>
                  <td className="p-4 text-gray-600">
                    {order.tableNumber ? (
                      <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                        Table {order.tableNumber}
                      </span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="p-4 text-gray-500">{order.items?.length ?? 0} item(s)</td>
                  <td className="p-4 font-semibold text-gray-800">؋{order.totalPrice}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[order.status] || "bg-gray-100 text-gray-600"}`}>
                        {order.status}
                      </span>
                      <select
                        value={order.status}
                        disabled={updatingId === order.id}
                        onChange={(e) => updateStatus(order.id, e.target.value)}
                        className="border border-gray-200 text-xs p-1 rounded-lg bg-white disabled:opacity-50"
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="IN_PROGRESS">IN PROGRESS</option>
                        <option value="READY">READY</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </div>
                  </td>
                  <td className="p-4 text-gray-400 text-xs">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setReceiptId(order.id)}
                        className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1 rounded-lg text-xs font-medium transition"
                      >
                        🖨️ Receipt
                      </button>
                      <button
                        onClick={() => deleteOrder(order.id)}
                        disabled={deletingId === order.id}
                        className="bg-red-50 hover:bg-red-100 text-red-500 px-3 py-1 rounded-lg text-xs font-medium transition disabled:opacity-50"
                      >
                        {deletingId === order.id ? "..." : "🗑️ Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showNewOrder && (
        <NewOrderModal
          onClose={() => setShowNewOrder(false)}
          onCreated={fetchOrders}
        />
      )}

      {receiptId && (
        <Receipt orderId={receiptId} onClose={() => setReceiptId(null)} />
      )}
    </DashboardLayout>
  );
}

export default OrdersPage;