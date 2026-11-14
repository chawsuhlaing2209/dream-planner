import type { NextConfig } from "next";

// Cache Components is off on purpose: every page reads live family data from SQLite,
// so pages render per request (see lib/db/index.ts).
const nextConfig: NextConfig = {
  poweredByHeader: false,
};

export default nextConfig;
