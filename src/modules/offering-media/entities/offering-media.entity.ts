import { AbstractEntity } from 'src/common/base/entity.base';
import { MediaType } from 'src/common/enums/media.enum';
import { RitualOffering } from 'src/modules/ritual-offering/entities/ritual-offering.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity('offering_media')
export class OfferingMedia extends AbstractEntity {
  @Column({ type: 'enum', enum: MediaType, default: MediaType.IMAGE })
  type: MediaType;

  @Column({ nullable: true })
  url: string;

  @Column({ nullable: true })
  alt: string;

  @Column({ name: 'offering_id' })
  offeringId: string;

  @ManyToOne(
    () => RitualOffering,
    (ritualOffering) => ritualOffering.offeringMedias,
  )
  @JoinColumn({ name: 'offering_id' })
  ritualOffering: RitualOffering;

  constructor(partial: Partial<OfferingMedia>) {
    super();
    Object.assign(this, partial);
  }
}
