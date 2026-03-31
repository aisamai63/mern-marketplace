const VIDEO_EXTENSION_REGEX = /\.(mp4|webm|ogg|mov|m4v|avi|mkv)$/i;
const HTTP_URL_REGEX = /^https?:\/\//i;

const trimTrailingSlash = (value) => value.replace(/\/$/, "");

export const resolveMediaUrl = (value) => {
  if (typeof value !== "string") return "";

  const mediaPath = value.trim();
  if (!mediaPath) return "";

  if (HTTP_URL_REGEX.test(mediaPath)) {
    return mediaPath;
  }

  const normalizedPath = mediaPath.startsWith("/") ? mediaPath : `/${mediaPath}`;
  const backendOrigin = trimTrailingSlash(
    import.meta.env.VITE_BACKEND_ORIGIN || "",
  );

  if (backendOrigin) {
    return `${backendOrigin}${normalizedPath}`;
  }

  return normalizedPath;
};

export const isVideoMedia = (value) => {
  if (typeof value !== "string") return false;

  const withoutQuery = value.split("?")[0].toLowerCase();
  return VIDEO_EXTENSION_REGEX.test(withoutQuery);
};
