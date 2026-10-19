export default function Field({ label, error, as = "input", children, ...props }) {
  const id = props.id || props.name;

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {as === "select" ? (
        <select id={id} aria-invalid={Boolean(error)} {...props}>{children}</select>
      ) : as === "textarea" ? (
        <textarea id={id} aria-invalid={Boolean(error)} {...props} />
      ) : (
        <input id={id} aria-invalid={Boolean(error)} {...props} />
      )}
      {error && <span className="field-error">{error}</span>}
    </div>
  );
}
