import { Schema, model, models } from "mongoose";

export interface IAdminUser {
  id: string;
  email: string;
  password?: string;
  name: string;
  role: string;
  status: string;
  isSuperAdmin?: boolean;
  hidden?: boolean;
  locked?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const AdminUserSchema = new Schema<IAdminUser>({
  id: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  name: { type: String, required: true },
  role: { type: String, required: true, default: "super_admin" },
  status: { type: String, default: "active" },
  isSuperAdmin: { type: Boolean, default: false },
  hidden: { type: Boolean, default: false },
  locked: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default models.AdminUser || model<IAdminUser>("AdminUser", AdminUserSchema);
