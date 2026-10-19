export default function Pagination({ meta, onPageChange }) {
  if (!meta || meta.last_page <= 1) return null;

  return (
    <nav className="pagination" aria-label="Request pages">
      <button type="button" disabled={!meta.prev_page_url} onClick={() => onPageChange(meta.current_page - 1)}>
        Previous
      </button>
      <span>Page {meta.current_page} of {meta.last_page} ({meta.total} requests)</span>
      <button type="button" disabled={!meta.next_page_url} onClick={() => onPageChange(meta.current_page + 1)}>
        Next
      </button>
    </nav>
  );
}
