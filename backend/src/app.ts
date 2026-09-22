import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
import { errorHandler, notFound } from "./middleware/error.middleware";
import authRoutes from "./routes/auth.routes";
import bookingRoutes from "./routes/booking.routes";
import cartRoutes from "./routes/cart.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import employeeRoutes from "./routes/employee.routes";
import productRoutes from "./routes/product.routes";

export const createApp = () => {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.CLIENT_URL }));
  app.use(express.json({ limit: "100kb" }));
  if (env.NODE_ENV !== "test") app.use(morgan("dev"));

  app.get("/health", (_req, res) => res.status(200).json({ status: "ok" }));

  app.use("/auth", authRoutes);
  app.use("/products", productRoutes);
  app.use("/cart", cartRoutes);
  app.use("/bookings", bookingRoutes);
  app.use("/employees", employeeRoutes);
  app.use("/admin", dashboardRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
};
