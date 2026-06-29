import { useEffect, useState } from "react";
import api from "../services/api";

function Analytics() {

  const [data, setData] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    topFoods: [],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const fetchData = async () => {

      try {

        const res = await api.get("/analytics");

        setData(res.data);

      } catch (error) {

        console.error("Analytics Error:", error);

      } finally {

        setLoading(false);
      }
    };

    fetchData();

  }, []);

  if (loading) {
    return <p>Loading analytics...</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-6">

      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-bold">
          Revenue
        </h2>

        <p className="text-3xl">
          ${data.totalRevenue}
        </p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-bold">
          Orders
        </h2>

        <p className="text-3xl">
          {data.totalOrders}
        </p>
      </div>

    </div>
  );
}

export default Analytics;