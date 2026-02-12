import { AbstractEntity } from 'src/common/base/entity.base';
import { Ritual } from 'src/modules/ritual/entities/ritual.entity';
import { User } from 'src/modules/user/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity({ name: 'user_favorite_rituals' })
export class UserFavoriteRitual extends AbstractEntity {
  @Column({ name: 'user_id' })
  userId: string;
  @Column({ name: 'ritual_id' })
  ritualId: string;
  @ManyToOne(() => User, (user) => user.favoriteRituals)
  @JoinColumn({ name: 'user_id' })
  user: User;
  @ManyToOne(() => Ritual, (ritual) => ritual.favoriteByUsers)
  @JoinColumn({ name: 'ritual_id' })
  ritual: Ritual;
  constructor(partial: Partial<UserFavoriteRitual>) {
    super();
    Object.assign(this, partial);
  }
}
