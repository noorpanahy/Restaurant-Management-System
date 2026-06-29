import prisma from "../config/prisma.js";

export const getAnalytics = async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // ✅ Fixed: only use valid OrderStatus enum values (no CANCELLED in schema)
    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: sevenDaysAgo },
        status: { in: ["PENDING", "IN_PROGRESS", "READY", "DELIVERED"] },
      },
      include: {
        items: { include: { food: true } },
      },
    });

    // Daily revenue
    const dailyMap = {};
    orders.forEach((order) => {
      const day = new Date(order.createdAt).toLocaleDateString("en-AF", {
        weekday: "short", month: "short", day: "numeric",
      });
      dailyMap[day] = (dailyMap[day] || 0) + order.totalPrice;
    });
    const dailyRevenue = Object.entries(dailyMap).map(([date, revenue]) => ({
      date, revenue: Math.round(revenue),
    }));

    // Top selling items
    const itemMap = {};
    orders.forEach((order) => {
      order.items.forEach((item) => {
        const name = item.food?.name || "Unknown";
        itemMap[name] = (itemMap[name] || 0) + item.quantity;
      });
    });
    const topItems = Object.entries(itemMap)
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 8);

    // Cash reconciliation
    const cashOrders   = orders.filter((o) => o.paymentMethod === "CASH" || !o.paymentMethod);
    const mpaisaOrders = orders.filter((o) => o.paymentMethod === "MPAISA");
    const totalCash    = cashOrders.reduce((s, o) => s + o.totalPrice, 0);
    const totalMpaisa  = mpaisaOrders.reduce((s, o) => s + o.totalPrice, 0);

    // Summary
    const totalRevenue = orders.reduce((s, o) => s + o.totalPrice, 0);
    const totalOrders  = orders.length;
    const avgOrder     = totalOrders ? totalRevenue / totalOrders : 0;

    // ✅ Shifts data — last 7 days
    const shifts = await prisma.shift.findMany({
      where: { clockIn: { gte: sevenDaysAgo } },
      include: { user: { select: { id: true, name: true, role: true } } },
      orderBy: { clockIn: "desc" },
    });

    const shiftSummary = shifts.map((s) => {
      const clockIn  = new Date(s.clockIn);
      const clockOut = s.clockOut ? new Date(s.clockOut) : null;
      const hoursWorked = clockOut
        ? ((clockOut - clockIn) / 1000 / 60 / 60).toFixed(1)
        : null;
      return {
        id:          s.id,
        userName:    s.user.name,
        role:        s.user.role,
        clockIn:     s.clockIn,
        clockOut:    s.clockOut,
        hoursWorked: hoursWorked ? Number(hoursWorked) : null,
        active:      !s.clockOut,
      };
    });

    const totalShiftHours = shiftSummary
      .filter((s) => s.hoursWorked)
      .reduce((sum, s) => sum + s.hoursWorked, 0);

    const activeShifts = shiftSummary.filter((s) => s.active).length;

    res.json({
      dailyRevenue,
      topItems,
      summary: {
        totalRevenue:  Math.round(totalRevenue),
        totalOrders,
        avgOrder:      Math.round(avgOrder),
        totalCash:     Math.round(totalCash),
        totalMpaisa:   Math.round(totalMpaisa),
      },
      shifts: {
        list:            shiftSummary,
        totalShiftHours: Math.round(totalShiftHours * 10) / 10,
        activeShifts,
        totalShifts:     shiftSummary.length,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};