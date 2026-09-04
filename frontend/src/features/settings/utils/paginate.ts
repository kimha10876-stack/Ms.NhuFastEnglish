export function paginateItems<T>(items: T[], page: number, pageSize: number) {
  const totalCount = items.length
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
  const activePage = Math.min(Math.max(page, 1), totalPages)
  const start = (activePage - 1) * pageSize

  return {
    items: items.slice(start, start + pageSize),
    totalCount,
    totalPages,
    activePage,
  }
}
