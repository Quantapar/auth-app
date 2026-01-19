import express from "express";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma";
export const authRouter = express.Router();
import { signupSchema, loginSchema } from "../validators/auth.validator";

authRouter.post("/signup", async (req, res) => {
  try {
    const data = signupSchema.safeParse(req.body);
    if (!data.success) {
      return res.status(400).json({ msg: "invalid input", error: true });
    }

    const { username, email, password } = data.data;
    const hashedPassword = await bcrypt.hash(password, 10);

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      return res.status(409).json({
        msg: "user already exists",
      });
    }

    await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });
    return res.status(201).json({
      message: "User created successfully",
    });
  } catch (err) {
    return res.status(500).json({
      message: "Internal server error",
    });
  }
});
