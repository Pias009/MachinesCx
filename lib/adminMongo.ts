import { connectDB } from "@/lib/mongodb";
import { AdminUser, MagicLinkInvitation } from "@/lib/adminRoles";

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
    if (user.role) updateDoc.role = user.role;
    if (user.status) updateDoc.status = user.status;
    if (user.password) {
      updateDoc.password = user.password.trim();
      updateDoc.tempPassword = user.password.trim();
    } else if (user.tempPassword) {
      updateDoc.password = user.tempPassword.trim();
      updateDoc.tempPassword = user.tempPassword.trim();
    }
    if (user.lastLoginAt) updateDoc.lastLoginAt = user.lastLoginAt;

    if (user.role === "super_admin") {
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
    await db.collection("admininvitations").updateOne(
      { email: cleanEmail },
      {
        $set: {
          id: inv.id,
          email: cleanEmail,
          name: inv.name,
          role: inv.role,
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

/** Delete an admin user from MongoDB Atlas when revoked */
export async function deleteMongoAdminUser(email: string) {
  try {
    const db = await getMongoDb();
    const cleanEmail = email.trim().toLowerCase();
    await db.collection("adminusers").deleteOne({ email: cleanEmail });
    await db.collection("admininvitations").deleteOne({ email: cleanEmail });
    return true;
  } catch (err) {
    console.error("Failed to delete user in MongoDB Atlas:", err);
    return false;
  }
}
