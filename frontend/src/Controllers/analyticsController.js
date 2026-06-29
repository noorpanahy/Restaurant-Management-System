import prisma from "../config/prisma.js";

const getAnalytics = async (req, res) => {
  try {

    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            food: true,
          },
        },
      },
    });

    let totalRevenue = 0;

    const foodCount = {};

    orders.forEach((order) => {

      totalRevenue += order.totalPrice;

      order.items.forEach((item) => {

        const name = item.food.name;

        foodCount[name] =
          (foodCount[name] || 0) +
          item.quantity;
      });
    });

    const topFoods = Object.entries(foodCount)
      .map(([name, count]) => ({
        name,
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    res.json({
      totalRevenue,
      totalOrders: orders.length,
      topFoods,
    });

  } catch (error) {

    res.status(500).json({
      error: error.message,
    });
  }
};

export { getAnalytics };