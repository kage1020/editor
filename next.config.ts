import BundleAnalyzer from "@next/bundle-analyzer"
import type { NextConfig } from "next"

const withBundleAnalyzer = BundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
})

const nextConfig: NextConfig = {
  typedRoutes: true,
  // The Worker runtime cannot load sharp, and no route uses next/image.
  images: { unoptimized: true },
}

export default withBundleAnalyzer(nextConfig)
