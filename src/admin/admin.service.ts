import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const [totalUsers, totalProviders, totalClients, totalServices, totalBookings, activeSubscriptions] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: 'PROVIDER' } }),
      this.prisma.user.count({ where: { role: 'CLIENT' } }),
      this.prisma.service.count(),
      this.prisma.booking.count(),
      this.prisma.subscription.count({ where: { status: 'ACTIVE' } }),
    ]);

    return {
      totalUsers,
      totalProviders,
      totalClients,
      totalServices,
      totalBookings,
      activeSubscriptions,
    };
  }

  async getAllUsers(filters?: { role?: string; search?: string }) {
    const where: any = {};
    
    if (filters?.role) {
      where.role = filters.role;
    }
    
    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        city: true,
        createdAt: true,
        _count: {
          select: {
            services: true,
            bookings: true,
            providedBookings: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getUserDetails(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        services: {
          include: {
            category: true,
            _count: {
              select: {
                bookings: true,
                reviews: true,
              },
            },
          },
        },
        bookings: {
          include: {
            service: true,
            provider: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            payment: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        providedBookings: {
          include: {
            service: true,
            client: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            payment: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        notifications: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        subscription: true,
      },
    });

    return user;
  }

  async getAllProviders() {
    return this.prisma.user.findMany({
      where: { role: 'PROVIDER' },
      include: {
        services: {
          include: {
            category: true,
            _count: {
              select: {
                bookings: true,
                reviews: true,
              },
            },
          },
        },
        subscription: true,
        _count: {
          select: {
            providedBookings: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAllBookings(filters?: { status?: string }) {
    const where: any = {};
    
    if (filters?.status) {
      where.status = filters.status;
    }

    return this.prisma.booking.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        provider: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        service: {
          select: {
            id: true,
            title: true,
            price: true,
          },
        },
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAllSubscriptions(filters?: { status?: string }) {
    const where: any = {};
    
    if (filters?.status) {
      where.status = filters.status;
    }

    return this.prisma.subscription.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
