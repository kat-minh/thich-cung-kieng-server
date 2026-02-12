import { IsInt } from 'class-validator';

export class PaginatedMetaDto {
  @IsInt()
  totalItems: number;

  @IsInt()
  totalPages: number;

  @IsInt()
  itemsPerPage: number;

  @IsInt()
  currentPage: number;

  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
}
