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
      tempPassword: "pias900###",
      createdAt: new Date().toISOString(),
    },
    {
      id: "usr-editor-1",
      email: "editor@ashalinnomech.com",
      name: "Content Editor",
      role: "content_editor",
      status: "active",
      tempPassword: "editor123",
      createdAt: new Date().toISOString(),
    },
    {
      id: "usr-machine-1",
      email: "machine@ashalinnomech.com",
      name: "Machine Manager",
      role: "machine_manager",
      status: "active",
      tempPassword: "machine123",
      createdAt: new Date().toISOString(),
    },
    {
      id: "usr-analytics-1",
      email: "analytics@ashalinnomech.com",
      name: "Analytics Viewer",
      role: "analytics_viewer",
      status: "active",
      tempPassword: "viewer123",
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
      details: "Default Admin accounts & security scope initialized",
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
    const users: AdminUser[] = Array.isArray(parsed.users) ? parsed.users : DEFAULT_DB.users;

    // Ensure default role accounts exist for instant role testing if not deleted by admin
    DEFAULT_DB.users.forEach((defUser) => {
      if (!users.some((u) => u.email.toLowerCase() === defUser.email.toLowerCase())) {
        users.push(defUser);
      }
    });

    return {
      users,
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
