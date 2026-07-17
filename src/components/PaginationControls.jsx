export default function PaginationControls({
  currentPage,
  totalPages,
  onPrevious,
  onNext,
}) {
  if (!totalPages || totalPages <= 1) {
    return null;
  }

  return (
    <div style={{ marginTop: "1rem", display: "flex", justifyContent: "center", gap: "0.75rem", alignItems: "center" }}>
      <button className="btn btn-outline" type="button" onClick={onPrevious} disabled={currentPage <= 1}>
        Précédent
      </button>
      <span>
        Page {currentPage} / {totalPages}
      </span>
      <button className="btn btn-outline" type="button" onClick={onNext} disabled={currentPage >= totalPages}>
        Suivant
      </button>
    </div>
  );
}
