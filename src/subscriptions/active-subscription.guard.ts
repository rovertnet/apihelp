import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';

@Injectable()
export class ActiveSubscriptionGuard implements CanActivate {
  constructor(private subscriptionsService: SubscriptionsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Only check for PROVIDER role
    if (user.role !== 'PROVIDER') {
      return true; // Allow non-providers
    }

    const { isActive } = await this.subscriptionsService.checkSubscriptionStatus(user.id);

    if (!isActive) {
      throw new ForbiddenException('Active subscription required to perform this action');
    }

    return true;
  }
}
