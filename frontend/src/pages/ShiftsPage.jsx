import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import api from "../services/api";

function ShiftsPage() {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/shifts")
      .then((res) => setShifts(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getDuration = (clockIn, clockOut) => {
    const end = clockOut ? new Date(clockOut) : new Date();
    const diff = Math.floor((end - new Date(clockIn)) / 60000);
    const h = Math.floor(diff / 60);
    const m = diff % 60;
    return `${h}h ${m}m`;
  };

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">🕐 Shift Tracking</h1>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-500 uppercase text-xs border-b">
              <th className="text-left p-4">Staff</th>
              <th className="text-left p-4">Role</th>
              <th className="text-left p-4">Clock In</th>
              <th className="text-left p-4">Clock Out</th>
              <th className="text-left p-4">Duration</th>
              <th className="text-left p-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading &&
              [...Array(5)].map((_, i) => (
                <tr key={i} className="border-b animate-pulse">
                  {[...Array(6)].map((_, j) => (
                    <td key={j} className="p-4">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                    </td>
                  ))}
                </tr>
              ))}
            {!loading && shifts.map((shift) => (
              <tr key={shift.id} className="border-b hover:bg-gray-50 transition">
                <td className="p-4 font-medium text-gray-800">{shift.user.name}</td>
                <td className="p-4">
                  <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                    {shift.user.role}
                  </span>
                </td>
                <td className="p-4 text-gray-500">
                  {new Date(shift.clockIn).toLocaleString()}
                </td>
                <td className="p-4 text-gray-500">
                  {shift.clockOut
                    ? new Date(shift.clockOut).toLocaleString()
                    : "—"}
                </td>
                <td className="p-4 text-gray-700 font-mono">
                  {getDuration(shift.clockIn, shift.clockOut)}
                </td>
                <td className="p-4">
                  {shift.clockOut ? (
                    <span className="bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded-full">
                      Ended
                    </span>
                  ) : (
                    <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full animate-pulse">
                      Active
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}

export default ShiftsPage;