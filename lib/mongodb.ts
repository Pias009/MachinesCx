import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined in .env.local");
}

// Cache the connection *promise* across hot-reloads in dev. Caching only the
// resolved connection let concurrent first requests (cold start) each call
// mongoose.connect(); with bufferCommands off, the early ones queried before
// the socket was ready and fell back to bundled JSON instead of CMS data.
declare global {
  // eslint-disable-next-line no-var
  var _mongooseConn: Promise<typeof mongoose> | null;
}

export function connectDB(): Promise<typeof mongoose> {
  if (!global._mongooseConn) {
    global._mongooseConn = mongoose
      .connect(MONGODB_URI, { bufferCommands: false })
      .catch((e) => {
        // don't cache a failed attempt — let the next request retry
        global._mongooseConn = null;
        throw e;
      });
  }
  return global._mongooseConn;
}
