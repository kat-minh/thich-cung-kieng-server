import { UserSubscriptionStatus } from 'src/common/enums/user-subscription.enum';

export interface SubscriptionCheckResult {
  hasActiveSubscription: boolean;
  subscriptionStatus: UserSubscriptionStatus;
  subscriptionDetails: {
    startDate?: Date;
    endDate?: Date;
    autoRenew?: boolean;
    daysRemaining?: number;
    plan?: {
      id?: string;
      name?: string;
      price?: number;
      durationDays?: number;
    };
    status?: UserSubscriptionStatus;
  } | null;
  message: string;
  checkTimestamp?: Date;
}

export interface LoginWithSubscriptionResponse {
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
  subscription: SubscriptionCheckResult;
}
