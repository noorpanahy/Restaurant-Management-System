// src/pages/DashboardPage.jsx

import DashboardLayout from "../layouts/DashboardLayout";
import DashboardStats from "../components/DashboardStats";

function DashboardPage() {
  return (
    <DashboardLayout>
      <h1 className="text-4xl font-bold mb-8">
        Restaurant Dashboard
      </h1>
      <DashboardStats />
    </DashboardLayout>
  );
}

export default DashboardPage;  // ✅ this line must exist