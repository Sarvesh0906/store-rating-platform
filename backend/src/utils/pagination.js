function createPaginationMeta({ page, limit, total }) {
  const totalPages = total > 0 ? Math.ceil(total / limit) : 0;
  const hasPrev = page > 1;
  const hasNext = page < totalPages;
  const startIndex = total === 0 ? 0 : (page - 1) * limit + 1;
  const endIndex = total === 0 ? 0 : Math.min(page * limit, total);

  return {
    page,
    limit,
    total,
    totalPages,
    hasPrev,
    hasNext,
    startIndex,
    endIndex,
    page_size: limit,
    total_records: total,
    total_pages: totalPages,
  };
}

module.exports = {
  createPaginationMeta,
};
