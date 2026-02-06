// server/Routes/authRoutes.ts
import express from "express";
import jwt from "jsonwebtoken";
import { Assistant } from "../Models/Assistants.js";
import { Doctor } from "../Models/Doctor.js";
import { MasterDoctor } from "../Models/Master.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const authRouter = express.Router();
const SESSION_SECRET =
  process.env.SESSION_SECRET || "a-new-random-and-secure-secret-key";

// POST /api/auth/login
authRouter.post("/login", async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and password are required." });
  }

  try {
    const user =
      (await Assistant.findOne({ email }).select("+password")) ||
      (await Doctor.findOne({ email }).select("+password")) ||
      (await MasterDoctor.findOne({ email }).select("+password"));

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Incorrect email or password." });
    }

    // Corrected JWT Payload
    const userPayload = {
      id: user._id,
      role: user.role,
      fullName: user.fullName,
      assignedDoctorId: (user as any).assignedDoctorId?.toString(), // Include assignedDoctorId
    };

    const token = jwt.sign(userPayload, SESSION_SECRET, { expiresIn: "24h" });

    const userObject = user.toObject();
    delete (userObject as any).password;

    res.status(200).json({ token, user: userObject });
  } catch (error) {
    next(error);
  }
});

// GET /api/auth/me
authRouter.get("/me", requireAuth, async (req: any, res) => {
  try {
    let user;
    const { id, role } = req.user!;

    if (role === "assistant") {
      user = await Assistant.findById(id).select("-password");
    } else if (role === "doctor") {
      user = await Doctor.findById(id).select("-password");
    } else if (role === "masterDoctor") {
      user = await MasterDoctor.findById(id).select("-password");
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error while fetching user profile." });
  }
});

export default authRouter;
