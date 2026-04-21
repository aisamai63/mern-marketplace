import React from "react";

export default function StarRating({ value = 0, outOf = 5, onChange, readOnly = false, size = 20 }) {
  const stars = [];
  for (let i = 1; i <= outOf; i++) {
    const starClass = [
      "star-rating__star",
      i <= value ? "star-rating__star--active" : "star-rating__star--inactive",
      readOnly ? "star-rating__star--readonly" : "star-rating__star--interactive"
    ].join(" ");
    stars.push(
      <span
        key={i}
        className={starClass}
        style={{
          cursor: readOnly ? "default" : "pointer",
          color: i <= value ? undefined : undefined,
          fontSize: size,
          marginRight: 2,
        }}
        onClick={() => !readOnly && onChange && onChange(i)}
        data-testid={`star-${i}`}
      >
        ★
      </span>
    );
  }
  return <span className="star-rating">{stars}</span>;
}
