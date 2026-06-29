import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import { pinLogin, clockOut, getShifts, setPin } from "../controllers/shiftController.js";

const router = express.Router();

router.post("/pin-login",     pinLogin);
router.post("/clock-out",     authMiddleware, clockOut);
router.get("/",               authMiddleware, roleMiddleware("ADMIN"), getShifts);
router.put("/:id/pin",        authMiddleware, roleMiddleware("ADMIN"), setPin);

export default router;