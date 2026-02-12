import { AbstractEntity } from 'src/common/base/entity.base';
import { Ritual } from 'src/modules/ritual/entities/ritual.entity';
import { User } from 'src/modules/user/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity({ name: 'ritual_reviews' })
export class RitualReview extends AbstractEntity {
  @Column({ name: 'ritual_id' })
  ritualId: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ nullable: true })
  rating: number;

  @Column({ nullable: true })
  comment: string;

  @ManyToOne(() => Ritual, (ritual) => ritual.ritualReviews)
  @JoinColumn({ name: 'ritual_id' })
  ritual: Ritual;

  @ManyToOne(() => User, (user) => user.ritualReviews)
  @JoinColumn({ name: 'user_id' })
  user: User;
  constructor(partial: Partial<RitualReview>) {
    super();
    Object.assign(this, partial);
  }
}
