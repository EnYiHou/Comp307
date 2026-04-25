import "./LoadingState.css";

export default function LoadingState({
  label = "Loading...",
  size = "regular",
  variant = "inline",
}) {
  return (
    <div className={`loading-state loading-state--${size} loading-state--${variant}`}>
      <span className="loading-state__spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
