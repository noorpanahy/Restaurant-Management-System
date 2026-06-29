import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { getTables, getTableDetail, clearTable } from "../controllers/tablesController.js";

const router = express.Router();

router.get("/",                      authMiddleware, getTables);
router.get("/:tableNumber",          authMiddleware, getTableDetail);
//new update
router.patch("/:tableNumber/clear",  authMiddleware, clearTable);

export default router;