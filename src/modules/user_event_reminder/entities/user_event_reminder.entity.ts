import { AbstractEntity } from 'src/common/base/entity.base';
import {
  NotifyMethod,
  UserEventReminderStatus,
} from 'src/common/enums/user-event-reminder.enum';
import { UserEvent } from 'src/modules/user-event/entities/user-event.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity('user_event_reminders')
export class UserEventReminder extends AbstractEntity {
  @Column({ name: 'user_event_id' })
  userEventId: string;

  @Column({ name: 'remind_before' })
  remindBefore: number; // in minutes

  @Column({
    name: 'notify_method',
    type: 'enum',
    enum: NotifyMethod,
    default: NotifyMethod.EMAIL,
  })
  notifyMethod: NotifyMethod;

  @Column({
    type: 'enum',
    enum: UserEventReminderStatus,
    default: UserEventReminderStatus.PENDING,
  })
  status: UserEventReminderStatus;

  @ManyToOne(() => UserEvent, (userEvent) => userEvent.reminders)
  @JoinColumn({ name: 'user_event_id' })
  userEvent: UserEvent;
  constructor(partial: Partial<UserEventReminder>) {
    super();
    Object.assign(this, partial);
  }
}
