import { AbstractEntity } from 'src/common/base/entity.base';
import { Ritual } from 'src/modules/ritual/entities/ritual.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity({ name: 'prayers' })
export class Prayer extends AbstractEntity {
  @Column()
  name: string;

  @Column()
  content: string;

  @Column({ nullable: true })
  note: string;

  @Column({ nullable: true })
  description: string;

  @Column({ name: 'ritual_id' })
  ritualId: string;

  @ManyToOne(() => Ritual, (ritual) => ritual.prayers)
  @JoinColumn({ name: 'ritual_id' })
  ritual: Ritual;

  constructor(partial: Partial<Prayer>) {
    super();
    Object.assign(this, partial);
  }
}
