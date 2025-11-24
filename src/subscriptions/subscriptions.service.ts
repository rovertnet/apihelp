import { BadRequestException, Injectable } from '@nestjs/common';
import { SubscriptionStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SubscriptionsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, amount: number) {
    // Check if user already has a subscription
    const existing = await this.prisma.subscription.findUnique({
      where: { userId },
    });

    if (existing && existing.status === SubscriptionStatus.ACTIVE) {
      throw new BadRequestException('You already have an active subscription');
    }

    // Calculate end date (3 months from now)
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 3);

    // Delete old subscription if exists
    if (existing) {
      await this.prisma.subscription.delete({ where: { userId } });
    }

    return this.prisma.subscription.create({
      data: {
        userId,
        amount,
        startDate,
        endDate,
        status: SubscriptionStatus.ACTIVE,
      },
    });
  }

  async getMySubscription(userId: number) {
    return this.prisma.subscription.findUnique({
      where: { userId },
    });
  }

  async checkSubscriptionStatus(userId: number) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) {
      return { isActive: false, subscription: null };
    }

    const now = new Date();
    const isActive =
      subscription.status === SubscriptionStatus.ACTIVE &&
      new Date(subscription.endDate) > now;

    // Auto-expire if endDate passed
    if (subscription.status === SubscriptionStatus.ACTIVE && new Date(subscription.endDate) <= now) {
      await this.prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: SubscriptionStatus.EXPIRED },
      });
      return { isActive: false, subscription: { ...subscription, status: SubscriptionStatus.EXPIRED } };
    }

    return { isActive, subscription };
  }
}
