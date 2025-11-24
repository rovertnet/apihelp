import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { BookingStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(createReviewDto: CreateReviewDto, userId: number) {
    const { bookingId, rating, comment } = createReviewDto;

    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { review: true },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.clientId !== userId) {
      throw new ForbiddenException('You can only review your own bookings');
    }

    if (booking.status !== BookingStatus.COMPLETED) {
      throw new BadRequestException('You can only review completed bookings');
    }

    if (booking.review) {
      throw new BadRequestException('You have already reviewed this booking');
    }

    return this.prisma.review.create({
      data: {
        bookingId,
        rating,
        comment,
        clientId: userId,
        serviceId: booking.serviceId,
      },
    });
  }

  async findAllByService(serviceId: number) {
    return this.prisma.review.findMany({
      where: { serviceId },
      include: { client: { select: { name: true } } },
    });
  }
}
