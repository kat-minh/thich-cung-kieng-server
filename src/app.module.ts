import { GlobalResponseInterceptor } from './common/interceptors/global-response.interceptor';
import { Module } from '@nestjs/common';
import { DatabaseModule } from './config/database/database.module';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { FirebaseModule } from './shared/firebase/firebase.module';
import { RedisModule } from './shared/redis/redis.module';
import { AuthModule } from './modules/auth/auth.module';
import { MailModule } from './shared/mail/mail.module';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { GlobalAuthGuard } from './common/guards/global-auth.guard';
import { UserModule } from './modules/user/user.module';
import { PerformanceInterceptor } from './common/interceptors/performance.interceptor';
import { JwtModule } from './modules/auth/jwt/jwt.module';
import { ChatSessionModule } from './modules/chat-session/chat-session.module';
import { ChatMessageModule } from './modules/chat-message/chat-message.module';
import { RitualModule } from './modules/ritual/ritual.module';
import { RitualMediaModule } from './modules/ritual-media/ritual-media.module';
import { RitualTagModule } from './modules/ritual-tag/ritual-tag.module';
import { RitualOfferingModule } from './modules/ritual-offering/ritual-offering.module';
import { OfferingMediaModule } from './modules/offering-media/offering-media.module';
import { PaymentModule } from './modules/payment/payment.module';
import { PaymentLogModule } from './modules/payment-log/payment-log.module';
import { PlanFeatureModule } from './modules/plan-feature/plan-feature.module';
import { PrayerModule } from './modules/prayer/prayer.module';
import { SubscriptionPlanModule } from './modules/subscription-plan/subscription-plan.module';
import { SubscriptionFeatureModule } from './modules/subscription-feature/subscription-feature.module';
import { TagModule } from './modules/tag/tag.module';
import { UserEventModule } from './modules/user-event/user-event.module';
import { UserEventOfferingModule } from './modules/user_event_offering/user_event_offering.module';
import { UserEventReminderModule } from './modules/user_event_reminder/user_event_reminder.module';
import { UserSubscriptionModule } from './modules/user-subscription/user-subscription.module';
import { RitualCategoryModule } from './modules/ritual-category/ritual-category.module';
import { UserFavoriteRitualModule } from './modules/user-favorite-ritual/user-favorite-ritual.module';
import { RequestContextInterceptor } from './common/interceptors/request-context.interceptor';
import { PayosModule } from './shared/payos/payos.module';
import { RitualTrayModule } from './modules/ritual-tray/ritual-tray.module';
import { AdaptersModule } from './modules/adapters/adapters.module';
import { FileUploadModule } from './modules/file-upload/file-upload.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    DatabaseModule,
    FirebaseModule,
    RedisModule,
    AuthModule,
    MailModule,
    JwtModule,
    UserModule,
    ChatSessionModule,
    ChatMessageModule,
    RitualModule,
    RitualMediaModule,
    RitualTagModule,
    RitualCategoryModule,
    RitualOfferingModule,
    RitualTrayModule,
    OfferingMediaModule,
    PaymentModule,
    PaymentLogModule,
    PlanFeatureModule,
    PrayerModule,
    SubscriptionPlanModule,
    SubscriptionFeatureModule,
    TagModule,
    UserEventModule,
    UserEventOfferingModule,
    UserEventReminderModule,
    UserSubscriptionModule,
    UserFavoriteRitualModule,
    PayosModule,
    AdaptersModule,
    FileUploadModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: GlobalAuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: GlobalResponseInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestContextInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: PerformanceInterceptor,
    },
  ],
})
export class AppModule {}
