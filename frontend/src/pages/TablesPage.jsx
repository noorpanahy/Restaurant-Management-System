import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import api from "../services/api";

const STATUS_COLORS = {
  PENDING:     "bg-yellow-100 text-yellow-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  READY:       "bg-green-100 text-green-700",
  DELIVERED:   "bg-gray-100 text-gray-500",
};

function TableCard({ table, onClear, onSelect }) {
  const { tableNumber, isOccupied, orders, totalBill } = table;

  return (
    <div
      onClick={() => isOccupied && onSelect(table)}
      className={`rounded-xl shadow p-5 flex flex-col gap-3 transition cursor-pointer border-2
        ${isOccupied
          ? "bg-white border-black hover:shadow-md"
          : "bg-gray-50 border-transparent opacity-70 cursor-default"
        }`}
    >
      {/* Table number + status */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Table {tableNumber}</h2>
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
          isOccupied ? "bg-black text-white" : "bg-gray-200 text-gray-500"
        }`}>
          {isOccupied ? "🔴 Occupied" : "🟢 Free"}
        </span>
      </div>

      {/* Order summary */}
      {isOccupied ? (
        <>
          <div className="space-y-1">
            {orders.map((order) => (
              <div key={order.id} className="flex justify-between text-sm">
                <span className="text-gray-600">Order #{order.id}</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[order.status]}`}>
                  {order.status}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t pt-3 flex justify-between items-center">
            <span className="text-lg font-bold text-green-700">
              ؋{totalBill.toLocaleString()}
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); onClear(tableNumber); }}
              className="bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold px-3 py-1.5 rounded-lg transition"
            >
              ✓ Clear Table
            </button>
          </div>
        </>
      ) : (
        <p className="text-sm text-gray-400">No active orders</p>
      )}
    </div>
  );
}

function TableDetailModal({ table, onClose, onClear }) {
  if (!table) return null;
  const { tableNumber, orders, totalBill } = table;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">Table {tableNumber} — Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">×</button>
        </div>

        <div className="p-6 space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="border rounded-xl p-4">
              <div className="flex justify-between items-center mb-3">
                <span className="font-semibold text-gray-700">Order #{order.id}</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[order.status]}`}>
                  {order.status}
                </span>
              </div>

              {/* Items */}
              <div className="space-y-1 mb-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm text-gray-600">
                    <span>{item.food?.name} × {item.quantity}</span>
                    <span>؋{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-2 flex justify-between text-sm font-semibold">
                <span>Order Total</span>
                <span className="text-green-700">؋{Math.round(order.totalPrice).toLocaleString()}</span>
              </div>

              {order.notes && (
                <p className="text-xs text-gray-400 mt-2">📝 {order.notes}</p>
              )}
            </div>
          ))}

          {/* Grand total */}
          <div className="bg-gray-50 rounded-xl p-4 flex justify-between items-center">
            <span className="font-bold text-gray-700">Total Bill</span>
            <span className="text-2xl font-bold text-green-700">؋{totalBill.toLocaleString()}</span>
          </div>
        </div>

        <div className="p-6 border-t flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold transition"
          >
            Close
          </button>
          <button
            onClick={() => { onClear(tableNumber); onClose(); }}
            className="flex-1 bg-black hover:bg-gray-800 text-white py-3 rounded-xl font-semibold transition"
          >
            ✓ Clear Table
          </button>
        </div>
      </div>
    </div>
  );
}

function TablesPage() {
  const [tables, setTables]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [selected, setSelected]   = useState(null);
  const [clearing, setClearing]   = useState(null);

  const fetchTables = () => {
    setLoading(true);
    api.get("/tables?count=12")
      .then((res) => setTables(res.data))
      .catch((err) => {
        console.error(err);
        setError("Failed to load tables.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTables();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchTables, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleClear = async (tableNumber) => {
    if (!confirm(`Clear table ${tableNumber} and mark all orders as delivered?`)) return;
    setClearing(tableNumber);
    try {
      await api.patch(`/tables/${tableNumber}/clear`);
      await fetchTables();
    } catch (err) {
      console.error(err);
      alert("Failed to clear table.");
    } finally {
      setClearing(null);
    }
  };

  const occupiedCount = tables.filter((t) => t.isOccupied).length;
  const freeCount     = tables.filter((t) => !t.isOccupied).length;

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">🪑 Table Management</h1>
        <button
          onClick={fetchTables}
          className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow p-4 text-center border-l-4 border-black">
          <p className="text-gray-500 text-sm">Total Tables</p>
          <p className="text-3xl font-bold text-gray-900">{tables.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4 text-center border-l-4 border-red-500">
          <p className="text-gray-500 text-sm">Occupied</p>
          <p className="text-3xl font-bold text-red-600">{occupiedCount}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4 text-center border-l-4 border-green-500">
          <p className="text-gray-500 text-sm">Free</p>
          <p className="text-3xl font-bold text-green-600">{freeCount}</p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-100 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm text-center">
          {error}
        </div>
      )}

      {/* Loading skeletons */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow p-5 animate-pulse h-36" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {tables.map((table) => (
            <TableCard
              key={table.tableNumber}
              table={table}
              onClear={handleClear}
              onSelect={setSelected}
            />
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <TableDetailModal
        table={selected}
        onClose={() => setSelected(null)}
        onClear={handleClear}
      />
    </DashboardLayout>
  );
}

export default TablesPage;