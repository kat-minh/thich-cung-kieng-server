import { Controller, Get } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
} from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/common/enums/user.enum';
import { PaymentStatus } from 'src/common/enums/payment.enum';
import { UserSubscriptionStatus } from 'src/common/enums/user-subscription.enum';
import { UserService } from './user.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { User } from './entities/user.entity';
import { Payment } from '../payment/entities/payment.entity';
import { UserSubscription } from '../user-subscription/entities/user-subscription.entity';
import { Ritual } from '../ritual/entities/ritual.entity';

@ApiTags('Admin - Statistics')
@ApiBearerAuth()
@Controller('admin/stats')
export class AdminStatsController {
  constructor(
    private readonly userService: UserService,
    @InjectRepository(User, 'postgresql')
    private readonly userRepository: Repository<User>,
    @InjectRepository(Payment, 'postgresql')
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(UserSubscription, 'postgresql')
    private readonly subscriptionRepository: Repository<UserSubscription>,
    @InjectRepository(Ritual, 'postgresql')
    private readonly ritualRepository: Repository<Ritual>,
  ) {}

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get dashboard statistics',
    description: 'Get comprehensive statistics for admin dashboard',
  })
  @ApiOkResponse({
    description: 'Statistics retrieved successfully',
  })
  async getDashboardStats() {
    // Get total users
    const totalUsers = await this.userRepository.count();

    // Get new users this month
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const newUsersThisMonth = await this.userRepository.count({
      where: {
        createdAt: MoreThanOrEqual(firstDayOfMonth) as any,
      },
    });

    // Get total revenue from completed payments
    const completedPayments = await this.paymentRepository.find({
      where: { 
        status: PaymentStatus.COMPLETED,
        deletedAt: null as any,
      },
    });
    const totalRevenue = completedPayments.reduce(
      (sum, payment) => sum + Number(payment.totalAmount),
      0,
    );

    // Get active subscriptions
    const activeSubscriptions = await this.subscriptionRepository.count({
      where: { status: UserSubscriptionStatus.ACTIVE },
    });

    // Get total rituals
    const totalRituals = await this.ritualRepository.count();

    // Get recent users (last 5)
    const recentUsers = await this.userRepository.find({
      order: { createdAt: 'DESC' },
      take: 5,
      select: ['id', 'fullName', 'email', 'profilePicture', 'createdAt'],
    });

    // Get payment trends (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentPayments = await this.paymentRepository.find({
      where: {
        createdAt: MoreThanOrEqual(sevenDaysAgo) as any,
        status: PaymentStatus.COMPLETED,
        deletedAt: null as any,
      },
      order: { createdAt: 'ASC' },
    });

    // Group payments by date
    const paymentsByDate = recentPayments.reduce((acc, payment) => {
      const date = new Date(payment.createdAt).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { amount: 0, count: 0 };
      }
      acc[date].amount += Number(payment.totalAmount);
      acc[date].count += 1;
      return acc;
    }, {} as Record<string, { amount: number; count: number }>);

    const subscriptionData = Object.entries(paymentsByDate).map(
      ([date, data]) => ({
        date,
        amount: data.amount,
        transactions: data.count,
      }),
    );

    // Get subscription distribution
    const subscriptionsByPlan = await this.subscriptionRepository
      .createQueryBuilder('subscription')
      .leftJoin('subscription.subscriptionPlan', 'plan')
      .select('plan.name', 'planName')
      .addSelect('COUNT(subscription.id)', 'count')
      .where('subscription.status = :status', {
        status: UserSubscriptionStatus.ACTIVE,
      })
      .groupBy('plan.name')
      .getRawMany();

    return {
      overview: {
        totalUsers,
        newUsersThisMonth,
        totalRevenue,
        activeSubscriptions,
        totalRituals,
      },
      recentUsers,
      subscriptionData,
      subscriptionsByPlan,
    };
  }
}
