import { AbstractEntity } from 'src/common/base/entity.base';
import {
  UserEventRepeatRule,
  UserEventStatus,
  UserEventType,
} from 'src/common/enums/user-event.enum';
import { User } from 'src/modules/user/entities/user.entity';
import { UserEventOffering } from 'src/modules/user_event_offering/entities/user_event_offering.entity';
import { UserEventReminder } from 'src/modules/user_event_reminder/entities/user_event_reminder.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';

@Entity('user_events')
export class UserEvent extends AbstractEntity {
  @Column({ name: 'user_id' })
  userId: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  location: string;

  @Column({ name: 'event_date' })
  eventDate: Date;

  @Column({
    name: 'repeat_rule',
    type: 'enum',
    enum: UserEventRepeatRule,
    default: UserEventRepeatRule.NONE,
  })
  repeatRule: UserEventRepeatRule;

  @Column({
    name: 'event_type',
    type: 'enum',
    enum: UserEventType,
    default: UserEventType.PERSONAL,
  })
  eventType: UserEventType;

  @Column({
    type: 'enum',
    enum: UserEventStatus,
    default: UserEventStatus.ACTIVE,
  })
  status: UserEventStatus;

  @ManyToOne(() => User, (user) => user.id)
  user: User;

  @OneToMany(() => UserEventReminder, (reminder) => reminder.userEvent, {
    cascade: true,
  })
  reminders: UserEventReminder[];

  @OneToMany(() => UserEventOffering, (offering) => offering.userEvent)
  offerings: UserEventOffering[];
  constructor(partial: Partial<UserEvent>) {
    super();
    Object.assign(this, partial);
  }
}
