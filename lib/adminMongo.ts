import { connectDB } from "@/lib/mongodb";
import { AdminUser, MagicLinkInvitation, normalizeAdminRole } from "@/lib/adminRoles";

export async function getMongoDb() {
  const mongoose = await connectDB();
  if (!mongoose.connection.db) {
    throw new Error("MongoDB connection database instance is not available");
  }
  return mongoose.connection.db;
}

/** Upsert an admin user in the MongoDB Atlas adminusers collection */
export async function upsertMongoAdminUser(user: Partial<AdminUser> & { email: string; password?: string }) {
  try {
    const db = await getMongoDb();
    const cleanEmail = user.email.trim().toLowerCase();
    const now = new Date();

    const updateDoc: Record<string, any> = {
      email: cleanEmail,
      updatedAt: now,
    };

    if (user.id) updateDoc.id = user.id;
    if (user.name) updateDoc.name = user.name;
    if (user.role) updateDoc.role = normalizeAdminRole(user.role);
    if (user.status) updateDoc.status = user.status;
    if (user.password) {
      updateDoc.password = user.password.trim();
      updateDoc.tempPassword = user.password.trim();
    } else if (user.tempPassword) {
      updateDoc.password = user.tempPassword.trim();
      updateDoc.tempPassword = user.tempPassword.trim();
    }
    if (user.lastLoginAt) updateDoc.lastLoginAt = user.lastLoginAt;

    if (updateDoc.role === "super_admin") {
      updateDoc.isSuperAdmin = true;
    }

    await db.collection("adminusers").updateOne(
      { email: cleanEmail },
      {
        $set: updateDoc,
        $setOnInsert: {
          createdAt: user.createdAt || now.toISOString(),
        },
      },
      { upsert: true }
    );
    return true;
  } catch (err) {
    console.error("Failed to upsert user in MongoDB Atlas:", err);
    return false;
  }
}

/** Find an admin user in MongoDB Atlas by email */
export async function findMongoAdminUserByEmail(email: string): Promise<any | null> {
  try {
    const db = await getMongoDb();
    const cleanEmail = email.trim().toLowerCase();
    const doc = await db.collection("adminusers").findOne({ email: cleanEmail });
    return doc;
  } catch (err) {
    console.error("Failed to query user from MongoDB Atlas:", err);
    return null;
  }
}

/** Find an admin user in MongoDB Atlas by id or email */
export async function findMongoAdminUser(idOrEmail: string): Promise<any | null> {
  try {
    const db = await getMongoDb();
    const query = idOrEmail.trim().toLowerCase();
    const doc = await db.collection("adminusers").findOne({
      $or: [
        { id: idOrEmail.trim() },
        { email: query },
      ],
    });
    return doc;
  } catch (err) {
    console.error("Failed to find admin user in MongoDB Atlas:", err);
    return null;
  }
}

/** Fetch all admin users from MongoDB Atlas */
export async function getAllMongoAdminUsers(): Promise<any[]> {
  try {
    const db = await getMongoDb();
    const docs = await db.collection("adminusers").find({}).toArray();
    return docs;
  } catch (err) {
    console.error("Failed to fetch all users from MongoDB Atlas:", err);
    return [];
  }
}

/** Upsert a magic link invitation in MongoDB Atlas */
export async function upsertMongoInvitation(inv: MagicLinkInvitation) {
  try {
    const db = await getMongoDb();
    const cleanEmail = inv.email.trim().toLowerCase();
    const normalizedRole = normalizeAdminRole(inv.role);
    await db.collection("admininvitations").updateOne(
      { email: cleanEmail },
      {
        $set: {
          id: inv.id,
          email: cleanEmail,
          name: inv.name,
          role: normalizedRole,
          tempPassword: inv.tempPassword,
          token: inv.token,
          status: inv.status,
          updatedAt: new Date(),
          expiresAt: inv.expiresAt,
        },
        $setOnInsert: {
          createdAt: inv.createdAt || new Date().toISOString(),
        },
      },
      { upsert: true }
    );
    return true;
  } catch (err) {
    console.error("Failed to upsert invitation in MongoDB Atlas:", err);
    return false;
  }
}

/** Find a magic link invitation in MongoDB Atlas by token or email */
export async function findMongoInvitation(tokenOrEmail: string): Promise<any | null> {
  try {
    const db = await getMongoDb();
    const query = tokenOrEmail.trim().toLowerCase();
    const doc = await db.collection("admininvitations").findOne({
      $or: [
        { token: tokenOrEmail.trim() },
        { id: tokenOrEmail.trim() },
        { email: query },
      ],
    });
    return doc;
  } catch (err) {
    console.error("Failed to find invitation in MongoDB Atlas:", err);
    return null;
  }
}

/** Find an invitation in MongoDB Atlas by token, ID, or email */
export async function findMongoInvitationByTokenOrEmail(
  token?: string | null,
  email?: string | null
): Promise<any | null> {
  try {
    const db = await getMongoDb();
    const orConditions: any[] = [];
    if (token && token.trim()) {
      orConditions.push({ token: token.trim() });
      orConditions.push({ id: token.trim() });
    }
    if (email && email.trim()) {
      orConditions.push({ email: email.trim().toLowerCase() });
    }
    if (orConditions.length === 0) return null;

    const doc = await db.collection("admininvitations").findOne({ $or: orConditions });
    return doc;
  } catch (err) {
    console.error("Failed to find invitation by token or email in MongoDB:", err);
    return null;
  }
}

/** Update user role across MongoDB Atlas collections */
export async function updateMongoUserRole(idOrEmail: string, newRole: string): Promise<boolean> {
  try {
    const db = await getMongoDb();
    const query = idOrEmail.trim().toLowerCase();
    const normalizedRole = normalizeAdminRole(newRole);
    const filter = {
      $or: [
        { id: idOrEmail.trim() },
        { email: query },
      ],
    };

    const userResult = await db.collection("adminusers").updateOne(
      filter,
      {
        $set: {
          role: normalizedRole,
          updatedAt: new Date(),
        },
      }
    );

    await db.collection("admininvitations").updateOne(
      filter,
      {
        $set: {
          role: normalizedRole,
          updatedAt: new Date(),
        },
      }
    );

    return userResult.matchedCount > 0;
  } catch (err) {
    console.error("Failed to update user role in MongoDB Atlas:", err);
    return false;
  }
}

/** Delete an admin user from MongoDB Atlas when revoked */
export async function deleteMongoAdminUser(emailOrId: string) {
  try {
    const db = await getMongoDb();
    const clean = emailOrId.trim().toLowerCase();
    const filter = {
      $or: [
        { id: emailOrId.trim() },
        { email: clean },
      ],
    };
    await db.collection("adminusers").deleteOne(filter);
    await db.collection("admininvitations").deleteOne(filter);
    return true;
  } catch (err) {
    console.error("Failed to delete user in MongoDB Atlas:", err);
    return false;
  }
}
