import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

import { ProvidersController } from './providers.controller';

@Module({
  controllers: [UsersController, ProvidersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
