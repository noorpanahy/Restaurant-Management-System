import prisma from "../config/prisma.js";

export const getPublicMenu = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        foods: {
          select: {
            id: true,
            name: true,
            price: true,
          },
        },
      },
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};