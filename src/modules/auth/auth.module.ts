import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from './jwt/jwt.module';
import { UserModule } from '../user/user.module';
import { GoogleStrategy } from './google/strategies/google.strategy';
import { GoogleAuthService } from './google/services/google-auth.service';
import { MailModule } from 'src/shared/mail/mail.module';
import { SubscriptionCheckService } from './services/subscription-check.service';
import { UserSubscriptionModule } from '../user-subscription/user-subscription.module';
import { SubscriptionPlanModule } from '../subscription-plan/subscription-plan.module';
import { FeatureAccessService } from './services/feature-access.service';

@Module({
  imports: [
    UserModule,
    JwtModule,
    MailModule,
    UserSubscriptionModule,
    SubscriptionPlanModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    GoogleStrategy,
    GoogleAuthService,
    SubscriptionCheckService,
    FeatureAccessService,
  ],
  exports: [AuthService, GoogleAuthService, SubscriptionCheckService, FeatureAccessService],
})
export class AuthModule {}
