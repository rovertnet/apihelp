import { IsEnum, IsNumber, IsOptional } from 'class-validator';

export class CreateSubscriptionDto {
  @IsNumber()
  amount: number;

  @IsEnum(['BASIC', 'PREMIUM'])
  @IsOptional()
  plan?: 'BASIC' | 'PREMIUM';
}
