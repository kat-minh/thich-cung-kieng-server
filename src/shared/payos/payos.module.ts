import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PayosService } from './payos.service';
import { PayosController } from './payos.controller';
import { PayosIntegrationService } from './payos-integration.service';
import { PaymentModule } from '../../modules/payment/payment.module';
import { PaymentLogModule } from '../../modules/payment-log/payment-log.module';
import { UserSubscriptionModule } from '../../modules/user-subscription/user-subscription.module';
import { SubscriptionPlanModule } from '../../modules/subscription-plan/subscription-plan.module';
import { UserModule } from '../../modules/user/user.module';
import { JwtModule } from 'src/modules/auth/jwt/jwt.module';

@Module({
  imports: [
    ConfigModule,
    PaymentModule,
    PaymentLogModule,
    UserSubscriptionModule,
    SubscriptionPlanModule,
    UserModule,
    JwtModule,
  ],
  controllers: [PayosController],
  providers: [PayosService, PayosIntegrationService],
  exports: [PayosService, PayosIntegrationService], // Export both services for use in other modules
})
export class PayosModule {}
