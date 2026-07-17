import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // lib/cv-pdf.tsx loads TTF files from disk at runtime via a plain fs path (not
  // import/require), which the build tracer can't follow automatically — without
  // this the font files (and therefore Polish diacritics in exported PDFs) would
  // be missing from a serverless deployment.
  outputFileTracingIncludes: {
    "/api/cv/\\[id\\]/export": ["./assets/fonts/**/*"],
  },
  // Next.js dev server blocks cross-origin requests to /_next/* (JS/CSS chunks)
  // by default — the dev server only trusts "localhost" out of the box. When
  // testing from a phone over LAN WiFi at http://<LAN-IP>:3000, every chunk
  // request gets silently 403'd, so the page renders but NO client JS ever
  // loads: no hydration, no onClick/onChange/onSubmit handlers anywhere. This
  // is invisible unless you inspect network requests — it just looks like
  // "the button does nothing." Add this machine's LAN IP so phone/tablet
  // testing over WiFi actually works. If the LAN IP changes (different
  // network, DHCP reassignment), update it here.
  allowedDevOrigins: ["192.168.0.111"],
};

export default nextConfig;
