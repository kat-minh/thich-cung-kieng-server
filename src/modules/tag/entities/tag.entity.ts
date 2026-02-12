import { AbstractEntity } from 'src/common/base/entity.base';
import { RitualTag } from 'src/modules/ritual-tag/entities/ritual-tag.entity';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity({ name: 'tags' })
export class Tag extends AbstractEntity {
  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @OneToMany(() => RitualTag, (ritualTag) => ritualTag.tag, { cascade: true })
  ritualTags: RitualTag[];

  constructor(partial: Partial<Tag>) {
    super();
    Object.assign(this, partial);
  }
}
