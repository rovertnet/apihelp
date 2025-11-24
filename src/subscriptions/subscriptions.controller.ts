import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { SubscriptionsService } from './subscriptions.service';

@Controller('subscriptions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post()
  @Roles(Role.PROVIDER)
  create(@Body() body: { amount: number }, @Request() req) {
    return this.subscriptionsService.create(req.user.id, body.amount);
  }

  @Get('me')
  @Roles(Role.PROVIDER)
  getMySubscription(@Request() req) {
    return this.subscriptionsService.getMySubscription(req.user.id);
  }

  @Get('status')
  @Roles(Role.PROVIDER)
  checkStatus(@Request() req) {
    return this.subscriptionsService.checkSubscriptionStatus(req.user.id);
  }
}
