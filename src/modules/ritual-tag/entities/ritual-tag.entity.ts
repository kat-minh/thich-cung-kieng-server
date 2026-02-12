import { AbstractEntity } from 'src/common/base/entity.base';
import { Ritual } from 'src/modules/ritual/entities/ritual.entity';
import { Tag } from 'src/modules/tag/entities/tag.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity({ name: 'ritual_tags' })
export class RitualTag extends AbstractEntity {
  @Column({ name: 'ritual_id' })
  ritualId: string;

  @Column({ name: 'tag_id' })
  tagId: string;

  @ManyToOne(() => Ritual, (ritual) => ritual.ritualTags)
  @JoinColumn({ name: 'ritual_id' })
  ritual: Ritual;

  @ManyToOne(() => Tag, (tag) => tag.ritualTags)
  @JoinColumn({ name: 'tag_id' })
  tag: Tag;

  constructor(partial: Partial<RitualTag>) {
    super();
    Object.assign(this, partial);
  }
}
