import {
  IsString,
  IsNumber,
  IsOptional,
  IsUUID,
  IsPositive,
} from 'class-validator';

export class CreateUserEventOfferingDto {
  @IsUUID()
  userEventId: string;

  @IsString()
  offeringName: string;

  @IsNumber()
  @IsPositive()
  quantity: number;

  @IsOptional()
  @IsString()
  note?: string;
}
