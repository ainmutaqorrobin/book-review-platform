export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedData<T> {
  items: T[];
  pagination: PaginationMeta;
}

export interface PaginationQuery {
  page: number;
  limit: number;
}

export function getPaginationQuery(
  rawPage: unknown,
  rawLimit: unknown,
  defaultLimit: number
): PaginationQuery {
  const parsedPage = Number.parseInt(String(rawPage ?? "1"), 10);
  const parsedLimit = Number.parseInt(String(rawLimit ?? defaultLimit), 10);

  return {
    page: Number.isNaN(parsedPage) ? 1 : parsedPage,
    limit: Number.isNaN(parsedLimit) ? defaultLimit : parsedLimit,
  };
}

export function createPaginationMeta(
  requestedPage: number,
  limit: number,
  totalItems: number
): PaginationMeta {
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  const page = Math.min(requestedPage, totalPages);

  return {
    page,
    limit,
    totalItems,
    totalPages,
    hasNextPage: totalItems > 0 && page < totalPages,
    hasPreviousPage: page > 1,
  };
}

export function getPaginationOffset(meta: PaginationMeta) {
  return (meta.page - 1) * meta.limit;
}
