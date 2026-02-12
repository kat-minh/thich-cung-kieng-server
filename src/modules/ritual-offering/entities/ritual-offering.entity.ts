import { AbstractEntity } from 'src/common/base/entity.base';
import { OfferingMedia } from 'src/modules/offering-media/entities/offering-media.entity';
import { Ritual } from 'src/modules/ritual/entities/ritual.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

@Entity({ name: 'ritual_offerings' })
export class RitualOffering extends AbstractEntity {
  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ name: 'ritual_id' })
  ritualId: string;

  @OneToMany(
    () => OfferingMedia,
    (offeringMedia) => offeringMedia.ritualOffering,
    {
      cascade: true,
    },
  )
  offeringMedias: OfferingMedia[];

  @ManyToOne(() => Ritual, (ritual) => ritual.ritualOfferings)
  @JoinColumn({ name: 'ritual_id' })
  ritual: Ritual;

  constructor(partial: Partial<RitualOffering>) {
    super();
    Object.assign(this, partial);
  }
}
