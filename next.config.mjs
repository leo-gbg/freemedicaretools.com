/** @type {import('next').NextConfig} */

/**
 * Short paths that do not match a real route.
 * Each path is also registered with a trailing slash.
 * Real pages: /, /tools, /classes, /classes/slides, /glossary, /research,
 * /privacy, /terms, /tools/<slug>, and the two print routes.
 * /classes/slides is unlisted. /slides is only a short link to it.
 */
const SHORT_LINKS = [
  ["/worksheet", "/tools/client-worksheet"],
  ["/class", "/classes"],
  ["/slides", "/classes/slides"],
  ["/iep", "/tools/iep-timeline"],
  ["/working", "/tools/working-past-65"],
  ["/quiz", "/tools/path-quiz"],
  ["/penalty", "/tools/penalty-estimator"],
  ["/window", "/tools/period-finder"],
  ["/aep", "/tools/aep-checklist"],
  ["/irmaa", "/tools/irmaa-checker"],
  ["/medigap", "/tools/med-supp-compare"],
];

function shortRedirects() {
  return SHORT_LINKS.flatMap(([source, destination]) =>
    [source, `${source}/`].map((path) => ({
      source: path,
      destination,
      permanent: true,
    })),
  );
}

const nextConfig = {
  // Next's automatic slash redirect runs before redirects() and would send
  // /worksheet/ to /worksheet before the short link can match. Turn that off,
  // match the short links (with and without a slash) first, then strip a
  // trailing slash on every other path.
  skipTrailingSlashRedirect: true,
  async redirects() {
    const www = { type: "host", value: "www.freemedicaretools.com" };
    return [
      {
        source: "/",
        has: [www],
        destination: "https://freemedicaretools.com",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [www],
        destination: "https://freemedicaretools.com/:path*",
        permanent: true,
      },
      ...shortRedirects(),
      {
        source: "/:path+/",
        destination: "/:path+",
        permanent: true,
      },
    ];
  },
  async headers() {
    const unlisted = { key: "X-Robots-Tag", value: "noindex, nofollow" };
    return [
      { source: "/classes/slides", headers: [unlisted] },
      { source: "/classes/medicare101-v6.pdf", headers: [unlisted] },
    ];
  },
};

export default nextConfig;
