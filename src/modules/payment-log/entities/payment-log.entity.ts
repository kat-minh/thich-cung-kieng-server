import { AbstractEntity } from 'src/common/base/entity.base';
import { PaymentStatus } from 'src/common/enums/payment.enum';
import { Payment } from 'src/modules/payment/entities/payment.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity({ name: 'payment_logs' })
export class PaymentLog extends AbstractEntity {
  @Column({
    name: 'status',
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Column()
  description: string;

  @Column({ name: 'payment_id' })
  paymentId: string;

  @ManyToOne(() => Payment, (payment) => payment.paymentLogs)
  payment: Payment;

  constructor(partial: Partial<PaymentLog>) {
    super();
    Object.assign(this, partial);
  }
}
