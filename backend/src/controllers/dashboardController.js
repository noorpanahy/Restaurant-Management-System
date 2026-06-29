import prisma from "../config/prisma.js";

const getDashboardStats = async (req, res) => {
  try {

    const totalOrders =
      await prisma.order.count();

    const totalFoods =
      await prisma.food.count();

    const activeOrders =
      await prisma.order.count({
        where: {
          status: {
            in: [
              "PENDING",
              "IN_PROGRESS",
            ],
          },
        },
      });


    const revenueResult =
      await prisma.order.aggregate({
        _sum: {
          totalPrice: true,
        },
      });


    const recentOrders =
      await prisma.order.findMany({
        take: 5,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          user: true,
        },
      });


    res.json({
      totalOrders,
      totalFoods,
      activeOrders,
      totalRevenue:
        revenueResult._sum.totalPrice || 0,
      recentOrders,
    });

  } catch (error) {
    console.error("FULL ERROR:");
    console.error(error);
  
    res.status(500).json({
      message: error.message,
    });
  }
  
};

export { getDashboardStats };