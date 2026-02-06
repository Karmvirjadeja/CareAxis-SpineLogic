import { type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";

// Add a declaration for the request object to include our user payload
declare global {
  namespace Express {
    interface Request {
      user?: { _id: string; role: string; fullName: string, assignedDoctorId?: string };
    }
  }
}

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: "Not authenticated. Please log in." });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { _id: string; role: string; fullName: string, assignedDoctorId?: string };
    req.user = payload; // Attach user info to the request object
    next();
  } catch (err) {
    return res.status(401).json({ message: "Not authenticated. Invalid token." });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden. You do not have the required role." });
    }
    next();
  };
};
