import { IsDateString, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateBookingDto {
  @IsNumber()
  @IsNotEmpty()
  serviceId: number;

  @IsDateString()
  @IsNotEmpty()
  date: string;
}
