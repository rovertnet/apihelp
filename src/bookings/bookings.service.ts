import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { BookingStatus, Role } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';


@Injectable()
export class BookingsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}


  async create(createBookingDto: CreateBookingDto, clientId: number) {
    const service = await this.prisma.service.findUnique({
      where: { id: createBookingDto.serviceId },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    if (service.providerId === clientId) {
      throw new BadRequestException('You cannot book your own service');
    }

    const booking = await this.prisma.booking.create({
      data: {
        date: new Date(createBookingDto.date),
        clientId,
        providerId: service.providerId,
        serviceId: service.id,
        status: BookingStatus.PENDING,
      },
      include: { client: true, service: true },
    });

    // Notify Provider
    await this.notificationsService.create(
      service.providerId,
      `Nouvelle réservation pour ${service.title} par ${booking.client.name} le ${new Date(createBookingDto.date).toLocaleDateString()}`,
    );

    return booking;
  }


  async findAll(userId: number, role: Role) {
    if (role === Role.CLIENT) {
      return this.prisma.booking.findMany({
        where: { clientId: userId },
        include: { service: true, provider: { select: { name: true, email: true } } },
      });
    } else if (role === Role.PROVIDER) {
      return this.prisma.booking.findMany({
        where: { providerId: userId },
        include: { service: true, client: { select: { name: true, email: true } } },
      });
    } else {
      // Admin sees all
      return this.prisma.booking.findMany({
        include: { service: true, client: true, provider: true },
      });
    }
  }

  async findOne(id: number, userId: number, role: Role) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: { service: true, client: true, provider: true },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (role !== Role.ADMIN && booking.clientId !== userId && booking.providerId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return booking;
  }

  async updateStatus(id: number, updateBookingStatusDto: UpdateBookingStatusDto, userId: number, role: Role) {
    const booking = await this.findOne(id, userId, role);
    const { status } = updateBookingStatusDto;

    if (role === Role.CLIENT) {
      if (status !== BookingStatus.CANCELLED) {
        throw new ForbiddenException('Clients can only cancel bookings');
      }
    } else if (role === Role.PROVIDER) {
      if (booking.providerId !== userId) {
        throw new ForbiddenException('You can only manage your own bookings');
      }
      // Providers can confirm, cancel, complete
    }

    const updatedBooking = await this.prisma.booking.update({
      where: { id },
      data: { status },
      include: { service: true, client: true, provider: true },
    });

    // Notify relevant party
    if (role === Role.PROVIDER) {
      // Provider updated status -> Notify Client
      let message = '';
      if (status === BookingStatus.CONFIRMED) {
        message = `Votre réservation pour ${updatedBooking.service.title} a été confirmée.`;
      } else if (status === BookingStatus.CANCELLED) {
        message = `Votre réservation pour ${updatedBooking.service.title} a été refusée.`;
      } else if (status === BookingStatus.COMPLETED) {
        message = `Le service ${updatedBooking.service.title} a été marqué comme terminé.`;
      }
      
      if (message) {
        await this.notificationsService.create(updatedBooking.clientId, message);
      }
    } else if (role === Role.CLIENT && status === BookingStatus.CANCELLED) {
      // Client cancelled -> Notify Provider
      await this.notificationsService.create(
        updatedBooking.providerId,
        `La réservation pour ${updatedBooking.service.title} a été annulée par le client.`,
      );
    }

    return updatedBooking;
  }

}
