// routes/publicRoutes.js

import express from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const router = express.Router();

// GET /api/public/menu
router.get("/menu", async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        foods: {
          where: { available: true },
          select: {
            id:    true,
            name:  true,
            price: true,
          },
          orderBy: { name: "asc" },
        },
      },
      orderBy: { name: "asc" },
    });

    res.json(categories);
  } catch (err) {
    console.error("Public menu error:", err);
    res.status(500).json({ error: "Failed to fetch menu." });
  }
});

export default router;