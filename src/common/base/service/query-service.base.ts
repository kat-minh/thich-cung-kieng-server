import { FindOptionsWhere, Repository, SelectQueryBuilder } from 'typeorm';
import { AbstractEntity } from '../entity.base';
import { RedisService } from 'src/shared/redis/redis.service';
import { Logger } from '@nestjs/common';
import { CACHE_NAMESPACE } from 'src/common/constants/cache.constant';
import { BuildCacheKeyOptions } from 'src/common/interfaces/build-cache-key-options.interface';
import { buildCacheKey } from 'src/common/utils/build-cache-key.util';
import { PaginatedResponseDto } from '../dto/paginated-response.dto';
import { BaseFilterDto } from '../dto/base-filter.dto';

export abstract class QueryServiceBase<T extends AbstractEntity> {
  protected readonly logger: Logger;
  constructor(
    protected readonly repository: Repository<T>,
    protected readonly redis: RedisService,
  ) {
    this.logger = new Logger(this.constructor.name);
  }
  async findAll(
    filter: BaseFilterDto,
    relations: string[],
    select: string[],
  ): Promise<PaginatedResponseDto<T> | null> {
    try {
      const page = filter.page || 1;
      const limit = filter.limit || 10;
      const sortBy = filter.sortBy || 'createdAt';
      const sortOrder = filter.sortOrder || 'DESC';
      const search = filter.search;
      const skip = (page - 1) * limit;

      // Create query builder with base filters
      const entityName = this.getEntityName();
      const entityAlias = entityName.toLowerCase();
      const queryBuilder = this.createQueryBuilder(filter);

      // Add search condition
      if (search && this.getSearchableFields().length > 0) {
        const searchFields = this.getSearchableFields();

        // Use basic case-insensitive search instead of unaccent/similarity functions
        // This avoids the PostgreSQL extension requirement
        const basicConditions = searchFields
          .map(
            (field) =>
              `LOWER(${entityAlias}."${field}") ILIKE LOWER(:basicSearch)`,
          )
          .join(' OR ');

        queryBuilder.andWhere(`(${basicConditions})`, {
          basicSearch: `%${search}%`,
        });
      }

      // Add valid relations first
      if (relations && relations.length > 0) {
        this.autoJoinRelations(queryBuilder, entityAlias, relations);
      }

      // Only apply select if no relations are requested (to avoid conflicts)
      if (
        select &&
        select.length > 0 &&
        (!relations || relations.length === 0)
      ) {
        const auditFields = [
          'createdAt',
          'updatedAt',
          'createdBy',
          'updatedBy',
          'deletedAt',
        ];
        const finalSelect = [...select];
        if (!finalSelect.includes('id')) {
          finalSelect.push('id');
        }
        auditFields.forEach((field) => {
          if (!finalSelect.includes(field)) {
            finalSelect.push(field);
          }
        });

        queryBuilder.select(
          finalSelect.map((field) => `${entityAlias}.${field}`),
        );
      }

      // Add sorting and pagination
      queryBuilder
        .orderBy(`${entityAlias}.${sortBy}`, sortOrder as 'ASC' | 'DESC')
        .skip(skip)
        .take(limit);

      this.logger.log(
        `Finding all ${entityName} with query:`,
        queryBuilder.getQuery(),
      );

      const [data, totalItems] = await queryBuilder.getManyAndCount();

      // Filter audit fields from relations
      if (relations && relations.length > 0) {
        this.filterAuditFieldsFromRelations(data, relations);
      }

      const result = new PaginatedResponseDto<T>(data, totalItems, page, limit);

      return result;
    } catch (error) {
      this.logger.error(`Error finding all ${this.getEntityName()}:`, error);
      throw error;
    }
  }

  async findOneByOptions(
    options: FindOptionsWhere<T>,
    relations?: string[],
  ): Promise<T | null> {
    try {
      const whereCondition = {
        ...options,
        deletedAt: null,
      } as FindOptionsWhere<T>;

      const result = await this.repository.findOne({
        where: whereCondition,
        relations: relations && relations.length > 0 ? relations : [],
      });
      if (relations && relations.length > 0 && result) {
        this.filterAuditFieldsFromRelations([result], relations);
      }
      return result;
    } catch (error) {
      this.logger.error(
        `Error finding ${this.getEntityName()} by options:`,
        error,
      );
      throw error;
    }
  }

  async findOne(id: string, relations?: string[]): Promise<T | null> {
    try {
      const entity = await this.repository.findOne({
        where: { id, deletedAt: null } as any as FindOptionsWhere<T>,
        relations: relations && relations.length > 0 ? relations : [],
      });
      if (relations && relations.length > 0 && entity) {
        this.filterAuditFieldsFromRelations([entity], relations);
      }
      return entity;
    } catch (error) {
      this.logger.error(
        `Error finding one ${this.getEntityName()} with id ${id}:`,
        error,
      );
      throw error;
    }
  }

  async findAllByOptions(options: FindOptionsWhere<T>): Promise<T[] | null> {
    try {
      const whereCondition = {
        ...options,
        deletedAt: null,
      } as FindOptionsWhere<T>;
      const result = await this.repository.find({
        where: whereCondition,
      });
      return result;
    } catch (error) {
      this.logger.error(
        `Error finding ${this.getEntityName()} by options:`,
        error,
      );
      throw error;
    }
  }
  async selectOptions(): Promise<T[] | null> {
    try {
      const result = await this.repository.find({
        where: { deletedAt: null } as any as FindOptionsWhere<T>,
        select: ['id', 'name'] as Array<keyof T>,
      });
      return result;
    } catch (error) {
      this.logger.error(
        `Error getting select options for ${this.getEntityName()}:`,
        error,
      );
      throw error;
    }
  }

  // Utils methods
  protected getEntityName(): string {
    return this.repository.metadata.name;
  }

  protected getCacheKey(options: BuildCacheKeyOptions): string {
    return buildCacheKey({
      namespace: CACHE_NAMESPACE,
      module: this.getEntityName(),
      ...options,
    });
  }

  private autoJoinRelations(
    queryBuilder: SelectQueryBuilder<T>,
    baseAlias: string,
    relations: string[],
  ) {
    const joined = new Set<string>();

    relations.forEach((relationPath) => {
      const parts = relationPath.split('.');
      let currentAlias = baseAlias;

      for (const part of parts) {
        const nextAlias = `${currentAlias}_${part}`;
        const fullPath = `${currentAlias}.${part}`;

        if (!joined.has(fullPath)) {
          // Use leftJoinAndSelect to fetch relation data
          queryBuilder.leftJoinAndSelect(fullPath, nextAlias);
          joined.add(fullPath);
        }

        currentAlias = nextAlias;
      }
    });
  }

  private filterAuditFieldsFromRelations(entities: T[], relations: string[]) {
    const fieldsToRemove = [
      'createdAt',
      'updatedAt',
      'createdBy',
      'updatedBy',
      'deletedAt',
    ];

    entities.forEach((entity) => {
      relations.forEach((relation) => {
        // Handle nested relations like 'ritualTags.tag'
        const parts = relation.split('.');
        this.filterNestedRelation(entity, parts, fieldsToRemove);
      });
    });
  }

  private filterNestedRelation(
    obj: any,
    parts: string[],
    fieldsToRemove: string[],
  ) {
    if (!obj || parts.length === 0) return;

    const [current, ...remaining] = parts;
    const value = obj[current];

    if (!value) return;

    // If this is the last part, filter audit fields
    if (remaining.length === 0) {
      if (Array.isArray(value)) {
        value.forEach((item: any) => {
          fieldsToRemove.forEach((field) => {
            delete item?.[field];
          });
        });
      } else if (typeof value === 'object') {
        fieldsToRemove.forEach((field) => {
          delete value[field];
        });
      }
    } else {
      // Recursively process nested relations
      if (Array.isArray(value)) {
        value.forEach((item: any) => {
          this.filterNestedRelation(item, remaining, fieldsToRemove);
        });
      } else if (typeof value === 'object') {
        this.filterNestedRelation(value, remaining, fieldsToRemove);
      }
    }
  }

  // ABSTRACT METHODS - Override in child classes
  /**
   * Override this method in child classes to specify default relations to load
   * @returns The default relations to load
   */
  protected abstract getDefaultRelations(): string[];
  /**
   * Override this method in child classes to specify searchable fields
   * @returns The searchable fields
   */
  protected abstract getSearchableFields(): string[];

  /**
   * Get fields to check for duplicates
   * @returns The fields to check for duplicates
   */
  protected abstract getDuplicateFields(): string[];

  // OPTIONAL METHODS - Override in child classes if needed
  /**
   * Get fields that are references to other entities
   * @returns The reference fields
   */
  protected getReferenceFields(): Record<string, string> {
    return {};
  }

  /**
   * Override method fields to filter in findAll
   * @returns The fields to filter in findAll
   * @param filter The filter object
   */
  protected createQueryBuilder(filter: any): SelectQueryBuilder<T> {
    const entityName = this.getEntityName();
    const entityAlias = entityName.toLowerCase();
    const queryBuilder = this.repository.createQueryBuilder(entityAlias);
    return queryBuilder;
  }
}
