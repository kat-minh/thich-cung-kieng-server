import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Headers,
  HttpStatus,
  Logger,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { PayosService } from './payos.service';
import { CreateSubscriptionPaymentDto } from './dto/payos.dto';
import { GlobalAuthGuard } from '../../common/guards/global-auth.guard';
import { Public } from '../../common/decorators/public.decorator';
import { PayosIntegrationService } from './payos-integration.service';
import { GetUser } from 'src/common/decorators/get-user.decorator';

@ApiTags('PayOS - Subscription Payment')
@Controller('payos')
@ApiBearerAuth()
@ApiUnauthorizedResponse({
  description: 'Unauthorized - Invalid or missing JWT token',
})
@ApiForbiddenResponse({
  description: 'Forbidden - Insufficient permissions',
})
export class PayosController {
  private readonly logger = new Logger(PayosController.name);

  constructor(
    private readonly payosService: PayosService,
    private readonly payosIntegrationService: PayosIntegrationService,
  ) {}

  @Post('subscription-payment')
  @UseGuards(GlobalAuthGuard)
  @ApiOperation({ summary: 'Tạo thanh toán cho gói đăng ký' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Tạo link thanh toán gói đăng ký thành công',
  })
  async createSubscriptionPayment(
    @Body() dto: CreateSubscriptionPaymentDto,
    @GetUser('id') id: string,
  ) {
    try {
      const result =
        await this.payosIntegrationService.createSubscriptionPayment(
          dto.planId,
          id,
          {
            returnUrl: dto.returnUrl,
            cancelUrl: dto.cancelUrl,
          },
        );

      return result;
    } catch (error) {
      this.logger.error(
        `Failed to create subscription payment: ${error.message}`,
      );
      throw error;
    }
  }

  @Get('subscription/:orderCode/status')
  @UseGuards(GlobalAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Kiểm tra trạng thái thanh toán subscription' })
  @ApiParam({ name: 'orderCode', description: 'Mã đơn hàng subscription' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Kiểm tra trạng thái thành công',
  })
  async checkSubscriptionPaymentStatus(@Param('orderCode') orderCode: number) {
    try {
      const result =
        await this.payosIntegrationService.checkAndUpdatePaymentStatus(
          orderCode,
        );

      return result;
    } catch (error) {
      this.logger.error(
        `Failed to check subscription payment status: ${error.message}`,
      );
      throw error;
    }
  }

  @Post('webhook')
  @Public()
  @ApiOperation({ summary: 'Handle PayOS webhook' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Webhook processed successfully',
  })
  async handleWebhook(@Body() webhookData: any, @Headers() headers: any) {
    try {
      // Log webhook data for debugging
      this.logger.debug('Webhook received:', {
        data: webhookData,
        hasData: !!webhookData,
        userAgent: headers['user-agent'],
      });

      // Check if this is a test request (empty body from Swagger/Postman)
      if (!webhookData || Object.keys(webhookData).length === 0) {
        this.logger.warn('Empty webhook data received - likely a test request');
        return {
          success: true,
          message:
            'Webhook endpoint is working. Awaiting real PayOS webhook data.',
          note: 'This appears to be a test request. Real PayOS webhooks will contain payment data.',
        };
      }

      // PayOS webhook has nested structure - extract the actual data
      const actualData = webhookData.data || webhookData;
      const orderCode = actualData.orderCode || webhookData.orderCode;
      const paymentCode = actualData.code || webhookData.code;

      // Validate required PayOS webhook fields
      if (!orderCode && !paymentCode) {
        this.logger.error(
          'Invalid PayOS webhook format - missing required fields',
        );
        return {
          success: false,
          message: 'Invalid webhook format - missing required PayOS fields',
        };
      }

      // Extract signature from headers or webhook body
      const signature =
        headers['x-payos-signature'] ||
        headers['payos-signature'] ||
        headers['signature'] ||
        webhookData.signature;

      // For development, log the webhook structure
      this.logger.debug('PayOS webhook fields:', {
        orderCode: orderCode,
        code: paymentCode,
        amount: actualData.amount,
        hasSignature: !!signature,
        webhookStructure: {
          hasTopLevelData: !!webhookData.data,
          topLevelFields: Object.keys(webhookData),
          nestedFields: webhookData.data ? Object.keys(webhookData.data) : [],
        },
      });

      // Verify webhook first
      const isValid = await this.payosService.verifyWebhook(
        webhookData,
        signature,
      );

      if (!isValid) {
        this.logger.warn('Invalid webhook signature received');
        return {
          success: false,
          message: 'Invalid webhook signature',
        };
      }

      // Process webhook through integration service
      // Pass the actual payment data (nested structure)
      const actualPaymentData = webhookData.data || webhookData;
      const result =
        await this.payosIntegrationService.handlePaymentWebhook(
          actualPaymentData,
        );

      return {
        success: true,
        message: 'Webhook processed successfully',
        data: result,
      };
    } catch (error) {
      this.logger.error(`Failed to process webhook: ${error.message}`);
      return {
        success: false,
        message: 'Webhook processing failed',
        error: error.message,
      };
    }
  }

  @Get('subscription/:paymentId/details')
  @UseGuards(GlobalAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy chi tiết thanh toán subscription' })
  @ApiParam({ name: 'paymentId', description: 'ID thanh toán' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lấy chi tiết thanh toán thành công',
  })
  async getSubscriptionPaymentDetails(@Param('paymentId') paymentId: string) {
    try {
      const result =
        await this.payosIntegrationService.getSubscriptionPaymentDetails(
          paymentId,
        );

      return result;
    } catch (error) {
      this.logger.error(
        `Failed to get subscription payment details: ${error.message}`,
      );
      throw error;
    }
  }

  @Get('user/:userId/subscription-payments')
  @UseGuards(GlobalAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy danh sách thanh toán subscription của user' })
  @ApiParam({ name: 'userId', description: 'ID người dùng' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lấy danh sách thanh toán thành công',
  })
  async getUserSubscriptionPayments(@Param('userId') userId: string) {
    try {
      const result =
        await this.payosIntegrationService.getUserSubscriptionPayments(userId);

      return result;
    } catch (error) {
      this.logger.error(
        `Failed to get user subscription payments: ${error.message}`,
      );
      throw error;
    }
  }

  @Get('user/:userId/stats')
  @UseGuards(GlobalAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy thống kê thanh toán của user' })
  @ApiParam({ name: 'userId', description: 'ID người dùng' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lấy thống kê thanh toán thành công',
  })
  async getUserPaymentStats(@Param('userId') userId: string) {
    try {
      const result =
        await this.payosIntegrationService.getUserPaymentStats(userId);

      return result;
    } catch (error) {
      this.logger.error(`Failed to get user payment stats: ${error.message}`);
      throw error;
    }
  }

  @Get('payment-cancel-callback/:orderCode')
  @Public()
  @ApiOperation({ summary: 'Handle payment cancellation callback from PayOS' })
  @ApiParam({
    name: 'orderCode',
    description: 'Order code của giao dịch bị hủy',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Payment cancellation handled successfully',
  })
  async handlePaymentCancelCallback(@Param('orderCode') orderCode: string) {
    try {
      this.logger.log(
        `[CANCEL CALLBACK] Received cancel callback for orderCode: ${orderCode}`,
      );

      const result =
        await this.payosIntegrationService.cancelSubscriptionPayment(
          orderCode,
          'Payment cancelled by user via PayOS interface',
        );

      // Return a user-friendly response that can be displayed
      return {
        success: true,
        message:
          'Payment has been cancelled successfully. Your previous subscription has been restored if applicable.',
        data: result,
        redirect:
          process.env.CLIENT_URL ||
          'https://your-frontend-url.com/payment-cancelled',
      };
    } catch (error) {
      this.logger.error(`Failed to handle cancel callback: ${error.message}`);
      return {
        success: false,
        message:
          'Failed to process payment cancellation. Please contact support.',
        error: error.message,
      };
    }
  }

  @Post('admin/handle-timeouts')
  @UseGuards(GlobalAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Xử lý timeout cho các payment pending quá lâu (Admin only)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Xử lý timeout thành công',
  })
  async handlePendingPaymentTimeouts() {
    try {
      const result =
        await this.payosIntegrationService.handlePendingPaymentTimeouts();

      return {
        success: true,
        message: `Processed ${result.processedCount} timed out payments`,
        data: result,
      };
    } catch (error) {
      this.logger.error(
        `Failed to handle pending payment timeouts: ${error.message}`,
      );
      throw error;
    }
  }
}
