// Allow next/image to load uploads from the object storage public URL.
const storagePublicUrl = process.env.STORAGE_PUBLIC_URL || process.env.R2_PUBLIC_URL;
const remotePatterns = [];
if (storagePublicUrl) {
  try {
    const u = new URL(storagePublicUrl);
    remotePatterns.push({
      protocol: u.protocol.replace(":", ""),
      hostname: u.hostname,
      pathname: `${u.pathname.replace(/\/$/, "")}/**`,
    });
  } catch {
    console.warn("STORAGE_PUBLIC_URL is not a valid URL; remote images will not load.");
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: { remotePatterns },
  // Ship the committed SQLite file with every server route: it's the fallback when D1 is unreachable.
  outputFileTracingIncludes: {
    '/**': ['./portfolio.db'],
  },
}

module.exports = nextConfig
