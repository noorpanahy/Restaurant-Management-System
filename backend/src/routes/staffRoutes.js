import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import {
  getStaff,
  createStaff,
  updateStaff,
  deleteStaff,
} from "../controllers/staffController.js";

const router = express.Router();

router.get("/",       authMiddleware, roleMiddleware("ADMIN"), getStaff);
router.post("/",      authMiddleware, roleMiddleware("ADMIN"), createStaff);
router.put("/:id",    authMiddleware, roleMiddleware("ADMIN"), updateStaff);
router.delete("/:id", authMiddleware, roleMiddleware("ADMIN"), deleteStaff);

export default router;