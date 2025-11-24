import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class CreatePaymentDto {
  @IsNumber()
  @IsNotEmpty()
  bookingId: number;

  @IsNumber()
  @IsPositive()
  amount: number;
}
