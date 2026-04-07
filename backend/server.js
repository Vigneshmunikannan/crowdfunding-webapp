require("dotenv").config();

const mongoose = require("mongoose");
const { createApp } = require("./app");
const { connectDB } = require("./config/db");

const PORT = Number(process.env.PORT) || 5000;

async function start() {
  try {
    await connectDB();
    const app = createApp();

    const server = app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT} (${process.env.NODE_ENV || "development"})`);
    });

    const shutdown = async (signal) => {
      console.log(`${signal} received, closing server…`);
      server.close(async () => {
        await mongoose.connection.close();
        process.exit(0);
      });
      setTimeout(() => process.exit(1), 10_000).unref();
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  } catch (err) {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  }
}

start();
