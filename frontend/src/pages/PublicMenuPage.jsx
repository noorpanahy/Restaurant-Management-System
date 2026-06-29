import { useEffect, useState } from "react";
import api from "../services/api";

function PublicMenuPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    api.get("/public/menu")
      .then((res) => setCategories(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4 max-w-lg mx-auto">
      {/* Header */}
      <div className="text-center py-8 mb-6">
        <h1 className="text-3xl font-bold text-gray-900">🍽️ رستوران ما</h1>
        <p className="text-gray-500 text-sm mt-1">منو</p>
      </div>

      {loading && (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-4 animate-pulse h-32" />
          ))}
        </div>
      )}

      {/* Categories */}
      <div className="space-y-6">
        {categories.map((cat) => (
          <div key={cat.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="bg-black text-white px-4 py-3">
              <h2 className="font-bold text-lg">{cat.name}</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {cat.foods.map((food) => (
                <div key={food.id} className="flex justify-between items-center px-4 py-3">
                  <span className="text-gray-800 font-medium">{food.name}</span>
                  <span className="text-green-700 font-bold">
                    ؋{Number(food.price).toLocaleString()}
                  </span>
                </div>
              ))}
              {cat.foods.length === 0 && (
                <p className="text-gray-400 text-sm px-4 py-3">No items</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <p className="text-center text-gray-400 text-xs mt-8 pb-4">
        تشکر از بازدید شما 🙏
      </p>
    </div>
  );
}

export default PublicMenuPage;