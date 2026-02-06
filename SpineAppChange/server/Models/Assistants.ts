import mongoose, { Schema, model, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IAssistant extends Document {
  email: string;
  password: string;
  fullName: string;
  role: "assistant";
  assignedDoctorId: Schema.Types.ObjectId;
  isActive: boolean;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const assistantSchema = new Schema<IAssistant>(
  {
    email: {
      type: String,
      required: [true, "Email is required."],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, "Password is required."],
      select: false,
    },
    fullName: {
      type: String,
      required: [true, "Full name is required."],
    },
    role: {
      type: String,
      default: "assistant",
      enum: ["assistant"],
    },
    assignedDoctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: [true, "An assistant must be assigned to a doctor."],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

assistantSchema.pre<IAssistant>("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

assistantSchema.methods.comparePassword = function (
  candidatePassword: string,
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const Assistant = model<IAssistant>("Assistant", assistantSchema);
