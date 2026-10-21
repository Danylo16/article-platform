export function paginate(total: number, page: number, pageSize = 10) {
  const size = Math.max(1, Math.trunc(pageSize));
  const pageCount = Math.max(1, Math.ceil(total / size));
  const currentPage = Math.min(pageCount, Math.max(1, Math.trunc(page) || 1));
  const start = (currentPage - 1) * size;
  return { currentPage, pageCount, start, end: Math.min(total, start + size) };
}

export function moveItem<T>(items: T[], from: number, to: number): T[] {
  if (from < 0 || to < 0 || from >= items.length || to >= items.length || from === to) return items;
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}
