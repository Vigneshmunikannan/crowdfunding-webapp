import mongoose from "mongoose";

/**
 * Global is used here to maintain a cached connection across hot reloads in development.
 * Without this, `mongoose.connect` can exhaust Atlas connection limits during `next dev`.
 */
const globalForMongoose = globalThis as unknown as {
  mongooseConn: typeof mongoose | null;
  mongoosePromise: Promise<typeof mongoose> | null;
};

/**
 * Returns a singleton Mongoose connection (connection pooling handled by the driver).
 * For 40–50 concurrent users, one pooled connection per server instance is typical;
 * Atlas scales connections at the cluster tier.
 */
export async function connectDB(): Promise<typeof mongoose> {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error("MONGO_URI is not set");
  }

  if (globalForMongoose.mongooseConn?.connection?.readyState === 1) {
    return globalForMongoose.mongooseConn;
  }

  if (!globalForMongoose.mongoosePromise) {
    globalForMongoose.mongoosePromise = mongoose.connect(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10_000,
    });
  }

  globalForMongoose.mongooseConn = await globalForMongoose.mongoosePromise;
  return globalForMongoose.mongooseConn;
}
