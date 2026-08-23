// src/presentation/shared/components/SkeletonCard.jsx
import "@/presentation/styles/theme.css";

function Bone({ width = "100%", height = "14px", borderRadius = "6px" }) {
  return (
    <div
      className="am-skeleton"
      aria-hidden="true"
      style={{ width, height, borderRadius }}
    />
  );
}

function SkeletonCard() {
  return (
    <div
      className="skeleton-card"
      aria-hidden="true"
      style={{
        background: "var(--am-surface)",
        borderRadius: "var(--am-radius-xl)",
        overflow: "hidden",
        border: "1px solid var(--border-light)",
        boxShadow: "var(--am-shadow-sm)",
      }}
    >
      <div
        className="am-skeleton"
        style={{ width: "100%", aspectRatio: "4 / 3" }}
      />
      <div
        style={{
          padding: "var(--am-space-4)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--am-space-2)",
        }}
      >
        <Bone width="70%" height="16px" />
        <Bone width="45%" height="13px" />
        <Bone width="35%" height="20px" />
        <Bone width="100%" height="38px" borderRadius="var(--am-radius-md)" />
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 4 }) {
  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <SkeletonCard key={index} />
      ))}
    </>
  );
}

export { Bone };
export default SkeletonCard;
