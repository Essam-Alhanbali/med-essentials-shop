// Central image URL transformer. Routes remote images through wsrv.nl
// for on-the-fly resizing + WebP conversion. To switch to Cloudflare
// Image Resizing later, change ONLY the body of `buildUrl` below.

export type ImageOptions = {
  w?: number;
  h?: number;
  q?: number;
  fit?: "cover" | "contain" | "inside" | "outside" | "fill";
  format?: "webp" | "jpg" | "png" | "avif";
};

function buildUrl(url: string, opts: ImageOptions): string {
  const { w, h, q = 75, fit = "cover", format = "webp" } = opts;
  const params = new URLSearchParams();
  params.set("url", url);
  if (w) params.set("w", String(w));
  if (h) params.set("h", String(h));
  params.set("q", String(q));
  params.set("fit", fit);
  params.set("output", format);
  return `https://wsrv.nl/?${params.toString()}`;
}

export function getImageUrl(url: string | null | undefined, opts: ImageOptions = {}): string {
  if (!url) return "";
  // Preserve already-optimized / inline sources
  if (url.startsWith("data:") || url.startsWith("blob:")) return url;
  // wsrv.nl needs an absolute http(s) URL; pass-through anything else
  if (!/^https?:\/\//i.test(url)) return url;
  return buildUrl(url, opts);
}

export function getImageSrcSet(
  url: string | null | undefined,
  widths: number[],
  opts: Omit<ImageOptions, "w"> = {},
): string {
  if (!url) return "";
  if (url.startsWith("data:") || url.startsWith("blob:")) return "";
  if (!/^https?:\/\//i.test(url)) return "";
  return widths.map((w) => `${getImageUrl(url, { ...opts, w })} ${w}w`).join(", ");
}

const IMAGE_EXT = /\.(png|jpe?g|webp|gif|avif|bmp|svg)(\?.*)?$/i;
const KNOWN_IMAGE_HOSTS = [
  "firebasestorage.googleapis.com",
  "storage.googleapis.com",
  "lh3.googleusercontent.com",
  "wsrv.nl",
  "images.unsplash.com",
  "cdn.shopify.com",
];

export function isLikelyImageUrl(url: string): boolean {
  if (!url) return false;
  if (url.startsWith("data:image/") || url.startsWith("blob:")) return true;
  try {
    const u = new URL(url);
    if (u.protocol !== "http:" && u.protocol !== "https:") return false;
    if (IMAGE_EXT.test(u.pathname)) return true;
    if (KNOWN_IMAGE_HOSTS.some((h) => u.hostname === h || u.hostname.endsWith(`.${h}`))) return true;
    return false;
  } catch {
    return false;
  }
}