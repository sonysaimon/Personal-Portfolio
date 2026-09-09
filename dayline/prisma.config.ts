import "dotenv/config";
import { defineConfig } from "prisma/config";

// Migrations prefer a direct (non-pooled) connection when one is provided;
// the app itself uses DATABASE_URL (pooled is fine at runtime).
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: { url: process.env["DIRECT_DATABASE_URL"] || process.env["DATABASE_URL"] },
});
