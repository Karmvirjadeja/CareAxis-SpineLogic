// server/index.ts
import dotenv from "dotenv";
import path from "path"; 
dotenv.config();
import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import mongoose from "mongoose";
import http from "http";
import { WebSocketServer, WebSocket } from "ws";
import jwt from "jsonwebtoken";
import url from "url";

// Your route imports
import patientRouter from "./Routes/Routes.js";
import authRouter from "./Routes/authRoutes.js";
import doctorRouter from "./Routes/doctorRoutes.js";
import assessmentRouter from "./Routes/assessmentRoutes.js";
import userRouter from "./Routes/userRoutes.js";
import { AiCronService } from "./services/AiCronServices.js";
import aiRoutes from "./Routes/AiRoutes.js"; // Import the new file
const app = express();
const server = http.createServer(app); // Create an HTTP server

// --- Middleware ---
app.use(cors()); // Enable CORS for all API requests
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// --- WebSocket Server Setup ---
const wss = new WebSocketServer({ server });
export const assistantConnections = new Map<string, WebSocket>();

wss.on("connection", (ws, req) => {
  const parameters = url.parse(req.url!, true);
  const token = parameters.query.token as string;

  if (!token) {
    ws.close();
    return;
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
      role: string;
    };
    if (payload.role === "assistant") {
      assistantConnections.set(payload.id, ws);
      console.log(`Assistant ${payload.id} connected via WebSocket.`);
    }

    ws.on("close", () => {
      if (payload.role === "assistant") {
        assistantConnections.delete(payload.id);
        console.log(`Assistant ${payload.id} disconnected.`);
      }
    });
  } catch (error) {
    ws.close();
  }
});

(async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error(
      "FATAL ERROR: MONGODB_URI is not set in environment variables.",
    );
  }

  // --- Database Connection ---
  await mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log("MongoDB connected successfully!"))
    .catch((err) => {
      console.error("MongoDB connection error:", err);
      process.exit(1);
    });
  console.log("Welcome Guys ");
  // --- API Routes ---
  app.use("/api/auth", authRouter);
  app.use("/api/patients", patientRouter);
  app.use("/api/doctors", doctorRouter);
  app.use("/api/assessments", assessmentRouter);
  app.use("/api/users", userRouter);
  app.use("/api/aiassessments", aiRoutes);


  const clientBuildPath = path.join(__dirname, "../../client/dist"); 
app.use(express.static(clientBuildPath));

app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api")) return next();
  res.sendFile(path.join(clientBuildPath, "index.html"));
});
  // --- Centralized Error Handler ---
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || 500;
    const message = err.message || "Internal Server Error";
    console.error("SERVER ERROR:", err);
    res.status(status).json({ message });
  });

  // --- Start Server ---
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(port, () => {
    AiCronService.init(); // <--- ADD THIS LINE
    console.log(
      `API server is running and listening on http://localhost:${port}`,
    );
  });
})();
