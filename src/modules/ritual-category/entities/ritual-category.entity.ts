import { AbstractEntity } from 'src/common/base/entity.base';
import { Ritual } from 'src/modules/ritual/entities/ritual.entity';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity({ name: 'ritual_categories' })
export class RitualCategory extends AbstractEntity {
  @Column({ nullable: false })
  name: string;

  @OneToMany(() => Ritual, (ritual) => ritual.ritualCategory, { cascade: true })
  rituals: Ritual[];

  constructor(partial: Partial<RitualCategory>) {
    super();
    Object.assign(this, partial);
  }
}
