import jwt, { type JwtPayload } from "jsonwebtoken";
const secret = process.env.SECRET_KEY ?? "aaa";
import { type Request, type Response, type NextFunction } from "express";
export function tokenvalidation(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;
  console.log(authHeader);

  if (!authHeader) {
    return res.status(401).json({
      msg: " auth header missing ",
    });
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({
      msg: "token missing",
    });
  }

  try {
    const decode = jwt.verify(token, secret) as JwtPayload;

    (req as any).userId = decode.id;
    next();
  } catch (error) {
    return res.status(401).json({
      msg: "invalid token or token missing",
    });
  }
}
