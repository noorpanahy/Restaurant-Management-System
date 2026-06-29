import { useEffect, useState } from "react";
import api from "../services/api";

const PAYMENT_METHODS = {
  CASH: { label: "Cash", icon: "💵", color: "bg-green-100 text-green-700 border-green-300" },
  MPAISA: { label: "M-Paisa", icon: "📱", color: "bg-blue-100 text-blue-700 border-blue-300" },
};

const Receipt = ({ orderId, onClose }) => {
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [cashGiven, setCashGiven] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    api
      .get(`/orders/${orderId}/receipt`)
      .then((res) => setReceipt(res.data))
      .catch((err) => {
        console.error(err);
        setError("Failed to load receipt.");
      })
      .finally(() => setLoading(false));
  }, [orderId]);

  const handlePrint = () => window.print();

  const change = cashGiven
    ? Math.max(0, Number(cashGiven) - Number(receipt?.total))
    : 0;

  if (loading)
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
        <div className="bg-white rounded-xl p-8 flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600">Loading receipt...</p>
        </div>
      </div>
    );

  if (error || !receipt)
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
        <div className="bg-white rounded-xl p-8 flex flex-col items-center gap-4">
          <p className="text-red-500 font-semibold">{error || "Receipt not found."}</p>
          <button onClick={onClose} className="bg-gray-200 px-4 py-2 rounded-lg text-sm">
            Close
          </button>
        </div>
      </div>
    );

  return (
    <div className="fixed inset-0 bg-black/60 flex flex-col items-center justify-center z-50 p-4">
      <div className="flex flex-col md:flex-row gap-4 w-full max-w-2xl">

        {/* Left — Payment Panel (hidden on print) */}
        {!confirmed && (
          <div className="bg-white rounded-xl shadow-2xl p-6 md:w-72 print:hidden flex flex-col gap-4">
            <h3 className="text-lg font-bold text-gray-800">💳 Payment</h3>

            {/* Total Due */}
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-500">Total Due</p>
              <p className="text-3xl font-bold text-gray-900">
                ؋{Number(receipt.total).toLocaleString()}
              </p>
            </div>

            {/* Payment Method */}
            <div>
              <p className="text-sm text-gray-500 mb-2 font-medium">Payment Method</p>
              <div className="flex gap-2">
                {Object.entries(PAYMENT_METHODS).map(([key, val]) => (
                  <button
                    key={key}
                    onClick={() => setPaymentMethod(key)}
                    className={`flex-1 py-2 px-3 rounded-lg border-2 text-sm font-semibold transition ${paymentMethod === key
                        ? val.color + " border-current"
                        : "border-gray-200 text-gray-500 hover:border-gray-300"
                      }`}
                  >
                    {val.icon} {val.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Cash Given (only for cash) */}
            {paymentMethod === "CASH" && (
              <div>
                <p className="text-sm text-gray-500 mb-2 font-medium">Cash Given (؋)</p>
                <input
                  type="number"
                  placeholder="e.g. 500"
                  value={cashGiven}
                  onChange={(e) => setCashGiven(e.target.value)}
                  className="w-full border border-gray-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-lg"
                />
                {cashGiven && Number(cashGiven) >= Number(receipt.total) && (
                  <div className="mt-2 bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                    <p className="text-xs text-green-600">Change to return</p>
                    <p className="text-2xl font-bold text-green-700">
                      ؋{change.toLocaleString()}
                    </p>
                  </div>
                )}
                {cashGiven && Number(cashGiven) < Number(receipt.total) && (
                  <div className="mt-2 bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                    <p className="text-xs text-red-600">Still owed</p>
                    <p className="text-2xl font-bold text-red-700">
                      ؋{(Number(receipt.total) - Number(cashGiven)).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* M-Paisa info */}
            {paymentMethod === "MPAISA" && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <p className="text-2xl mb-1">📱</p>
                <p className="text-sm font-semibold text-blue-700">M-Paisa Number</p>
                <p className="text-lg font-bold text-blue-900">0700 000 000</p>
                <p className="text-xs text-blue-600 mt-1">
                  Ask customer to send ؋{Number(receipt.total).toLocaleString()}
                </p>
              </div>
            )}

            {/* Confirm Payment */}
            <button
              onClick={() => setConfirmed(true)}
              disabled={
                paymentMethod === "CASH" &&
                (!cashGiven || Number(cashGiven) < Number(receipt.total))
              }
              className="w-full bg-black hover:bg-gray-800 disabled:opacity-40 text-white py-3 rounded-lg font-bold transition"
            >
              ✅ Confirm Payment
            </button>
          </div>
        )}

        {/* Right — Receipt */}
        <div
          id="printable-receipt"
          className="bg-white rounded-xl shadow-2xl p-6 font-mono text-sm text-gray-800 w-80 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="text-center mb-4">
            <h2 className="text-xl font-bold">🍽️ رستوران ما</h2>
            <p className="text-gray-500 text-xs">My Restaurant</p>
            <p className="text-gray-500 text-xs">کابل، افغانستان</p>
            <p className="text-gray-500 text-xs">+93 700 000 000</p>
          </div>

          <div className="border-t border-dashed border-gray-300 my-3" />

          {/* Order Meta */}
          <div className="space-y-1 mb-3">
            <div className="flex justify-between">
              <span className="text-gray-500">نمبر سفارش:</span>
              <span className="font-semibold">#{receipt.orderId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">کاشیر:</span>
              <span>{receipt.cashier || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">تاریخ:</span>
              <span>{new Date(receipt.createdAt).toLocaleString("fa-AF")}</span>
            </div>
            {confirmed && (
              <div className="flex justify-between">
                <span className="text-gray-500">پرداخت:</span>
                <span className="font-semibold">
                  {PAYMENT_METHODS[paymentMethod].icon} {PAYMENT_METHODS[paymentMethod].label}
                </span>
              </div>
            )}
          </div>

          <div className="border-t border-dashed border-gray-300 my-3" />

          {/* Items */}
          <table className="w-full text-xs mb-3">
            <thead>
              <tr className="text-gray-500 border-b border-dashed border-gray-300">
                <th className="text-left py-1">آیتم</th>
                <th className="text-center">تعداد</th>
                <th className="text-right">قیمت</th>
                <th className="text-right">جمع</th>
              </tr>
            </thead>
            <tbody>
              {receipt.items.map((item, index) => (
                <tr key={index} className="border-b border-gray-100">
                  <td className="py-1">{item.item_name}</td>
                  <td className="text-center">{item.quantity}</td>
                  <td className="text-right">؋{Number(item.unit_price).toLocaleString()}</td>
                  <td className="text-right">؋{Number(item.subtotal).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="border-t border-dashed border-gray-300 my-3" />

          {/* Totals */}
          <div className="space-y-1 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>مجموع فرعی</span>
              <span>؋{Number(receipt.subtotal).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>مالیه (5٪)</span>
              <span>؋{Number(receipt.tax).toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-bold text-base mt-2 text-gray-900">
              <span>مجموع کل</span>
              <span>؋{Number(receipt.total).toLocaleString()}</span>
            </div>

            {/* Cash change on receipt */}
            {confirmed && paymentMethod === "CASH" && cashGiven && (
              <>
                <div className="flex justify-between text-gray-500">
                  <span>پول داده شده</span>
                  <span>؋{Number(cashGiven).toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-green-700">
                  <span>باقی پول</span>
                  <span>؋{change.toLocaleString()}</span>
                </div>
              </>
            )}
          </div>

          <div className="border-t border-dashed border-gray-300 my-3" />

          {/* Payment confirmed badge */}
          {confirmed && (
            <div className={`text-center py-2 px-4 rounded-lg mb-3 text-sm font-semibold border ${PAYMENT_METHODS[paymentMethod].color}`}>
              {PAYMENT_METHODS[paymentMethod].icon} پرداخت شد — {PAYMENT_METHODS[paymentMethod].label}
            </div>
          )}

          {/* Footer */}
          <div className="text-center text-gray-400 text-xs">
            <p>تشکر از شما! 🙏</p>
            <p>دوباره تشریف بیاورید</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-4 print:hidden">
        {confirmed && (
          <button
            onClick={handlePrint}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition"
          >
            🖨️ Print Receipt
          </button>
        )}
        <button
          onClick={onClose}
          className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg font-semibold transition"
        >
          ✕ Close
        </button>
      </div>
    </div>
  );
};

export default Receipt;