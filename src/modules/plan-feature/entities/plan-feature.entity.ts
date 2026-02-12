import { AbstractEntity } from 'src/common/base/entity.base';
import { SubscriptionFeature } from 'src/modules/subscription-feature/entities/subscription-feature.entity';
import { SubscriptionPlan } from 'src/modules/subscription-plan/entities/subscription-plan.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity({ name: 'plan_features' })
export class PlanFeature extends AbstractEntity {
  @Column({ name: 'subscription_plan_id' })
  subscriptionPlanId: string;

  @Column({ name: 'subscription_feature_id' })
  subscriptionFeatureId: string;

  @ManyToOne(
    () => SubscriptionFeature,
    (subscriptionFeature) => subscriptionFeature.planFeatures,
  )
  @JoinColumn({ name: 'subscription_feature_id' })
  subscriptionFeature: SubscriptionFeature;

  @ManyToOne(
    () => SubscriptionPlan,
    (subscriptionPlan) => subscriptionPlan.planFeatures,
  )
  @JoinColumn({ name: 'subscription_plan_id' })
  subscriptionPlan: SubscriptionPlan;

  constructor(partial: Partial<PlanFeature>) {
    super();
    Object.assign(this, partial);
  }
}
