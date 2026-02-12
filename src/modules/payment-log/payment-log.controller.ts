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
import { Public } from 'src/common/decorators/public.decorator';
import { PaymentLogService } from './payment-log.service';
import { CreatePaymentLogDto } from './dto/create-payment-log.dto';
import { UpdatePaymentLogDto } from './dto/update-payment-log.dto';
import { FilterPaymentLogDto } from './dto/filter-payment-log.dto';

@Public()
@Controller('payment-log')
export class PaymentLogController {
  constructor(private readonly paymentLogService: PaymentLogService) {}

  @Post()
  create(@Body() createPaymentLogDto: CreatePaymentLogDto) {
    return this.paymentLogService.create(createPaymentLogDto);
  }

  @Get()
  findAll(@Query() filter: FilterPaymentLogDto) {
    return this.paymentLogService.findAll(filter, [], []);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paymentLogService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePaymentLogDto: UpdatePaymentLogDto,
  ) {
    return this.paymentLogService.update(id, updatePaymentLogDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.paymentLogService.remove(id);
  }
}
