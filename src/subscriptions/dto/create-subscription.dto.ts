import { IsDecimal, IsISO8601, IsNotEmpty } from 'class-validator';

export class CreateSubscriptionDto {
  @IsDecimal()
  @IsNotEmpty()
  amount: number;

  @IsISO8601()
  @IsNotEmpty()
  endDate: string;
}
