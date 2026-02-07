import mongoose, { Schema, model, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IMasterDoctor extends Document {
  email: string;
  password: string;
  fullName: string;
  role: "masterDoctor";
  isActive: boolean;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const masterDoctorSchema = new Schema<IMasterDoctor>(
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
      default: "masterDoctor",
      enum: ["masterDoctor"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

masterDoctorSchema.pre<IMasterDoctor>("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

masterDoctorSchema.methods.comparePassword = function (
  candidatePassword: string,
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const MasterDoctor = model<IMasterDoctor>(
  "MasterDoctor",
  masterDoctorSchema,
);
