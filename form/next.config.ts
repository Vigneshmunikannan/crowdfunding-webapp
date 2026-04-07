import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

/** Pin Turbopack root so builds don’t pick a parent folder’s `package-lock.json` (e.g. under your user profile). */
const configDir = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  turbopack: {
    root: configDir,
  },
  serverExternalPackages: ["mongoose"],
};

export default nextConfig;
