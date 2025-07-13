/**
 * Pagination information for list responses.
 */
export interface PaginationResponseDto {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}
