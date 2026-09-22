import type { PageMeta } from "../../types/product.types";

export default function Pagination({ meta, onChange }: { meta: PageMeta | null; onChange: (page: number) => void }) {
  if (!meta || meta.totalPages <= 1) return null;

  return (
    <nav className="pagination" aria-label="Pagination">
      <button className="btn btn-ghost" disabled={meta.page <= 1} onClick={() => onChange(meta.page - 1)}>
        Previous
      </button>
      <span className="muted">
        Page {meta.page} of {meta.totalPages}
      </span>
      <button className="btn btn-ghost" disabled={meta.page >= meta.totalPages} onClick={() => onChange(meta.page + 1)}>
        Next
      </button>
    </nav>
  );
}
