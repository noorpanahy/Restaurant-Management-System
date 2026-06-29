import prisma from "../config/prisma.js";

const getFoods = async (req, res) => {
  try {

    const foods = await prisma.food.findMany({
      include: {
        category: true,
      },
    });

    res.json(foods);

  } catch (error) {

    res.status(500).json({
      error: error.message,
    });

  }
};

const createFood = async (req, res) => {
  try {

    const { name, price, categoryId } = req.body;

    const food = await prisma.food.create({
      data: {
        name,
        price: parseFloat(price),
        categoryId,
      },
    });

    res.status(201).json(food);

  } catch (error) {

    res.status(500).json({
      error: error.message,
    });

  }
};

const getSingleFood = async (req, res) => {
    try {
  
      const { id } = req.params;
  
      const food = await prisma.food.findUnique({
        where: {
          id: Number(id),
        },
        include: {
          category: true,
        },
      });
  
      if (!food) {
        return res.status(404).json({
          message: "Food not found",
        });
      }
  
      res.json(food);
  
    } catch (error) {
  
      res.status(500).json({
        error: error.message,
      });
  
    }
  };
  
  const updateFood = async (req, res) => {
    try {
  
      const { id } = req.params;
  
      const { name, price, categoryId } = req.body;
  
      const updatedFood = await prisma.food.update({
        where: {
          id: Number(id),
        },
        data: {
          name,
          price,
          categoryId,
        },
      });
  
      res.json(updatedFood);
  
    } catch (error) {
  
      res.status(500).json({
        error: error.message,
      });
  
    }
  };
  
  const deleteFood = async (req, res) => {
    try {
  
      const { id } = req.params;
  
      await prisma.food.delete({
        where: {
          id: Number(id),
        },
      });
  
      res.json({
        message: "Food deleted successfully",
      });
  
    } catch (error) {
  
      res.status(500).json({
        error: error.message,
      });
  
    }
  };
  export {
    getFoods,
    createFood,
    getSingleFood,
    updateFood,
    deleteFood,
  };