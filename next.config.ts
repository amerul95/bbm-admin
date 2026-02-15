import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone is used for Docker. "Failed to copy traced files" on Windows is a known
  // path issue with [brackets] in filenames; Docker builds (Linux) are unaffected.
  // Skip standalone on Windows to avoid copyfile EINVAL; use Docker for prod builds.
  output: process.platform === "win32" ? undefined : "standalone",
};

export default nextConfig;
