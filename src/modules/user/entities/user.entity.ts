import { AbstractEntity } from 'src/common/base/entity.base';
import { UserRole } from 'src/common/enums/user.enum';
import { ChatSession } from 'src/modules/chat-session/entities/chat-session.entity';
import { Payment } from 'src/modules/payment/entities/payment.entity';
import { RitualReview } from 'src/modules/ritual-review/entities/ritual-review.entity';
import { UserEvent } from 'src/modules/user-event/entities/user-event.entity';
import { UserFavoriteRitual } from 'src/modules/user-favorite-ritual/entities/user-favorite-ritual.entity';
import { UserSubscription } from 'src/modules/user-subscription/entities/user-subscription.entity';
import { Column, Entity, OneToMany, OneToOne } from 'typeorm';

@Entity({ name: 'users' })
export class User extends AbstractEntity {
  @Column({ name: 'full_name', nullable: true })
  fullName?: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  password: string;

  @Column({ nullable: true, type: 'date' })
  birthday?: Date;

  @Column({ nullable: true })
  phone?: string;

  @Column({ name: 'profile_picture', nullable: true })
  profilePicture?: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
    nullable: false,
  })
  role: UserRole;

  @Column({ name: 'refresh_token', nullable: true })
  refreshToken: string;

  @OneToMany(
    () => UserSubscription,
    (userSubscription) => userSubscription.user,
  )
  userSubscriptions: UserSubscription[];

  @OneToMany(() => Payment, (payment) => payment.user)
  payments: Payment[];

  @OneToMany(() => UserEvent, (userEvent) => userEvent.user)
  userEvents: UserEvent[];

  @OneToMany(() => RitualReview, (ritualReview) => ritualReview.user)
  ritualReviews: RitualReview[];

  @OneToMany(() => UserFavoriteRitual, (ufr) => ufr.user)
  favoriteRituals: UserFavoriteRitual[];

  @OneToOne(() => ChatSession, (chatSession) => chatSession.user)
  chatSession: ChatSession;
  constructor(partial: Partial<User>) {
    super();
    Object.assign(this, partial);
  }
}
