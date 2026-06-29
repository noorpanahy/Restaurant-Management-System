import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import {
  FaHome,
  FaUtensils,
  FaShoppingCart,
  FaSignOutAlt,
  FaBars,
  FaChartLine,
  FaUsers,
  FaThList,
  FaTable,
  FaClock,
  FaQrcode,
  FaFire,
  FaMoon,
  FaSun,
} from "react-icons/fa";

const navItems = [
  { to: "/dashboard", icon: <FaHome />, label: "Dashboard" },
  { to: "/foods", icon: <FaUtensils />, label: "Foods" },
  { to: "/orders", icon: <FaShoppingCart />, label: "Orders" },
  { to: "/tables", icon: <FaTable />, label: "Tables" },
  { to: "/kitchen", icon: <FaFire />, label: "Kitchen" },
  { to: "/categories", icon: <FaThList />, label: "Categories" },
  { to: "/staff", icon: <FaUsers />, label: "Staff" },
  { to: "/shifts", icon: <FaClock />, label: "Shifts" },
  { to: "/analytics", icon: <FaChartLine />, label: "Analytics" },
  { to: "/qrcode", icon: <FaQrcode />, label: "QR Menu" },
];

function DashboardLayout({ children }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("theme") === "dark");

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-950">

      {/* BACKDROP (mobile only) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed z-50 top-0 left-0 h-full bg-black dark:bg-gray-900 text-white
          transition-transform duration-300 w-64
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* TOP */}
        <div className="p-5 border-b border-gray-700 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(false)} className="md:hidden">
            ✕
          </button>
          <span className="font-bold text-lg">Restaurant</span>
        </div>

        {/* NAV */}
        <nav className="p-4 flex flex-col gap-1">
          {navItems.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 p-3 rounded transition
                ${isActive ? "bg-gray-700" : "hover:bg-gray-800"}`
              }
            >
              {icon}
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* LOGOUT */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 text-red-400"
          >
            <FaSignOutAlt />
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col ml-0 md:ml-64">

        {/* HEADER */}
        <header className="flex justify-between items-center px-4 md:px-8 py-4 bg-white dark:bg-gray-900 shadow">

          {/* MOBILE MENU BUTTON */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden"
          >
            <FaBars />
          </button>

          {/* USER */}
          <div>
            <h2 className="text-lg md:text-xl font-bold text-gray-800 dark:text-white">
              {user?.name ?? "Admin"}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {user?.role ?? "Staff"}
            </p>
          </div>

          {/* DARK MODE */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded bg-gray-200 dark:bg-gray-700"
          >
            {darkMode ? <FaSun className="text-yellow-400" /> : <FaMoon />}
          </button>
        </header>

        {/* CONTENT */}
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}

export default DashboardLayout;