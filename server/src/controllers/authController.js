import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { httpError } from "../utils/httpError.js";

const publicUser = ({ password, ...user }) => user;
const issueToken = (user) => jwt.sign({ userId: user.id }, process.env.JWT_SECRET || "development-secret", { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });

export function authController(repository) {
  return {
    register: async (req, res) => {
      const { name, email, password } = req.body;
      if (!name?.trim() || !email?.trim() || !password) throw httpError(400, "Name, email, and password are required");
      if (password.length < 6) throw httpError(400, "Password must be at least 6 characters");
      const normalizedEmail = email.trim().toLowerCase();
      if (await repository.getOne("users", { email: normalizedEmail })) throw httpError(409, "Email is already registered");
      const user = await repository.create("users", { name: name.trim(), email: normalizedEmail, password: await bcrypt.hash(password, 10) });
      res.status(201).json({ token: issueToken(user), user: publicUser(user) });
    },
    login: async (req, res) => {
      const { email, password } = req.body;
      const user = await repository.getOne("users", { email: email?.trim().toLowerCase() });
      if (!user || !(await bcrypt.compare(password || "", user.password))) throw httpError(401, "Invalid email or password");
      res.json({ token: issueToken(user), user: publicUser(user) });
    },
    me: async (req, res) => res.json({ user: publicUser(req.user) }),
  };
}
