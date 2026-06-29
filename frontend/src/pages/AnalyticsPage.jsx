import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import api from "../services/api";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";

const COLORS = ["#000", "#374151", "#6B7280", "#9CA3AF", "#D1D5DB", "#1F2937", "#4B5563", "#111827"];

const ROLE_COLORS = {
  ADMIN:   "bg-purple-100 text-purple-700",
  CASHIER: "bg-blue-100 text-blue-700",
  KITCHEN: "bg-orange-100 text-orange-700",
};

function StatCard({ label, value, sub, color }) {
  return (
    <div className={`bg-white rounded-xl shadow p-5 border-l-4 ${color}`}>
      <p className="text-gray-500 text-sm">{label}</p>
      <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

function AnalyticsPage() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    api.get("/analytics")
      .then((res) => setData(res.data))
      .catch((err) => {
        console.error(err);
        setError(err.response?.data?.error || "Failed to load analytics.");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <DashboardLayout>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow p-5 animate-pulse h-24" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow p-6 animate-pulse h-72" />
          ))}
        </div>
      </DashboardLayout>
    );

  if (error)
    return (
      <DashboardLayout>
        <div className="bg-red-100 text-red-600 px-6 py-4 rounded-xl text-center">
          ⚠️ {error}
        </div>
      </DashboardLayout>
    );

  if (!data?.summary)
    return (
      <DashboardLayout>
        <div className="text-center text-gray-400 py-16">
          <p className="text-5xl mb-4">📊</p>
          <p className="text-lg font-semibold">No analytics data yet</p>
          <p className="text-sm">Data will appear once orders are placed</p>
        </div>
      </DashboardLayout>
    );

  const { summary, dailyRevenue, topItems, shifts } = data;

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">📈 Analytics & Reports</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="7-Day Revenue"
          value={`؋${summary.totalRevenue.toLocaleString()}`}
          sub="Last 7 days"
          color="border-green-500"
        />
        <StatCard
          label="Total Orders"
          value={summary.totalOrders}
          sub="Last 7 days"
          color="border-blue-500"
        />
        <StatCard
          label="Avg Order"
          value={`؋${summary.avgOrder.toLocaleString()}`}
          sub="Per order"
          color="border-purple-500"
        />
        <StatCard
          label="Cash Collected"
          value={`؋${summary.totalCash.toLocaleString()}`}
          sub={`M-Paisa: ؋${summary.totalMpaisa.toLocaleString()}`}
          color="border-yellow-500"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">📊 Daily Revenue (Last 7 Days)</h2>
          {dailyRevenue.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-16">No revenue data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dailyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(val) => [`؋${val.toLocaleString()}`, "Revenue"]} />
                <Bar dataKey="revenue" fill="#000" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">🍽️ Top Selling Items</h2>
          {topItems.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-16">No sales data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={topItems}
                  dataKey="quantity"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, quantity }) => `${name} (${quantity})`}
                >
                  {topItems.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Cash Reconciliation */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">💵 Cash Drawer Reconciliation</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
            <p className="text-sm text-green-600 font-medium">Cash Payments</p>
            <p className="text-3xl font-bold text-green-800 mt-1">؋{summary.totalCash.toLocaleString()}</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
            <p className="text-sm text-blue-600 font-medium">M-Paisa Payments</p>
            <p className="text-3xl font-bold text-blue-800 mt-1">؋{summary.totalMpaisa.toLocaleString()}</p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
            <p className="text-sm text-gray-600 font-medium">Total Collected</p>
            <p className="text-3xl font-bold text-gray-800 mt-1">؋{(summary.totalCash + summary.totalMpaisa).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Shifts Section */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800">🕐 Staff Shifts (Last 7 Days)</h2>
          <div className="flex gap-3 text-sm">
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold">
              🟢 {shifts.activeShifts} Active
            </span>
            <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-semibold">
              {shifts.totalShifts} Total
            </span>
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-semibold">
              ⏱ {shifts.totalShiftHours}h Logged
            </span>
          </div>
        </div>

        {shifts.list.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">No shifts recorded in the last 7 days</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500 uppercase text-xs border-b">
                  <th className="text-left p-3">Staff</th>
                  <th className="text-left p-3">Role</th>
                  <th className="text-left p-3">Clock In</th>
                  <th className="text-left p-3">Clock Out</th>
                  <th className="text-left p-3">Hours</th>
                  <th className="text-left p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {shifts.list.map((shift) => (
                  <tr key={shift.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium text-gray-800">{shift.userName}</td>
                    <td className="p-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ROLE_COLORS[shift.role] || "bg-gray-100 text-gray-600"}`}>
                        {shift.role}
                      </span>
                    </td>
                    <td className="p-3 text-gray-500 text-xs">{new Date(shift.clockIn).toLocaleString()}</td>
                    <td className="p-3 text-gray-500 text-xs">{shift.clockOut ? new Date(shift.clockOut).toLocaleString() : "—"}</td>
                    <td className="p-3 font-semibold text-gray-700">{shift.hoursWorked ? `${shift.hoursWorked}h` : "—"}</td>
                    <td className="p-3">
                      {shift.active ? (
                        <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">🟢 Active</span>
                      ) : (
                        <span className="bg-gray-100 text-gray-500 text-xs font-semibold px-2 py-0.5 rounded-full">Completed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default AnalyticsPage;