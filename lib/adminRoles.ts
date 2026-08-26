import fs from "fs";
import path from "path";
import crypto from "crypto";

export type AdminRole = "super_admin" | "content_editor" | "machine_manager" | "analytics_viewer";

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  status: "active" | "invited" | "disabled";
  tempPassword?: string;
  createdAt: string;
  lastLoginAt?: string;
}

export interface MagicLinkInvitation {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  tempPassword: string;
  token: string;
  status: "pending" | "accepted" | "expired";
  createdAt: string;
  expiresAt: string;
}

export interface SecurityAuditItem {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  details: string;
  ip?: string;
}

export interface RolesDatabase {
  users: AdminUser[];
  invitations: MagicLinkInvitation[];
  auditLog: SecurityAuditItem[];
}

const DATA_FILE = path.join(process.cwd(), "data", "admin-users.json");

const DEFAULT_DB: RolesDatabase = {
  users: [
    {
      id: "usr-super-1",
      email: "admin@ashalinnomech.com",
      name: "Super Admin",
      role: "super_admin",
      status: "active",
      createdAt: new Date().toISOString(),
    },
  ],
  invitations: [],
  auditLog: [
    {
      id: "aud-init",
      timestamp: new Date().toISOString(),
      actor: "System",
      action: "SYSTEM_INITIALIZED",
      details: "Default Super Admin account created with full security scope",
    },
  ],
};

export function readRolesDB(): RolesDatabase {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULT_DB, null, 2), "utf-8");
      return DEFAULT_DB;
    }
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    return {
      users: Array.isArray(parsed.users) ? parsed.users : DEFAULT_DB.users,
      invitations: Array.isArray(parsed.invitations) ? parsed.invitations : [],
      auditLog: Array.isArray(parsed.auditLog) ? parsed.auditLog : [],
    };
  } catch {
    return DEFAULT_DB;
  }
}

export function writeRolesDB(db: RolesDatabase): void {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write admin roles DB:", err);
  }
}

export function logSecurityEvent(actor: string, action: string, details: string): void {
  const db = readRolesDB();
  const entry: SecurityAuditItem = {
    id: `aud-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
    actor,
    action,
    details,
  };
  db.auditLog.unshift(entry);
  if (db.auditLog.length > 200) db.auditLog = db.auditLog.slice(0, 200);
  writeRolesDB(db);
}

export function generateTempPassword(): string {
  const bytes = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `CX-TMP-${bytes}`;
}

export function generateInviteToken(): string {
  return `mag_${crypto.randomBytes(16).toString("hex")}`;
}
