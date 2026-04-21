import React, { useMemo, useState } from "react";
import { getImageCandidates } from "../utils/media";

export default function SafeImage({ media, title, seed, alt, className }) {
  const candidates = useMemo(
    () => getImageCandidates({ media, title, seed }),
    [media, seed, title],
  );
  const [idx, setIdx] = useState(0);

  const src = candidates[idx] || "/default-image.svg";

  return (
    <img
      src={src}
      alt={alt || title || "Listing image"}
      className={className}
      onError={() => {
        setIdx((current) =>
          current < candidates.length - 1 ? current + 1 : current,
        );
      }}
    />
  );
}
