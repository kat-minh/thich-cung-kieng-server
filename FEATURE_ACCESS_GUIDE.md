# Feature-Based Access Control System

Hệ thống này cho phép bạn kiểm soát quyền truy cập vào các tính năng dựa trên gói subscription của user.

## Cấu trúc hệ thống

### 1. Database Schema
- `subscription_plans`: Các gói dịch vụ (free, premium, vip, etc.)
- `subscription_features`: Các tính năng có thể có (advanced_chat, premium_rituals, etc.)
- `plan_features`: Mapping giữa plans và features
- `user_subscriptions`: Subscription của từng user

### 2. Components

#### FeatureAccessService
Service chính để kiểm tra quyền truy cập tính năng:
```typescript
// Kiểm tra một tính năng
await featureAccessService.checkFeatureAccess(userId, 'advanced_chat');

// Kiểm tra nhiều tính năng (cần tất cả)
await featureAccessService.checkMultipleFeatureAccess(userId, ['advanced_chat', 'premium_support']);

// Kiểm tra một trong nhiều tính năng
await featureAccessService.checkAnyFeatureAccess(userId, ['premium_rituals', 'vip_rituals']);
```

#### Decorators
```typescript
@RequireFeature('advanced_chat')        // Cần một tính năng
@RequireFeatures(['chat', 'support'])   // Cần tất cả tính năng
@RequireAnyFeature(['premium', 'vip'])  // Cần ít nhất một tính năng
```

#### Guards
- `FeatureGuard`: Kiểm tra tính năng cụ thể
- `SubscriptionGuard`: Kiểm tra subscription hoạt động (đã được cải tiến)

## Cách sử dụng

### 1. Cấu hình cơ bản trong Module

```typescript
import { Module } from '@nestjs/common';
import { FeatureAccessService } from 'src/common/services/feature-access.service';
import { UserSubscriptionModule } from 'src/modules/user-subscription/user-subscription.module';

@Module({
  imports: [UserSubscriptionModule],
  providers: [FeatureAccessService],
  exports: [FeatureAccessService],
})
export class FeatureAccessModule {}
```

### 2. Sử dụng trong Controller

#### Example 1: Chat với tính năng nâng cao
```typescript
import { Controller, Post, UseGuards } from '@nestjs/common';
import { GlobalAuthGuard } from 'src/common/guards/global-auth.guard';
import { FeatureGuard } from 'src/common/guards/feature.guard';
import { RequireFeature } from 'src/common/decorators/require-feature.decorator';

@Controller('chat')
@UseGuards(GlobalAuthGuard) // Đảm bảo user đã đăng nhập
export class ChatController {
  
  // Tính năng chat cơ bản - không cần premium
  @Post('basic')
  async basicChat() {
    return { message: 'Basic chat available for all users' };
  }

  // Tính năng chat nâng cao - cần premium
  @Post('advanced')
  @UseGuards(FeatureGuard)
  @RequireFeature('advanced_chat')
  async advancedChat() {
    return { message: 'Advanced chat with AI features' };
  }

  // Tính năng chat với voice - cần premium hoặc vip
  @Post('voice')
  @UseGuards(FeatureGuard)
  @RequireAnyFeature(['voice_chat', 'premium_voice'])
  async voiceChat() {
    return { message: 'Voice chat enabled' };
  }
}
```

#### Example 2: Ritual với các tính năng khác nhau
```typescript
@Controller('rituals')
@UseGuards(GlobalAuthGuard)
export class RitualController {

  // Xem rituals miễn phí
  @Get('free')
  async getFreeRituals() {
    return { rituals: 'Free rituals list' };
  }

  // Xem rituals premium
  @Get('premium')
  @UseGuards(FeatureGuard)
  @RequireFeature('premium_rituals')
  async getPremiumRituals() {
    return { rituals: 'Premium rituals list' };
  }

  // Tạo ritual custom - cần cả premium rituals và custom features
  @Post('custom')
  @UseGuards(FeatureGuard)
  @RequireFeatures(['premium_rituals', 'custom_rituals'])
  async createCustomRitual() {
    return { message: 'Custom ritual created' };
  }

  // VIP exclusive rituals
  @Get('vip')
  @UseGuards(FeatureGuard)
  @RequireFeature('vip_exclusive')
  async getVipRituals() {
    return { rituals: 'VIP exclusive rituals' };
  }
}
```

#### Example 3: Kết hợp với SubscriptionGuard
```typescript
@Controller('premium')
@UseGuards(GlobalAuthGuard, SubscriptionGuard) // Đảm bảo có subscription hoạt động
export class PremiumController {

  // Kiểm tra thông tin subscription
  @Get('info')
  async getSubscriptionInfo(@Req() request) {
    return {
      subscription: request.subscription,
      features: request.userFeatures
    };
  }

  // Tính năng chỉ dành cho premium+
  @Post('exclusive')
  @UseGuards(FeatureGuard)
  @RequireFeature('premium_exclusive')
  async premiumExclusive() {
    return { message: 'Premium exclusive feature' };
  }
}
```

### 3. Xử lý trong Service (Manual check)

```typescript
import { Injectable } from '@nestjs/common';
import { FeatureAccessService } from 'src/common/services/feature-access.service';

@Injectable()
export class SomeService {
  constructor(
    private readonly featureAccessService: FeatureAccessService,
  ) {}

  async doSomething(userId: string) {
    // Kiểm tra manual
    const hasAccess = await this.featureAccessService.checkFeatureAccess(
      userId,
      'advanced_feature'
    );

    if (!hasAccess.hasAccess) {
      throw new ForbiddenException(
        `Access denied: ${hasAccess.reason}. Please upgrade your plan.`
      );
    }

    // Tiếp tục logic
    return 'Feature executed successfully';
  }
}
```

## Các tính năng thường gặp

### Chat System
- `basic_chat`: Chat cơ bản (free)
- `advanced_chat`: Chat với AI nâng cao (premium)
- `voice_chat`: Chat bằng giọng nói (premium)
- `unlimited_chat`: Không giới hạn tin nhắn (vip)

### Ritual System
- `basic_rituals`: Rituals cơ bản (free)
- `premium_rituals`: Rituals cao cấp (premium)
- `custom_rituals`: Tạo rituals riêng (premium)
- `vip_exclusive`: Rituals độc quyền (vip)

### Prayer System
- `basic_prayers`: Cầu nguyện cơ bản (free)
- `unlimited_prayers`: Không giới hạn cầu nguyện (premium)
- `priority_prayers`: Cầu nguyện ưu tiên (vip)

### Support
- `basic_support`: Hỗ trợ cơ bản (free)
- `premium_support`: Hỗ trợ 24/7 (premium)
- `dedicated_support`: Hỗ trợ riêng (vip)

## Error Handling

Khi user không có quyền truy cập, hệ thống sẽ trả về `ForbiddenException` với thông tin chi tiết:

```json
{
  "message": "Access denied: Feature not included in current plan. Required feature: advanced_chat. Your current plan: Free Plan. Your available features: basic_chat, basic_rituals",
  "error": "Forbidden",
  "statusCode": 403
}
```

## Best Practices

1. **Always use GlobalAuthGuard first**: Đảm bảo user đã đăng nhập
2. **Combine guards properly**: `@UseGuards(GlobalAuthGuard, FeatureGuard)`
3. **Use specific feature names**: Tên tính năng nên rõ ràng và nhất quán
4. **Handle errors gracefully**: Cung cấp thông tin để user hiểu cách upgrade
5. **Log access attempts**: Để theo dõi và phân tích usage patterns

## Migration/Setup

Đảm bảo bạn đã có data trong database:

```sql
-- Tạo subscription plans
INSERT INTO subscription_plans (name, description, price, duration_days) VALUES
('Free Plan', 'Basic features', 0, 30),
('Premium Plan', 'Advanced features', 99000, 30),
('VIP Plan', 'All features', 199000, 30);

-- Tạo features
INSERT INTO subscription_features (name, description) VALUES
('basic_chat', 'Basic chat functionality'),
('advanced_chat', 'Advanced AI chat'),
('premium_rituals', 'Premium ritual access'),
('vip_exclusive', 'VIP exclusive content');

-- Map features to plans
INSERT INTO plan_features (subscription_plan_id, subscription_feature_id) VALUES
-- Free plan chỉ có basic_chat
((SELECT id FROM subscription_plans WHERE name = 'Free Plan'), 
 (SELECT id FROM subscription_features WHERE name = 'basic_chat')),

-- Premium plan có basic_chat và advanced_chat và premium_rituals
((SELECT id FROM subscription_plans WHERE name = 'Premium Plan'), 
 (SELECT id FROM subscription_features WHERE name = 'basic_chat')),
((SELECT id FROM subscription_plans WHERE name = 'Premium Plan'), 
 (SELECT id FROM subscription_features WHERE name = 'advanced_chat')),
((SELECT id FROM subscription_plans WHERE name = 'Premium Plan'), 
 (SELECT id FROM subscription_features WHERE name = 'premium_rituals')),

-- VIP plan có tất cả
((SELECT id FROM subscription_plans WHERE name = 'VIP Plan'), 
 (SELECT id FROM subscription_features WHERE name = 'basic_chat')),
((SELECT id FROM subscription_plans WHERE name = 'VIP Plan'), 
 (SELECT id FROM subscription_features WHERE name = 'advanced_chat')),
((SELECT id FROM subscription_plans WHERE name = 'VIP Plan'), 
 (SELECT id FROM subscription_features WHERE name = 'premium_rituals')),
((SELECT id FROM subscription_plans WHERE name = 'VIP Plan'), 
 (SELECT id FROM subscription_features WHERE name = 'vip_exclusive'));
```