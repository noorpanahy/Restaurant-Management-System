import { BrowserRouter, Routes, Route } from "react-router-dom";

import LoginPage           from "./pages/LoginPage";
import DashboardPage       from "./pages/DashboardPage";
import FoodsPage           from "./pages/FoodsPage";
import OrdersPage          from "./pages/OrdersPage";
import KitchenPage         from "./pages/KitchenPage";
import CategoriesPage      from "./pages/CategoriesPage";
import StaffPage           from "./pages/StaffPage";
import AnalyticsPage       from "./pages/AnalyticsPage";
import PublicMenuPage      from "./pages/PublicMenuPage";
import QRCodePage          from "./pages/QRCodePage";
import TablesPage          from "./pages/TablesPage";
import PinLoginPage        from "./pages/PinLoginPage";
import ShiftsPage          from "./pages/ShiftsPage";
import ProtectedRoute      from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/"     element={<LoginPage />} />
        <Route path="/pin"  element={<PinLoginPage />} />
        <Route path="/menu" element={<PublicMenuPage />} />

        {/* Protected */}
        <Route path="/dashboard"  element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/foods"      element={<ProtectedRoute><FoodsPage /></ProtectedRoute>} />
        <Route path="/orders"     element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
        <Route path="/kitchen"    element={<ProtectedRoute><KitchenPage /></ProtectedRoute>} />
        <Route path="/categories" element={<ProtectedRoute><CategoriesPage /></ProtectedRoute>} />
        <Route path="/staff"      element={<ProtectedRoute><StaffPage /></ProtectedRoute>} />
        <Route path="/analytics"  element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
        <Route path="/qrcode"     element={<ProtectedRoute><QRCodePage /></ProtectedRoute>} />
        <Route path="/tables"     element={<ProtectedRoute><TablesPage /></ProtectedRoute>} />
        <Route path="/shifts"     element={<ProtectedRoute><ShiftsPage /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;