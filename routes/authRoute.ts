import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
export const authRouter = express.Router();
import { signupSchema, loginSchema } from "../validators/auth.validator";
import { tokenvalidation } from "../middleware/token";
const secret = process.env.SECRET_KEY ?? "aaa";

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
        error: true,
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
      error: true,
    });
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const data = loginSchema.safeParse(req.body);
    if (!data.success) {
      return res.status(400).json({ msg: "invalid input ", error: true });
    }
    const { email, password } = data.data;
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        password: true,
      },
    });
    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }
    const comapre = await bcrypt.compare(password, user.password);
    if (!comapre) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign({ id: user.id }, secret, {
      expiresIn: "30d",
    });
    return res.status(200).json({
      message: "Login successful",
      token,
    });
  } catch (error) {
    return res.status(500).json({ msg: "internal server error" });
  }
});

authRouter.get("/user", tokenvalidation, async (req, res) => {
  const userId = (req as any).userId;
  if (!userId) {
    return res.status(401).json({ msg: "token missing" });
  }
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  res.json({ msg: "user info below", info: user });
});
