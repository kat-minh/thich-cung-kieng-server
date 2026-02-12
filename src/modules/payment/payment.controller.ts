import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/common/enums/user.enum';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { BaseFilterDto } from 'src/common/base/dto/base-filter.dto';

@ApiTags('Payment')
@ApiBearerAuth()
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create payment (Admin only)' })
  create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentService.create(createPaymentDto);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all payments with user info (Admin only)' })
  async findAll(@Query() filter: BaseFilterDto) {
    return this.paymentService.findAll(
      filter,
      [
        'user',
        'userSubscription',
        'userSubscription.user',
        'userSubscription.subscriptionPlan',
      ],
      [],
    );
  }

  @Get('trends')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get payment trends for charts (Admin only)' })
  async getPaymentTrends(@Query('days') days?: string) {
    const daysNumber = days ? parseInt(days) : 30;
    return this.paymentService.getPaymentTrends(daysNumber);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get payment by ID (Admin only)' })
  findOne(@Param('id') id: string) {
    return this.paymentService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update payment (Admin only)' })
  update(@Param('id') id: string, @Body() updatePaymentDto: UpdatePaymentDto) {
    return this.paymentService.update(id, updatePaymentDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete payment (Admin only)' })
  remove(@Param('id') id: string) {
    return this.paymentService.delete(id);
  }
}
