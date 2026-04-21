import api from "./api";

const VIDEO_EXTENSION_REGEX = /\.(mp4|webm|ogg|mov|m4v|avi|mkv)$/i;
const HTTP_URL_REGEX = /^https?:\/\//i;
const AMAZON_FILENAME_REGEX = /(^|\/)([^/]*_AC_[^/]*\.(jpg|jpeg|png|webp))$/i;

const trimTrailingSlash = (value) => value.replace(/\/$/, "");
const normalizeSlashes = (value) => value.replace(/\\/g, "/");
const UPLOADS_PREFIX = "/uploads/";

const resolveApiOrigin = () => {
  const baseURL = String(api?.defaults?.baseURL || "").trim();
  if (!baseURL || !HTTP_URL_REGEX.test(baseURL)) {
    return "";
  }

  try {
    return trimTrailingSlash(new URL(baseURL).origin);
  } catch (_) {
    return "";
  }
};

const getMediaString = (value) => {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    if (typeof value.url === "string") return value.url;
    if (typeof value.src === "string") return value.src;
    if (typeof value.path === "string") return value.path;
  }
  return "";
};

const toSeed = (value) =>
  String(value || "listing")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const resolveMediaUrl = (value) => {
  const rawValue = getMediaString(value);
  if (!rawValue) return "";

  const mediaPath = normalizeSlashes(rawValue.trim());
  if (!mediaPath) return "";

  if (HTTP_URL_REGEX.test(mediaPath)) {
    return mediaPath;
  }

  const pathWithoutHost = mediaPath.replace(/^https?:\/\/[^/]+/i, "");
  const pathWithUploads =
    pathWithoutHost.includes("/")
      ? pathWithoutHost
      : `${UPLOADS_PREFIX}${pathWithoutHost}`;
  const normalizedPath = pathWithUploads.startsWith("/")
    ? pathWithUploads
    : `/${pathWithUploads}`;
  const backendOrigin = trimTrailingSlash(
    import.meta.env.VITE_BACKEND_ORIGIN || "",
  );
  const apiOrigin = resolveApiOrigin();
  const origin = backendOrigin || apiOrigin;

  if (origin) {
    return `${origin}${normalizedPath}`;
  }

  return normalizedPath;
};

export const getImageCandidates = ({ media, title, seed }) => {
  const primary = resolveMediaUrl(media);
  const candidates = [];

  const pushUnique = (url) => {
    if (typeof url !== "string") return;
    const value = url.trim();
    if (!value || candidates.includes(value)) return;
    candidates.push(value);
  };

  pushUnique(primary);

  if (primary) {
    pushUnique(encodeURI(primary));
    pushUnique(primary.replace(/\+/g, "%2B"));
  }

  const raw = normalizeSlashes(getMediaString(media).trim());
  const amazonMatch = raw.match(AMAZON_FILENAME_REGEX);
  if (amazonMatch?.[2]) {
    pushUnique(`https://m.media-amazon.com/images/I/${amazonMatch[2]}`);
  }

  pushUnique("/uploads/default-media.svg");
  pushUnique("/default-image.svg");

  const stableSeed = toSeed(seed || title || raw || "listing");
  pushUnique(`https://picsum.photos/seed/${stableSeed}/900/600`);

  return candidates;
};

export const isVideoMedia = (value) => {
  const raw = getMediaString(value);
  if (!raw) return false;

  const withoutQuery = raw.split("?")[0].toLowerCase();
  return VIDEO_EXTENSION_REGEX.test(withoutQuery);
};
