import { AbstractEntity } from 'src/common/base/entity.base';
import { Ritual } from 'src/modules/ritual/entities/ritual.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity({ name: 'ritual_trays' })
export class RitualTray extends AbstractEntity {
  @Column()
  name: string;

  @Column({ name: 'ritual_id' })
  ritualId: string;

  @ManyToOne(() => Ritual, (ritual) => ritual.ritualTrays)
  @JoinColumn({ name: 'ritual_id' })
  ritual: Ritual;

  constructor(partial: Partial<RitualTray>) {
    super();
    Object.assign(this, partial);
  }
}
