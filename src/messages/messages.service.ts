import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  async create(createMessageDto: CreateMessageDto, senderId: number) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: createMessageDto.bookingId },
    });

    if (!booking) {
      throw new BadRequestException('Booking not found');
    }

    // Verify sender is either client or provider
    if (booking.clientId !== senderId && booking.providerId !== senderId) {
      throw new ForbiddenException('You are not part of this conversation');
    }

    return this.prisma.message.create({
      data: {
        content: createMessageDto.content,
        senderId,
        bookingId: createMessageDto.bookingId,
      },
      include: {
        sender: {
          select: { id: true, name: true },
        },
      },
    });
  }

  async findAllByBooking(bookingId: number, userId: number) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new BadRequestException('Booking not found');
    }

    // Verify user is either client or provider
    if (booking.clientId !== userId && booking.providerId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return this.prisma.message.findMany({
      where: { bookingId },
      include: {
        sender: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }
}
