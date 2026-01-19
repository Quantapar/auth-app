import { prisma } from "./lib/prisma";
import express from "express";
import { authRouter } from "./routes/authRoute";
await prisma.user.create({
  data: {
    username: "manu",
    email: "hehe@gmail.com",
    password: "4545",
  },
});

const app = express();
app.use(express.json());

app.use("/api/auth", authRouter);
