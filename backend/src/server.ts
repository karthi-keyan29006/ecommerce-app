import { createApp } from "./app";
import { prisma } from "./config/database";
import { env } from "./config/env";

const start = async () => {
  try {
    await prisma.$connect();
    console.log("Database connected");

    const server = createApp().listen(env.PORT, () => {
      console.log(`API running on http://localhost:${env.PORT}`);
    });

    const shutdown = () => server.close(() => void prisma.$disconnect());
    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  } catch (error) {
    console.error("Failed to start the server:", error);
    process.exit(1);
  }
};

void start();
