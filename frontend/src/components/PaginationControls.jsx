function PaginationControls({
  meta,
  pageSizeOptions = [10, 20, 50],
  onPrev,
  onNext,
  onPageSizeChange,
}) {
  const currentPage = meta?.page || 1
  const totalPages = meta?.totalPages || meta?.total_pages || 1
  const hasPrev = meta?.hasPrev ?? meta?.has_prev ?? currentPage > 1
  const hasNext = meta?.hasNext ?? meta?.has_next ?? currentPage < totalPages
  const startIndex = meta?.startIndex ?? meta?.start_index ?? 0
  const endIndex = meta?.endIndex ?? meta?.end_index ?? 0
  const total = meta?.total ?? meta?.total_records ?? 0
  const limit = meta?.limit ?? meta?.page_size ?? pageSizeOptions[0]

  return (
    <div className="pagination-shell">
      <div className="pagination-summary">
        <span>
          Showing {startIndex}-{endIndex} of {total}
        </span>
        <label>
          Per page
          <select value={limit} onChange={(event) => onPageSizeChange?.(Number(event.target.value))}>
            {pageSizeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="pagination-actions">
        <button type="button" className="secondary-button" onClick={onPrev} disabled={!hasPrev}>
          Previous
        </button>
        <span className="pagination-page">
          Page {currentPage} of {totalPages}
        </span>
        <button type="button" className="secondary-button" onClick={onNext} disabled={!hasNext}>
          Next
        </button>
      </div>
    </div>
  )
}

export default PaginationControls
