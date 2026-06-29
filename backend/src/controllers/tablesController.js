import prisma from "../config/prisma.js";

// Get all unique table numbers with their current active order status
export const getTables = async (req, res) => {
  try {
    const { count } = req.query;
    const tableCount = parseInt(count) || 10; // default 10 tables

    // Get all active (non-delivered, non-cancelled) orders grouped by tableNumber
    const activeOrders = await prisma.order.findMany({
      where: {
        tableNumber: { not: null },
        status: { notIn: ["DELIVERED"] },
      },
      include: {
        items: { include: { food: true } },
        user: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Build table list
    const tables = Array.from({ length: tableCount }, (_, i) => {
      const tableNumber = i + 1;
      const orders = activeOrders.filter((o) => o.tableNumber === tableNumber);
      const isOccupied = orders.length > 0;
      const totalBill = orders.reduce((sum, o) => sum + o.totalPrice, 0);

      return {
        tableNumber,
        isOccupied,
        orders,
        totalBill: Math.round(totalBill),
      };
    });

    res.json(tables);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single table details
export const getTableDetail = async (req, res) => {
  try {
    const tableNumber = parseInt(req.params.tableNumber);

    const orders = await prisma.order.findMany({
      where: {
        tableNumber,
        status: { notIn: ["DELIVERED"] },
      },
      include: {
        items: { include: { food: true } },
        user: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const totalBill = orders.reduce((sum, o) => sum + o.totalPrice, 0);

    res.json({
      tableNumber,
      isOccupied: orders.length > 0,
      orders,
      totalBill: Math.round(totalBill),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Clear a table (mark all its active orders as DELIVERED)
export const clearTable = async (req, res) => {
  try {
    const tableNumber = parseInt(req.params.tableNumber);

    await prisma.order.updateMany({
      where: {
        tableNumber,
        status: { notIn: ["DELIVERED"] },
      },
      data: { status: "DELIVERED" },
    });


    //updated
    res.json({ message: `Table ${tableNumber} cleared successfully` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};