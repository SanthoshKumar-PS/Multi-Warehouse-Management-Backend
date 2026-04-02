import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { PrismaClient } from "@prisma/client";
import { getAllRolesAndPermissions } from "./controllers/testing/RolesandPermissions";
import { inventoryRouter } from './routes/inventory/inventoryRouter';

const prisma = new PrismaClient();
console.log("DB URL from env:", process.env.DATABASE_URL ? "Exists (starts with " + process.env.DATABASE_URL.substring(0, 8) + ")" : "Missing");
const app = express();

const allowedOrigins = [
  "http://localhost:8888",
  "http://localhost:9999",
  "http://localhost:5173",
  "http://localhost:4444",
  "http://localhost:3000",
  "https://bop-preview.vr2.in",
  "https://bop-6b26.vercel.app",
  "https://bop-festgroup.vercel.app",
  "https://bop-6b26-git-main-vrew.vercel.app",
  "https://sites.google.com",
  "https://sites.google.com/festgroup.in",
  "https://sites.google.com/festgroup.in/bop-public",
  "https://order-client-followup.vercel.app",
  "https://bop-a.vr2.in",
  "https://bop-s.vr2.in",
  "https://bop-t.vr2.in",
  "https://bop-g.vr2.in",
  "https://bop.vr2.in",
  "https://bop-new-feature-test.vercel.app"
];

app.use(
  cors({
    origin: function (origin, callback) {
      const allowAll = !origin || allowedOrigins.includes(origin);
      if (allowAll) {
        callback(null, true);
      } else {
        console.error("Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  }),
);

app.use(express.json());

app.use("/api/inventory", inventoryRouter);

app.get("/rolesAndPermissions", getAllRolesAndPermissions);

app.get("/check", (req, res) => {
  return res.json({
    message: "Running",
    platform: process.env.VERCEL
      ? "Vercel (Serverless)"
      : "Railway (Persistent)",
  });
});

app.get("/checkHost", (req, res) => {
  return res.json({
    message:
      process.env.NODE_ENV === "development"
        ? "Development server is running"
        : "Production server is running",
  });
});

const frontendDistPath = path.join(__dirname, "..", "frontend", "dist");
app.use(express.static(frontendDistPath));

app.get("*", (req, res) => {
  res.sendFile(path.join(frontendDistPath, "index.html"));
});

if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 3333;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
