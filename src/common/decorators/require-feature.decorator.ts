import { SetMetadata } from '@nestjs/common';

export const REQUIRE_FEATURE_KEY = 'require_feature';

/**
 * Decorator để chỉ định tính năng nào cần thiết để truy cập endpoint
 * @param featureName - Tên tính năng cần thiết (phải khớp với name trong SubscriptionFeature)
 * @example
 * @RequireFeature('advanced_chat')
 * @RequireFeature('premium_rituals')
 * @RequireFeature('unlimited_prayers')
 */
export const RequireFeature = (featureName: string) =>
  SetMetadata(REQUIRE_FEATURE_KEY, featureName);

/**
 * Decorator để chỉ định nhiều tính năng cần thiết (cần tất cả)
 * @param featureNames - Danh sách tên tính năng cần thiết
 * @example
 * @RequireFeatures(['advanced_chat', 'premium_support'])
 */
export const RequireFeatures = (featureNames: string[]) =>
  SetMetadata(REQUIRE_FEATURE_KEY, featureNames);

/**
 * Decorator để chỉ định một trong nhiều tính năng cần thiết
 * @param featureNames - Danh sách tên tính năng (chỉ cần một trong số đó)
 * @example
 * @RequireAnyFeature(['premium_rituals', 'vip_rituals'])
 */
export const RequireAnyFeature = (featureNames: string[]) =>
  SetMetadata(REQUIRE_FEATURE_KEY, { anyOf: featureNames });