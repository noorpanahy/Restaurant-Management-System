import express from "express";

import {
  createOrder,
  getOrders,
  getOrderById,
  getOrderReceipt,
  updateOrderStatus,
  deleteOrder,
  getKitchenOrders,
} from "../controllers/orderController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import { togglePriority } from "../controllers/orderController.js";


const router = express.Router();

// ✅ Specific routes FIRST (before /:id)
router.get("/kitchen", authMiddleware, getKitchenOrders);
router.patch("/:id/priority", authMiddleware, togglePriority);


// ✅ General routes
router.get("/", authMiddleware, getOrders);
router.post("/", authMiddleware, createOrder);

// ✅ Dynamic routes LAST
router.get("/:id", authMiddleware, getOrderById);
router.get("/:id/receipt", authMiddleware, getOrderReceipt);

// ✅ Single PUT for status update (ADMIN only)
router.put("/:id/status", authMiddleware, roleMiddleware("ADMIN","KITCHEN"), updateOrderStatus);

router.delete("/:id", authMiddleware, roleMiddleware("ADMIN"), deleteOrder);

export default router;