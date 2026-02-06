import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Assistant } from "../Models/Assistants.js";
import { Doctor } from "../Models/Doctor.js";
import { MasterDoctor } from "../Models/Master.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const authRouter = express.Router();

authRouter.post("/login", async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }
  try {
    let user =
      (await Assistant.findOne({ email }).select("+password")) ||
      (await Doctor.findOne({ email }).select("+password")) ||
      (await MasterDoctor.findOne({ email }).select("+password"));

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Incorrect email or password." });
    }

    const userPayload = {
      _id: user._id.toString(),
      role: user.role,
      fullName: user.fullName,
      assignedDoctorId: (user as any).assignedDoctorId?.toString(),
    };

    const token = jwt.sign(userPayload, process.env.JWT_SECRET!, {
      expiresIn: '24h',
    });

    const userObject = user.toObject();
    delete (userObject as any).password;
    
    res.status(200).json({ user: userObject, token });
  } catch (error) {
    next(error);
  }
});

authRouter.get("/me", requireAuth, async (req, res) => {
  res.status(200).json(req.user);
});

authRouter.post("/logout", (req, res) => {
  res.status(200).json({ message: "Logged out successfully." });
});

export default authRouter;
