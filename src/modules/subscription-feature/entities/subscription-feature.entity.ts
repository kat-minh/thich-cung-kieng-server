import { AbstractEntity } from "src/common/base/entity.base";
import { PlanFeature } from "src/modules/plan-feature/entities/plan-feature.entity";
import { Column, Entity, OneToMany } from "typeorm";

@Entity({ name: 'subscription_features' })
export class SubscriptionFeature extends AbstractEntity {
    @Column()
    name: string;

    @Column({ nullable: true })
    description: string;

    @OneToMany(() => PlanFeature, (planFeature) => planFeature.subscriptionFeature, { cascade: true })
    planFeatures: PlanFeature[];

    constructor(partial: Partial<SubscriptionFeature>) {
        super();
        Object.assign(this, partial);
    }
}
