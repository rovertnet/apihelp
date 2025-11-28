import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('stats')
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('users')
  async getAllUsers(@Query('role') role?: string, @Query('search') search?: string) {
    return this.adminService.getAllUsers({ role, search });
  }

  @Get('users/:id')
  async getUserDetails(@Param('id') id: string) {
    return this.adminService.getUserDetails(+id);
  }

  @Get('providers')
  async getAllProviders() {
    return this.adminService.getAllProviders();
  }

  @Get('bookings')
  async getAllBookings(@Query('status') status?: string) {
    return this.adminService.getAllBookings({ status });
  }

  @Get('subscriptions')
  async getAllSubscriptions(@Query('status') status?: string) {
    return this.adminService.getAllSubscriptions({ status });
  }
}
