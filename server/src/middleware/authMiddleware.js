import jwt from "jsonwebtoken";
import { httpError } from "../utils/httpError.js";

export function requireAuth(repository) {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization?.startsWith("Bearer ") ? req.headers.authorization.slice(7) : null;
      if (!token) throw httpError(401, "Authentication required");
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "development-secret");
      const user = await repository.getById("users", decoded.userId);
      if (!user) throw httpError(401, "Invalid token");
      req.user = user;
      next();
    } catch (error) { next(error.status ? error : httpError(401, "Invalid token")); }
  };
}
