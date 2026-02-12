import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { REQUIRE_FEATURE_KEY } from '../decorators/require-feature.decorator';
import { FeatureAccessService } from '../../modules/auth/services/feature-access.service';

@Injectable()
export class FeatureGuard implements CanActivate {
  private readonly logger = new Logger(FeatureGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly featureAccessService: FeatureAccessService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Lấy metadata từ decorator
    const requiredFeature = this.reflector.getAllAndOverride(
      REQUIRE_FEATURE_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Nếu không có feature requirement, cho phép truy cập
    if (!requiredFeature) {
      this.logger.debug('No feature requirement found, allowing access');
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      this.logger.warn('No user found in request');
      throw new ForbiddenException('Authentication required');
    }

    try {
      let accessResult;

      // Xử lý các loại requirement khác nhau
      if (typeof requiredFeature === 'string') {
        // Single feature requirement
        this.logger.log(
          `Checking single feature access: ${requiredFeature} for user ${user.id}`,
        );
        accessResult = await this.featureAccessService.checkFeatureAccess(
          user.id,
          requiredFeature,
        );
      } else if (Array.isArray(requiredFeature)) {
        // Multiple features requirement (cần tất cả)
        this.logger.log(
          `Checking multiple feature access: ${requiredFeature.join(', ')} for user ${user.id}`,
        );
        accessResult =
          await this.featureAccessService.checkMultipleFeatureAccess(
            user.id,
            requiredFeature,
          );
      } else if (requiredFeature.anyOf && Array.isArray(requiredFeature.anyOf)) {
        // Any of features requirement (chỉ cần một trong số đó)
        this.logger.log(
          `Checking any feature access: ${requiredFeature.anyOf.join(', ')} for user ${user.id}`,
        );
        accessResult = await this.featureAccessService.checkAnyFeatureAccess(
          user.id,
          requiredFeature.anyOf,
        );
      } else {
        this.logger.error('Invalid feature requirement format', requiredFeature);
        throw new ForbiddenException('Invalid feature requirement configuration');
      }

      if (accessResult.hasAccess) {
        this.logger.log(
          `Feature access granted for user ${user.id}`,
        );
        
        // Attach feature access info to request for use in controllers
        request.featureAccess = accessResult;
        return true;
      } else {
        this.logger.warn(
          `Feature access denied for user ${user.id}: ${accessResult.reason}`,
        );
        
        // Tạo error message chi tiết
        const errorMessage = this.createDetailedErrorMessage(accessResult);
        throw new ForbiddenException(errorMessage);
      }
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      
      this.logger.error(
        `Error checking feature access for user ${user.id}: ${error.message}`,
      );
      throw new ForbiddenException(
        'Unable to verify feature access. Please try again later.',
      );
    }
  }

  /**
   * Tạo error message chi tiết dựa trên kết quả kiểm tra
   */
  private createDetailedErrorMessage(accessResult: any): string {
    const { reason, userPlan, requiredFeature, userFeatures } = accessResult;

    let message = `Access denied: ${reason || 'Insufficient permissions'}`;

    if (requiredFeature) {
      message += `. Required feature: ${requiredFeature}`;
    }

    if (userPlan) {
      message += `. Your current plan: ${userPlan}`;
    }

    if (userFeatures && userFeatures.length > 0) {
      message += `. Your available features: ${userFeatures.join(', ')}`;
    } else {
      message += '. You have no active features. Please upgrade your subscription.';
    }

    return message;
  }
}