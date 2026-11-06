import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: {
    position: "bottom-left",
  },
  cacheComponents: true,
  // Preserva o comportamento de prefetch anterior durante a atualização.
  partialPrefetching: false,
};

export default nextConfig;
