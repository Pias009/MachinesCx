import { Schema, model, models } from "mongoose";

/** Singleton document — there is exactly one admin account, enforced by
 *  always querying/updating with { singleton: true } rather than an _id.
 *  passwordHash is "salt:hash" (scrypt), same format lib/adminCredentials.ts
 *  has always produced — only the storage location changed, not the scheme. */
export interface IAdminCredentials {
  singleton: true;
  email: string;
  passwordHash: string;
  pendingEmail?: string;       // set while an email change awaits confirmation
  pendingEmailToken?: string;  // HMAC-signed token sent to pendingEmail
  pendingEmailExpires?: Date;
  updatedAt: Date;
}

const AdminCredentialsSchema = new Schema<IAdminCredentials>({
  singleton: { type: Boolean, required: true, unique: true, default: true },
  email: { type: String, required: true },
  passwordHash: { type: String, required: true },
  pendingEmail: { type: String },
  pendingEmailToken: { type: String },
  pendingEmailExpires: { type: Date },
  updatedAt: { type: Date, default: Date.now },
});

export default models.AdminCredentials || model<IAdminCredentials>("AdminCredentials", AdminCredentialsSchema);
