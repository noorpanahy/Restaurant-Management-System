import express from "express";

import { getAnalytics } from "../Controllers/analyticsController.js";

import authMiddleware
from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  getAnalytics
);


export default router;