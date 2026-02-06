// server/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const SESSION_SECRET =
  process.env.SESSION_SECRET || "a-new-random-and-secure-secret-key";

// Add a declaration for the request object to include our user payload
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
        fullName: string;
        assignedDoctorId?: string;
      };
    }
  }
}

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Authentication required: No token provided." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, SESSION_SECRET) as {
      id: string;
      role: string;
      fullName: string;
      assignedDoctorId?: string;
    };
    req.user = decoded; // Attach user payload to the request
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Authentication failed: Invalid token." });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Access denied: You do not have the required permissions.",
      });
    }
    next();
  };
};

export const requireAssistantRole = requireRole(["assistant"]);
