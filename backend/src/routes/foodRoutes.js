import express from "express";

import {
    getFoods,
    createFood,
    getSingleFood,
    updateFood,
    deleteFood,
  } from "../controllers/foodController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  getFoods
);

router.post(
  "/",
  authMiddleware,
  roleMiddleware("ADMIN"),
  createFood
);

router.get(
    "/:id",
    authMiddleware,
    getSingleFood
  );
  
  router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("ADMIN"),
    updateFood
  );
  
  router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("ADMIN"),
    deleteFood
  );

export default router;