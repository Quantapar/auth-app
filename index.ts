import { prisma } from "./lib/prisma";
import express from "express";
import { authRouter } from "./routes/authRoute";
const app = express();
app.use(express.json());

app.use("/api/auth", authRouter);

app.listen(3069);
