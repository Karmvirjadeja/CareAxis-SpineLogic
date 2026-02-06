import { Router } from "express";
import { Assistant } from "../Models/Assistants.js";
import { Doctor } from "../Models/Doctor.js";
import { MasterDoctor } from "../Models/Master.js";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";
import { insertUserSchema } from "../schema.js";

const router = Router();

// GET /api/users
router.get("/", requireAuth, async (req, res) => {
  try {
    const doctors = await Doctor.find().lean();
    const assistants = await Assistant.find().lean();
    const masterDoctors = await MasterDoctor.find().lean();
    res.status(200).json([...doctors, ...assistants, ...masterDoctors]);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users." });
  }
});

// POST /api/users
router.post(
  "/",
  requireAuth,
  requireRole(["masterDoctor", "doctor"]),
  async (req: any, res) => {
    try {
      const creatingUser = req.user!;
      const validation = insertUserSchema.safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({
          message: "Invalid user data",
          errors: validation.error.issues,
        });
      }

      const {
        email,
        password,
        fullName,
        role,
        assignedDoctorId,
        assignedMasterDoctorId,
      } = validation.data as any;

      const existingUser =
        (await Assistant.findOne({ email })) ||
        (await Doctor.findOne({ email })) ||
        (await MasterDoctor.findOne({ email }));

      if (existingUser) {
        return res
          .status(409)
          .json({ message: "An account with this email already exists." });
      }

      let newUser;

      if (creatingUser.role === "doctor") {
        if (role !== "assistant") {
          return res
            .status(403)
            .json({ message: "Doctors can only create assistants." });
        }
        newUser = new Assistant({
          email,
          password,
          fullName,
          assignedDoctorId: creatingUser.id,
        });
      } else if (creatingUser.role === "masterDoctor") {
        switch (role) {
          case "assistant":
            if (!assignedDoctorId)
              return res.status(400).json({
                message: "An assistant must be assigned to a doctor.",
              });
            newUser = new Assistant({
              email,
              password,
              fullName,
              assignedDoctorId,
            });
            break;
          case "doctor":
            newUser = new Doctor({
              email,
              password,
              fullName,
              assignedMasterDoctorId: assignedMasterDoctorId || creatingUser.id,
            });
            break;
          case "masterDoctor":
            newUser = new MasterDoctor({ email, password, fullName });
            break;
          default:
            return res.status(400).json({ message: "Invalid role specified." });
        }
      } else {
        return res
          .status(403)
          .json({ message: "You do not have permission to create users." });
      }

      await newUser.save();

      const userResponse = newUser.toObject();
      delete (userResponse as any).password;

      res
        .status(201)
        .json({ message: "User created successfully!", user: userResponse });
    } catch (error) {
      console.error("Error during user creation:", error);
      res.status(500).json({ message: "An internal server error occurred." });
    }
  },
);

export default router;
