import { BadRequestException, Injectable } from '@nestjs/common';
import { BaseService } from 'src/common/base/service/service.base';
import { Ritual } from './entities/ritual.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository, SelectQueryBuilder } from 'typeorm';
import { RedisService } from 'src/shared/redis/redis.service';
import { FilterRitualDto } from './dto/filter-ritual.dto';
import { CreateRitualDto } from './dto/create-ritual.dto';
import { RitualCategory } from '../ritual-category/entities/ritual-category.entity';
import { RitualMediaService } from '../ritual-media/ritual-media.service';
import { RitualTagService } from '../ritual-tag/ritual-tag.service';
import { PrayerService } from '../prayer/prayer.service';
import { TagService } from '../tag/tag.service';
import { RitualOfferingService } from '../ritual-offering/ritual-offering.service';
import { RitualTrayService } from '../ritual-tray/ritual-tray.service';

@Injectable()
export class RitualService extends BaseService<Ritual> {
  constructor(
    @InjectRepository(Ritual, 'postgresql')
    private readonly ritualRepository: Repository<Ritual>,
    private readonly redisService: RedisService,
    private readonly ritualOfferingService: RitualOfferingService,
    private readonly ritualTrayService: RitualTrayService,
    private readonly ritualMediaService: RitualMediaService,
    private readonly ritualTagService: RitualTagService,
    private readonly tagService: TagService,
    private readonly ritualPrayerService: PrayerService,
  ) {
    super(ritualRepository, redisService);
  }

  protected getDuplicateFields(): string[] {
    return ['name'];
  }

  protected getDefaultRelations(): string[] {
    return [
      'ritualMedias',
      'ritualTags',
      'offerings',
      'prayers',
      'ritualReviews',
      'favoriteByUsers',
    ];
  }

  protected getSearchableFields(): string[] {
    return ['name', 'description'];
  }

  protected createQueryBuilder(
    filter: FilterRitualDto,
  ): SelectQueryBuilder<Ritual> {
    const aliasName = Ritual.name.toLowerCase();
    const queryBuilder = this.ritualRepository.createQueryBuilder(aliasName);

    // Apply soft delete filter by default
    queryBuilder.andWhere(`${aliasName}.deletedAt IS NULL`);

    if (filter.difficultyLevel) {
      queryBuilder.andWhere(`${aliasName}.difficultyLevel = :difficultyLevel`, {
        difficultyLevel: filter.difficultyLevel,
      });
    }
    if (filter.timeOfExecution) {
      queryBuilder.andWhere(`${aliasName}.timeOfExecution = :timeOfExecution`, {
        timeOfExecution: filter.timeOfExecution,
      });
    }
    if (filter.dateSolar) {
      queryBuilder.andWhere(`${aliasName}.dateSolar = :dateSolar`, {
        dateSolar: filter.dateSolar,
      });
    }
    if (filter.dateLunar) {
      queryBuilder.andWhere(`${aliasName}.dateLunar = :dateLunar`, {
        dateLunar: filter.dateLunar,
      });
    }
    if (filter.isHot !== undefined) {
      queryBuilder.andWhere(`${aliasName}.isHot = :isHot`, {
        isHot: filter.isHot,
      });
    }
    if (filter.ritualCategoryId) {
      queryBuilder.andWhere(
        `${aliasName}.ritualCategoryId = :ritualCategoryId`,
        {
          ritualCategoryId: filter.ritualCategoryId,
        },
      );
    }

    return queryBuilder;
  }

  protected async validateCreateInput(
    createDto: CreateRitualDto,
  ): Promise<void> {
    if (!createDto) throw new BadRequestException('Data to create is required');
    if (createDto.ritualCategoryId) {
      const isCategoryExist = await this.checkForeignKeyExist(
        RitualCategory,
        createDto.ritualCategoryId.toString(),
      );
      if (!isCategoryExist) {
        throw new BadRequestException('Invalid ritualCategoryId');
      }
    }
  }

  protected async createRelationships(
    manager: EntityManager,
    mainEntity: Ritual,
    relationData?: Record<string, any>,
  ): Promise<void> {
    const promises: Promise<any>[] = [];

    if (relationData?.ritualOfferings?.length) {
      for (const offering of relationData.ritualOfferings) {
        const ritualOffering = {
          ritualId: mainEntity.id,
          name: offering.name,
          description: offering.description,
        };
        promises.push(this.ritualOfferingService.create(ritualOffering));
      }
    }

    if (relationData?.ritualTrays?.length) {
      for (const tray of relationData.ritualTrays) {
        const ritualTray = {
          ritualId: mainEntity.id,
          name: tray.name,
        };
        promises.push(this.ritualTrayService.create(ritualTray));
      }
    }

    if (relationData?.ritualMedias?.length) {
      relationData.ritualMedias.forEach((media) => {
        const ritualMedia = {
          ritualId: mainEntity.id,
          type: media.type,
          url: media.url,
          alt: media.alt,
        };
        promises.push(this.ritualMediaService.create(ritualMedia));
      });
    }
    if (relationData?.ritualTags?.length) {
      for (const tag of relationData.ritualTags) {
        const isTagExist = await this.tagService.findOne(tag.tagId);
        if (!isTagExist) {
          throw new BadRequestException(
            `Tag with id ${tag.tagId} does not exist`,
          );
        }
      }
      for (const tag of relationData.ritualTags) {
        const ritualTag = {
          ritualId: mainEntity.id,
          tagId: tag.tagId,
        };
        promises.push(this.ritualTagService.create(ritualTag));
      }
    }
    if (relationData?.ritualPrayers?.length) {
      relationData.ritualPrayers.forEach((prayer) => {
        const ritualPrayer = {
          ritualId: mainEntity.id,
          prayerId: prayer.id,
          name: prayer.name,
          content: prayer.content,
          note: prayer.note,
          description: prayer.description,
        };
        promises.push(this.ritualPrayerService.create(ritualPrayer));
      });
    }
    if (promises.length > 0) {
      await Promise.all(promises);
    }
  }

  /**
   * Optimized updateRelationships with minimal changes approach
   * Only processes actual changes instead of full recreation
   */
  protected async updateRelationships(
    manager: EntityManager,
    mainEntity: Ritual,
    relationData?: Record<string, any>,
  ): Promise<void> {
    const promises: Promise<any>[] = [];
    if (relationData?.ritualOfferings) {
      const existingOfferings =
        await this.ritualOfferingService.findAllByOptions({
          ritualId: mainEntity.id,
        });
      const inputOfferings = relationData.ritualOfferings;
      const existingMap = new Map(
        (existingOfferings ?? []).map((o) => [o.name, o]),
      );
      const inputMap = new Map(inputOfferings.map((o) => [o.name, o]));
      const toAdd = inputOfferings.filter(
        (input) => !existingMap.has(input.name),
      );
      const toRemove = (existingOfferings ?? []).filter(
        (existing) => !inputMap.has(existing.name),
      );

      const toUpdate = inputOfferings.filter((input) => {
        const existing = existingMap.get(input.name);
        return existing && existing.description !== input.description;
      });

      for (const offering of toUpdate) {
        const existing = existingMap.get(offering.name);
        if (existing?.id) {
          promises.push(
            this.ritualOfferingService.update(existing.id, {
              description: offering.description,
            }),
          );
        }
      }
      for (const offering of toAdd) {
        promises.push(
          this.ritualOfferingService.create({
            ritualId: mainEntity.id,
            name: offering.name,
            description: offering.description,
          }),
        );
      }
      for (const offering of toRemove) {
        promises.push(this.ritualOfferingService.remove(offering.id));
      }
    }

    if (relationData?.ritualTrays) {
      const existingTrays = await this.ritualTrayService.findAllByOptions({
        ritualId: mainEntity.id,
      });
      const inputTrays = relationData.ritualTrays;
      const existingMap = new Map(
        (existingTrays ?? []).map((o) => [o.name, o]),
      );
      const inputMap = new Map(inputTrays.map((o) => [o.name, o]));
      const toAdd = inputTrays.filter((input) => !existingMap.has(input.name));
      const toRemove = (existingTrays ?? []).filter(
        (existing) => !inputMap.has(existing.name),
      );
      // No update for trays since only name is stored

      for (const tray of toAdd) {
        promises.push(
          this.ritualTrayService.create({
            ritualId: mainEntity.id,
            name: tray.name,
          }),
        );
      }
      for (const tray of toRemove) {
        promises.push(this.ritualTrayService.remove(tray.id));
      }
    }

    if (relationData?.ritualMedias) {
      const existingMedias = await this.ritualMediaService.findAllByOptions({
        ritualId: mainEntity.id,
      });
      const inputMedias = relationData.ritualMedias;

      const existingMap = new Map(
        (existingMedias ?? []).map((m) => [m.url, m]),
      );
      const inputMap = new Map(inputMedias.map((m) => [m.url, m]));

      const toAdd = inputMedias.filter((input) => !existingMap.has(input.url));
      const toRemove = (existingMedias ?? []).filter(
        (existing) => !inputMap.has(existing.url),
      );
      const toUpdate = inputMedias.filter((input) => {
        const existing = existingMap.get(input.url);
        return (
          existing &&
          (existing.type !== input.type || existing.alt !== input.alt)
        );
      });

      for (const media of toAdd) {
        promises.push(
          this.ritualMediaService.create({
            ritualId: mainEntity.id,
            type: media.type,
            url: media.url,
            alt: media.alt,
          }),
        );
      }
      for (const media of toRemove) {
        promises.push(this.ritualMediaService.remove(media.id));
      }
      for (const media of toUpdate) {
        const existing = existingMap.get(media.url);
        if (existing?.id) {
          promises.push(
            this.ritualMediaService.update(existing.id, {
              type: media.type,
              alt: media.alt,
            }),
          );
        }
      }
    }

    // Optimized ritualTags update
    if (relationData?.ritualTags) {
      const existingTags = await this.ritualTagService.findAllByOptions({
        ritualId: mainEntity.id,
      });
      const inputTags = relationData.ritualTags;

      const existingMap = new Map(
        (existingTags ?? []).map((t) => [t.tagId, t]),
      );
      const inputMap = new Map(inputTags.map((t) => [t.tagId, t]));

      const toAdd = inputTags.filter((input) => !existingMap.has(input.tagId));
      const toRemove = (existingTags ?? []).filter(
        (existing) => !inputMap.has(existing.tagId),
      );
      // No update for tags since only tagId is stored

      for (const tag of toAdd) {
        promises.push(
          this.ritualTagService.create({
            ritualId: mainEntity.id,
            tagId: tag.tagId,
          }),
        );
      }
      for (const tag of toRemove) {
        promises.push(this.ritualTagService.remove(tag.id));
      }
    }

    // Optimized ritualPrayers update
    if (relationData?.ritualPrayers) {
      const existingPrayers = await this.ritualPrayerService.findAllByOptions({
        ritualId: mainEntity.id,
      });
      const inputPrayers = relationData.ritualPrayers;

      const existingMap = new Map(
        (existingPrayers ?? []).map((p) => [p.name, p]),
      );
      const inputMap = new Map(inputPrayers.map((p) => [p.name, p]));

      const toAdd = inputPrayers.filter(
        (input) => !existingMap.has(input.name),
      );
      const toRemove = (existingPrayers ?? []).filter(
        (existing) => !inputMap.has(existing.name),
      );
      const toUpdate = inputPrayers.filter((input) => {
        const existing = existingMap.get(input.name);
        return (
          existing &&
          (existing.note !== input.note ||
            existing.description !== input.description)
        );
      });

      for (const prayer of toAdd) {
        promises.push(
          this.ritualPrayerService.create({
            ritualId: mainEntity.id,
            name: prayer.name,
            content: prayer.content,
            note: prayer.note,
            description: prayer.description,
          }),
        );
      }
      for (const prayer of toRemove) {
        promises.push(this.ritualPrayerService.remove(prayer.id));
      }
      for (const prayer of toUpdate) {
        const existing = existingMap.get(prayer.name);
        if (existing?.id) {
          promises.push(
            this.ritualPrayerService.update(existing.id, {
              note: prayer.note,
              description: prayer.description,
            }),
          );
        }
      }
    }

    if (promises.length > 0) {
      await Promise.all(promises);
      this.logger.log(
        `Optimized update completed: ${promises.length} operations`,
      );
    }
  }
}
