import { PaginatedMetaDto } from './paginated-meta.dto';

export class PaginatedResponseDto<T> {
  data: T[];
  meta: PaginatedMetaDto;

  constructor(
    data: T[],
    totalItems: number,
    page: number | string,
    limit: number | string,
  ) {
    this.data = data;

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const totalPages = Math.max(1, Math.ceil(totalItems / limitNum));

    this.meta = {
      totalItems,
      totalPages,
      itemsPerPage: limitNum,
      currentPage: pageNum,
      hasPreviousPage: pageNum > 1,
      hasNextPage: pageNum < totalPages,
    };
  }
}
