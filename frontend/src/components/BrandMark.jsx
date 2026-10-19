export default function BrandMark({ className = "" }) {
  return (
    <span className={`brand-icon ${className}`} aria-label="Student Document Portal">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6.5 3.75h7l4 4v12.5h-11z" />
        <path d="M13.5 3.75v4h4M9 12h6M9 15.5h6" />
      </svg>
    </span>
  );
}
