import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

function PinLoginPage() {
  const [pin, setPin]     = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login }         = useAuth();
  const navigate          = useNavigate();

  const handlePress = (digit) => {
    if (pin.length < 4) setPin((p) => p + digit);
  };

  const handleSubmit = async () => {
    if (pin.length !== 4) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.post("/shifts/pin-login", { pin });
      login(res.data.token, res.data.user);
      navigate("/dashboard");
    } catch {
      setError("Invalid PIN. Try again.");
      setPin("");
    } finally {
      setLoading(false);
    }
  };

  const digits = [1,2,3,4,5,6,7,8,9,"C",0,"✓"];

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-80">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
          🍽️ Staff Login
        </h1>
        <p className="text-gray-500 text-center text-sm mb-6">Enter your 4-digit PIN</p>

        {/* PIN Display */}
        <div className="flex justify-center gap-3 mb-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-2xl font-bold transition ${
                i < pin.length
                  ? "border-black bg-black text-white"
                  : "border-gray-300"
              }`}
            >
              {i < pin.length ? "●" : ""}
            </div>
          ))}
        </div>

        {error && (
          <p className="text-red-500 text-sm text-center mb-4">{error}</p>
        )}

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-3">
          {digits.map((d, i) => (
            <button
              key={i}
              onClick={() => {
                if (d === "C") setPin("");
                else if (d === "✓") handleSubmit();
                else handlePress(String(d));
              }}
              disabled={loading}
              className={`h-14 rounded-xl text-xl font-bold transition ${
                d === "✓"
                  ? "bg-black text-white hover:bg-gray-800"
                  : d === "C"
                  ? "bg-red-100 text-red-600 hover:bg-red-200"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
            >
              {d}
            </button>
          ))}
        </div>

        <p className="text-center text-gray-400 text-xs mt-4">
          <a href="/" className="underline hover:text-gray-600">
            Admin login →
          </a>
        </p>
      </div>
    </div>
  );
}

export default PinLoginPage;