import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { calculateDistance } from '../common/utils/distance.util';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  async create(createServiceDto: CreateServiceDto, providerId: number, imagePath?: string) {
    console.log('ServiceService.create called');
    try {
      const service = await this.prisma.service.create({
        data: {
          ...createServiceDto,
          providerId,
          imageUrl: imagePath,
        },
      });
      console.log('Service created:', service);
      return service;
    } catch (error) {
      console.error('Error creating service:', error);
      throw error;
    }
  }

  async findAll(lat?: number, lng?: number) {
    const services = await this.prisma.service.findMany({
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            email: true,
            latitude: true,
            longitude: true,
            address: true,
          },
        },
        category: true,
        _count: {
          select: { bookings: true },
        },
      },
    });

    if (lat && lng) {
      return services.map((service: any) => {
        let distance: number | null = null;
        if (service.provider?.latitude && service.provider?.longitude) {
          distance = calculateDistance(
            lat,
            lng,
            service.provider.latitude,
            service.provider.longitude,
          );
        }
        return { ...service, distance };
      });
    }

    return services;
  }

  findByProviderId(providerId: number) {
    return this.prisma.service.findMany({
      where: { providerId },
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        category: true,
        _count: {
          select: { bookings: true },
        },
      },
    });
  }

  async findOne(id: number) {
    const service = await this.prisma.service.findUnique({
      where: { id },
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        category: true,
        _count: {
          select: { bookings: true },
        },
      },
    });
    if (!service) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }
    return service;
  }

  async update(id: number, updateServiceDto: UpdateServiceDto, providerId: number) {
    const service = await this.findOne(id);
    if (service.providerId !== providerId) {
      throw new ForbiddenException('You can only update your own services');
    }
    return this.prisma.service.update({
      where: { id },
      data: updateServiceDto,
    });
  }

  async remove(id: number, providerId: number) {
    const service = await this.findOne(id);
    if (service.providerId !== providerId) {
      throw new ForbiddenException('You can only delete your own services');
    }
    return this.prisma.service.delete({
      where: { id },
    });
  }
}
