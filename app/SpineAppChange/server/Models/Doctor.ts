import mongoose, { Schema, model, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IDoctor extends Document {
  email: string;
  password: string;
  fullName: string;
  role: "doctor";
  assignedMasterDoctorId?: Schema.Types.ObjectId;
  isActive: boolean;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const doctorSchema = new Schema<IDoctor>(
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
      default: "doctor",
      enum: ["doctor"],
    },
    assignedMasterDoctorId: {
      // Add this field
      type: Schema.Types.ObjectId,
      ref: "MasterDoctor",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

doctorSchema.pre<IDoctor>("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

doctorSchema.methods.comparePassword = function (
  candidatePassword: string,
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const Doctor = model<IDoctor>("Doctor", doctorSchema);
