import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // lib/cv-pdf.tsx loads TTF files from disk at runtime via a plain fs path (not
  // import/require), which the build tracer can't follow automatically — without
  // this the font files (and therefore Polish diacritics in exported PDFs) would
  // be missing from a serverless deployment.
  outputFileTracingIncludes: {
    "/api/cv/\\[id\\]/export": ["./assets/fonts/**/*"],
  },
};

export default nextConfig;
