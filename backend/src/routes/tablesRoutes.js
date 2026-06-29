import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/",                      authMiddleware, getTables);
router.get("/:tableNumber",          authMiddleware, getTableDetail);

router.patch("/:tableNumber/clear",  authMiddleware, clearTable);

export default router;