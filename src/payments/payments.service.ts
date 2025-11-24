import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PaymentStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async processPayment(createPaymentDto: CreatePaymentDto, userId: number) {
    const { bookingId, amount } = createPaymentDto;

    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.clientId !== userId) {
      throw new ForbiddenException('You can only pay for your own bookings');
    }

    // This check requires including payment in the query above or a separate check if relation is not loaded
    // Let's do a separate check to be safe or assume unique constraint handles it but better to be explicit
    const existingPayment = await this.prisma.payment.findUnique({
        where: { bookingId }
    });
    if (existingPayment) {
         throw new BadRequestException('Booking already paid');
    }

    // Mock payment processing
    console.log(`Processing payment for booking ${bookingId} amount ${amount}`);
    
    return this.prisma.payment.create({
      data: {
        bookingId,
        amount,
        status: PaymentStatus.COMPLETED,
      },
    });
  }
}
