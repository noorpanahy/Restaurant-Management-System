import prisma from "../config/prisma.js";
import bcrypt from "bcryptjs";

export const getStaff = async (req, res) => {
  try {
    const staff = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
    res.json(staff);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createStaff = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashed, role },
      select: { id: true, name: true, email: true, role: true },
    });
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateStaff = async (req, res) => {
  try {
    const { name, email, role } = req.body;
    const user = await prisma.user.update({
      where: { id: Number(req.params.id) },
      data: { name, email, role },
      select: { id: true, name: true, email: true, role: true },
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteStaff = async (req, res) => {
  try {
    await prisma.user.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: "Staff deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};