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

  async getAllServices(filters?: { category?: string; city?: string; search?: string }) {
    const where: any = {};
    
    if (filters?.category) {
      where.category = filters.category;
    }
    
    if (filters?.city) {
      where.city = { contains: filters.city, mode: 'insensitive' };
    }
    
    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.service.findMany({
      where,
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            bookings: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Analytics methods for dashboard charts
  async getBookingsTimeline() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const bookings = await this.prisma.booking.findMany({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      select: {
        createdAt: true,
        status: true,
      },
    });

    // Group bookings by day
    const timelineData = bookings.reduce((acc: any, booking) => {
      const date = booking.createdAt.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { date, count: 0, completed: 0, pending: 0, cancelled: 0 };
      }
      acc[date].count++;
      if (booking.status === 'COMPLETED') acc[date].completed++;
      if (booking.status === 'PENDING') acc[date].pending++;
      if (booking.status === 'CANCELLED') acc[date].cancelled++;
      return acc;
    }, {});

    return Object.values(timelineData).sort((a: any, b: any) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }

  async getPopularServices() {
    const services = await this.prisma.service.findMany({
      select: {
        id: true,
        title: true,
        _count: {
          select: {
            bookings: true,
          },
        },
      },
      orderBy: {
        bookings: {
          _count: 'desc',
        },
      },
      take: 10,
    });

    return services.map(service => ({
      name: service.title.length > 25 ? service.title.substring(0, 25) + '...' : service.title,
      bookings: service._count.bookings,
    }));
  }

  async getServicesByCategory() {
    const services = await this.prisma.service.findMany({
      select: {
        category: {
          select: {
            name: true,
          },
        },
      },
    });

    const categoryCount = services.reduce((acc: any, service) => {
      const categoryName = service.category?.name || 'Non catégorisé';
      acc[categoryName] = (acc[categoryName] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(categoryCount).map(([name, value]) => ({
      name,
      value,
    }));
  }

  async getUserRegistrations() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const users = await this.prisma.user.findMany({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      select: {
        createdAt: true,
        role: true,
      },
    });

    // Group users by day
    const registrationsData = users.reduce((acc: any, user) => {
      const date = user.createdAt.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { date, total: 0, clients: 0, providers: 0 };
      }
      acc[date].total++;
      if (user.role === 'CLIENT') acc[date].clients++;
      if (user.role === 'PROVIDER') acc[date].providers++;
      return acc;
    }, {});

    return Object.values(registrationsData).sort((a: any, b: any) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }
}
