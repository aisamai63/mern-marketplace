import React from "react";

export default function StarRating({ value = 0, outOf = 5, onChange, readOnly = false, size = 20 }) {
  const stars = [];
  for (let i = 1; i <= outOf; i++) {
    stars.push(
      <span
        key={i}
        style={{
          cursor: readOnly ? "default" : "pointer",
          color: i <= value ? "#FFD700" : "#ccc",
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
  return <span>{stars}</span>;
}
