import {
  Controller,
  Get,
  Post,
  UseGuards,
  Req,
  Body,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { GlobalAuthGuard } from 'src/common/guards/global-auth.guard';
import { FeatureGuard } from 'src/common/guards/feature.guard';
import { SubscriptionGuard } from 'src/common/guards/subscription.guard';
import {
  RequireFeature,
  RequireFeatures,
  RequireAnyFeature,
} from 'src/common/decorators/require-feature.decorator';

@ApiTags('Feature Examples')
@Controller('examples/features')
@ApiBearerAuth()
@UseGuards(GlobalAuthGuard) // Đảm bảo user đã đăng nhập
export class FeatureExampleController {
  
  @Get('free')
  @ApiOperation({ summary: 'Free feature - accessible to all users' })
  @ApiResponse({ status: 200, description: 'Success' })
  async freeFeature() {
    return {
      message: 'This is a free feature available to all authenticated users',
      level: 'free',
    };
  }

  @Get('premium-chat')
  @UseGuards(FeatureGuard)
  @RequireFeature('advanced_chat')
  @ApiOperation({ summary: 'Advanced chat - requires premium subscription' })
  @ApiResponse({ status: 200, description: 'Access granted' })
  @ApiResponse({ status: 403, description: 'Feature not available in current plan' })
  async premiumChat(@Req() request) {
    return {
      message: 'Welcome to advanced AI chat!',
      level: 'premium',
      userPlan: request.subscription?.subscriptionDetails?.plan?.name,
      userFeatures: request.userFeatures,
    };
  }

  @Get('premium-rituals')
  @UseGuards(FeatureGuard)
  @RequireFeature('premium_rituals')
  @ApiOperation({ summary: 'Premium rituals - requires premium subscription' })
  async premiumRituals() {
    return {
      message: 'Access to premium ritual collection',
      rituals: [
        { name: 'Golden Lotus Meditation', level: 'premium' },
        { name: 'Sacred Fire Ceremony', level: 'premium' },
        { name: 'Moon Blessing Ritual', level: 'premium' },
      ],
    };
  }

  @Get('vip-exclusive')
  @UseGuards(FeatureGuard)
  @RequireFeature('vip_exclusive')
  @ApiOperation({ summary: 'VIP exclusive content - requires VIP subscription' })
  async vipExclusive() {
    return {
      message: 'VIP exclusive content unlocked!',
      content: [
        'Personal spiritual consultation',
        'Custom ritual creation',
        'Direct access to masters',
      ],
    };
  }

  @Post('multi-feature-required')
  @UseGuards(FeatureGuard)
  @RequireFeatures(['advanced_chat', 'premium_rituals'])
  @ApiOperation({ 
    summary: 'Multi-feature endpoint - requires both advanced chat AND premium rituals' 
  })
  async multiFeatureRequired(@Body() data: any) {
    return {
      message: 'This endpoint requires BOTH advanced chat and premium rituals',
      data,
      requiredFeatures: ['advanced_chat', 'premium_rituals'],
    };
  }

  @Post('any-premium-feature')
  @UseGuards(FeatureGuard)
  @RequireAnyFeature(['advanced_chat', 'premium_rituals', 'vip_exclusive'])
  @ApiOperation({ 
    summary: 'Flexible access - requires ANY premium feature' 
  })
  async anyPremiumFeature(@Body() data: any) {
    return {
      message: 'This endpoint requires AT LEAST ONE of the specified premium features',
      data,
      acceptedFeatures: ['advanced_chat', 'premium_rituals', 'vip_exclusive'],
    };
  }

  @Get('subscription-info')
  @UseGuards(SubscriptionGuard)
  @ApiOperation({ summary: 'Get current subscription info' })
  async getSubscriptionInfo(@Req() request) {
    return {
      subscription: request.subscription,
      features: request.userFeatures,
      hasActiveSubscription: request.subscription?.hasActiveSubscription,
    };
  }

  @Get('combined-guards')
  @UseGuards(SubscriptionGuard, FeatureGuard)
  @RequireFeature('advanced_chat')
  @ApiOperation({ 
    summary: 'Combined guards - requires active subscription AND specific feature' 
  })
  async combinedGuards(@Req() request) {
    return {
      message: 'This endpoint uses both SubscriptionGuard and FeatureGuard',
      subscription: request.subscription,
      features: request.userFeatures,
      note: 'User must have active subscription AND advanced_chat feature',
    };
  }

  @Get('user-features')
  @ApiOperation({ summary: 'Get all features available to current user' })
  async getUserFeatures(@Req() request) {
    // Nếu có SubscriptionGuard thì features đã được load
    const features = request.userFeatures || [];
    
    return {
      message: 'Your available features',
      features,
      totalFeatures: features.length,
      isFreePlan: features.length === 1 && features.includes('basic_chat'),
    };
  }
}