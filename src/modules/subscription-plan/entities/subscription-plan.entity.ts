import { AbstractEntity } from 'src/common/base/entity.base';
import { PlanFeature } from 'src/modules/plan-feature/entities/plan-feature.entity';
import { UserSubscription } from 'src/modules/user-subscription/entities/user-subscription.entity';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity({ name: 'subscription_plans' })
export class SubscriptionPlan extends AbstractEntity {
  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  price: number;

  @Column({ type: 'int', name: 'duration_days', nullable: false })
  durationDays: number;

  @OneToMany(
    () => UserSubscription,
    (userSubscription) => userSubscription.subscriptionPlan,
    { cascade: true },
  )
  userSubscriptions: UserSubscription[];

  @OneToMany(() => PlanFeature, (planFeature) => planFeature.subscriptionPlan, {
    cascade: true,
  })
  planFeatures: PlanFeature[];

  constructor(partial: Partial<SubscriptionPlan>) {
    super();
    Object.assign(this, partial);
  }
}
