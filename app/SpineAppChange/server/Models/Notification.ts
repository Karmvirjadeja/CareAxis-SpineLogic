// server/Models/Notification.ts
import mongoose, { Document, Schema } from "mongoose";

// 1. Update the TypeScript Type to include "ASSESSMENT_COMPLETE"
export type NotificationType =
  | "EDIT_REQUEST"
  | "EDIT_APPROVED"
  | "EDIT_REJECTED"
  | "NEW_ASSESSMENT"
  | "SYSTEM"
  | "ASSESSMENT_COMPLETE"; // <--- ADD THIS

export interface INotification extends Document {
  recipientId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  type: NotificationType;
  patientId?: mongoose.Types.ObjectId;
  message: string;
  isRead: boolean;
  reason?: string;
  changes?: any; // Stores the proposed changes for edit requests
  createdAt: Date;
}

const NotificationSchema = new Schema(
  {
    recipientId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: [
        "EDIT_REQUEST",
        "EDIT_APPROVED",
        "EDIT_REJECTED",
        "NEW_ASSESSMENT",
        "SYSTEM",
        "ASSESSMENT_COMPLETE", // <--- ADD THIS TO MONGOOSE ENUM TOO
      ],
      required: true,
    },
    patientId: { type: Schema.Types.ObjectId, ref: "Patient" },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    reason: { type: String }, // For edit requests
    changes: { type: Schema.Types.Mixed }, // For edit requests
  },
  { timestamps: true },
);

export const Notification = mongoose.model<INotification>(
  "Notification",
  NotificationSchema,
);

// Helper function to create notifications easily
export const createNotification = async (
  recipientId: string | mongoose.Types.ObjectId,
  senderId: string | mongoose.Types.ObjectId,
  type: NotificationType,
  patientId: string | mongoose.Types.ObjectId | undefined,
  message: string,
  reason?: string,
  changes?: any,
) => {
  try {
    await Notification.create({
      recipientId,
      senderId,
      type,
      patientId,
      message,
      reason,
      changes,
    });
    console.log(`🔔 Notification sent: ${type} -> User ${recipientId}`);
  } catch (error) {
    console.error("Failed to create notification:", error);
  }
};
