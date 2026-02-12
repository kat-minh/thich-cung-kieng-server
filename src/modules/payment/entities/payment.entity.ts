import { AbstractEntity } from 'src/common/base/entity.base';
import { PaymentProvider } from 'src/common/enums/payment-provider.enum';
import { PaymentStatus } from 'src/common/enums/payment.enum';
import { PaymentLog } from 'src/modules/payment-log/entities/payment-log.entity';
import { UserSubscription } from 'src/modules/user-subscription/entities/user-subscription.entity';
import { User } from 'src/modules/user/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';

@Entity({ name: 'payments' })
export class Payment extends AbstractEntity {
  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'user_subscription_id' })
  userSubscriptionId: string;

  @Column({ name: 'total_amount', type: 'decimal', precision: 12, scale: 2 })
  totalAmount: number;

  @Column({ type: 'varchar', length: 10, default: 'VND' })
  currency: string;

  @Column({
    type: 'enum',
    enum: PaymentProvider,
    default: PaymentProvider.MOMO,
  })
  provider: PaymentProvider;

  @Column({ type: 'varchar', length: 100, nullable: true })
  transactionCode: string;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @OneToMany(() => PaymentLog, (paymentLog) => paymentLog.payment, {
    cascade: true,
  })
  paymentLogs: PaymentLog[];

  @ManyToOne(() => User, (user) => user.payments)
  user: User;

  @OneToOne(
    () => UserSubscription,
    (userSubscription) => userSubscription.payment,
  )
  @JoinColumn({ name: 'user_subscription_id' })
  userSubscription: UserSubscription;

  constructor(partial: Partial<Payment>) {
    super();
    Object.assign(this, partial);
  }
}
