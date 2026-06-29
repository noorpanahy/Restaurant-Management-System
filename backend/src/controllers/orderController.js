import prisma from "../config/prisma.js";

// POST /orders
export const createOrder = async (req, res) => {
  try {
    const { items, tableNumber, notes, paymentMethod } = req.body;
    let totalPrice = 0;
    const orderItemsData = [];

    for (const item of items) {
      const food = await prisma.food.findUnique({ where: { id: item.foodId } });
      if (!food) return res.status(404).json({ message: `Food ID ${item.foodId} not found` });
      totalPrice += food.price * item.quantity;
      orderItemsData.push({ foodId: food.id, quantity: item.quantity, price: food.price });
    }

    const order = await prisma.order.create({
      data: {
        userId: req.user.id,
        totalPrice,
        tableNumber: tableNumber ? Number(tableNumber) : null,
        notes: notes || null,
        paymentMethod: paymentMethod || "CASH",
        items: { create: orderItemsData },
      },
      include: { items: true },
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /orders
export const getOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: true,
        items: { include: { food: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /orders/:id
export const getOrderById = async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        user: true,
        items: { include: { food: true } },
      },
    });
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /orders/:id/receipt
export const getOrderReceipt = async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        user: true,
        items: { include: { food: true } },
      },
    });
    if (!order) return res.status(404).json({ message: "Order not found" });

    const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax      = subtotal * 0.05;
    const total    = subtotal + tax;

    res.json({
      orderId:       order.id,
      cashier:       order.user?.name || "N/A",
      createdAt:     order.createdAt,
      tableNumber:   order.tableNumber,
      notes:         order.notes,
      paymentMethod: order.paymentMethod,
      items: order.items.map((item) => ({
        item_name:  item.food.name,
        quantity:   item.quantity,
        unit_price: item.price,
        subtotal:   item.price * item.quantity,
      })),
      subtotal: subtotal.toFixed(2),
      tax:      tax.toFixed(2),
      total:    total.toFixed(2),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT /orders/:id/status
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const order = await prisma.order.update({
      where: { id: Number(id) },
      data: { status },
    });
    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// DELETE /orders/:id
export const deleteOrder = async (req, res) => {
  try {
    await prisma.order.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /orders/kitchen
export const getKitchenOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { status: { in: ["PENDING", "IN_PROGRESS"] } },
      include: {
        items: { include: { food: true } },
      },
    });
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// PATCH /orders/:id/priority
export const togglePriority = async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: Number(req.params.id) },
    });
    const updated = await prisma.order.update({
      where: { id: Number(req.params.id) },
      data: { priority: !order.priority },
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};