import { useEffect, useRef } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import QRCode from "react-qr-code";
import { useReactToPrint } from "react-to-print";

const MENU_URL = `${window.location.origin}/menu`;

function QRCodePage() {
  const printRef = useRef();

  const handlePrint = useReactToPrint({ content: () => printRef.current });

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">📱 QR Code Menu</h1>

      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-xl shadow p-8 text-center" ref={printRef}>
          <h2 className="text-xl font-bold text-gray-800 mb-2">🍽️ رستوران ما</h2>
          <p className="text-gray-500 text-sm mb-6">منو ما را اسکن کنید</p>

          <div className="flex justify-center mb-6">
            <QRCode value={MENU_URL} size={200} />
          </div>

          <p className="text-gray-400 text-xs">{MENU_URL}</p>
          <p className="text-gray-500 text-sm mt-2">
            Scan to view our full menu
          </p>
        </div>

        <div className="flex gap-3 mt-4">
          <button
            onClick={handlePrint}
            className="flex-1 bg-black hover:bg-gray-800 text-white py-3 rounded-xl font-semibold transition"
          >
            🖨️ Print QR Code
          </button>
          <button
            onClick={() => window.open(MENU_URL, "_blank")}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold transition"
          >
            👁️ Preview Menu
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default QRCodePage;