import prisma from "../config/prisma.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const pinLogin = async (req, res) => {
  try {
    const { pin } = req.body;
    const users = await prisma.user.findMany({ where: { pin: { not: null } } });
    const user = users.find((u) => u.pin === pin);
    if (!user) return res.status(401).json({ message: "Invalid PIN" });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    // Auto clock in
    await prisma.shift.create({ data: { userId: user.id } });

    res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const clockOut = async (req, res) => {
  try {
    const shift = await prisma.shift.findFirst({
      where: { userId: req.user.id, clockOut: null },
      orderBy: { clockIn: "desc" },
    });
    if (!shift) return res.status(404).json({ message: "No active shift" });

    const updated = await prisma.shift.update({
      where: { id: shift.id },
      data: { clockOut: new Date() },
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getShifts = async (req, res) => {
  try {
    const shifts = await prisma.shift.findMany({
      include: { user: { select: { name: true, role: true } } },
      orderBy: { clockIn: "desc" },
      take: 50,
    });
    res.json(shifts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const setPin = async (req, res) => {
  try {
    const { pin } = req.body;
    if (pin.length !== 4) return res.status(400).json({ message: "PIN must be 4 digits" });
    await prisma.user.update({
      where: { id: Number(req.params.id) },
      data: { pin },
    });
    res.json({ message: "PIN set successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};