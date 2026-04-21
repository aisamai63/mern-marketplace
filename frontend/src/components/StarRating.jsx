import React from "react";

export default function StarRating({
  value = 0,
  outOf = 5,
  onChange,
  readOnly = false,
  size = 20,
}) {
  const stars = [];
  const safeValue = Number.isFinite(Number(value)) ? Number(value) : 0;

  for (let i = 1; i <= outOf; i++) {
    const isActive = i <= safeValue;
    const starClass = [
      "star-rating__star",
      isActive ? "star-rating__star--active" : "star-rating__star--inactive",
      readOnly ? "star-rating__star--readonly" : "star-rating__star--interactive",
    ].join(" ");

    stars.push(
      <button
        key={i}
        type="button"
        className={starClass}
        disabled={readOnly}
        aria-label={`${i} star${i > 1 ? "s" : ""}`}
        style={{
          cursor: readOnly ? "default" : "pointer",
          fontSize: size,
          marginRight: 2,
          color: isActive ? "#f59e0b" : "#9ca3af",
          background: "transparent",
          border: 0,
          padding: 0,
          lineHeight: 1,
          userSelect: "none",
        }}
        onClick={() => {
          if (!readOnly && onChange) onChange(i);
        }}
        data-testid={`star-${i}`}
      >
        {isActive ? "\u2605" : "\u2606"}
      </button>,
    );
  }

  return (
    <span className="star-rating">
      {stars}
      {!readOnly && (
        <span style={{ marginLeft: 8, fontSize: Math.max(12, size - 6), color: "#475569" }}>
          {safeValue}/{outOf}
        </span>
      )}
    </span>
  );
}
