import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateMessageDto {
  @IsInt()
  @IsNotEmpty()
  bookingId: number;

  @IsString()
  @IsNotEmpty()
  content: string;
}
