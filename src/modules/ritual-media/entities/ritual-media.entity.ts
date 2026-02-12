import { AbstractEntity } from 'src/common/base/entity.base';
import { MediaType } from 'src/common/enums/media.enum';
import { Ritual } from 'src/modules/ritual/entities/ritual.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity({ name: 'ritual_medias' })
export class RitualMedia extends AbstractEntity {
  @Column({ type: 'enum', enum: MediaType, default: MediaType.IMAGE })
  type: MediaType;

  @Column({ nullable: true })
  url: string;

  @Column({ nullable: true })
  alt: string;

  @Column({ name: 'ritual_id' })
  ritualId: string;

  @ManyToOne(() => Ritual, (ritual) => ritual.ritualMedias)
  @JoinColumn({ name: 'ritual_id' })
  ritual: Ritual;

  constructor(partial: Partial<RitualMedia>) {
    super();
    Object.assign(this, partial);
  }
}
