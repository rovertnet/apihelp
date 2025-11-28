import { Body, Controller, Delete, Get, Param, Patch, Post, Request, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { ActiveSubscriptionGuard } from '../subscriptions/active-subscription.guard';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ServicesService } from './services.service';

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard, ActiveSubscriptionGuard)
  @Roles(Role.PROVIDER)
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: './uploads/services',
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname);
        callback(null, `service-${uniqueSuffix}${ext}`);
      },
    }),
    fileFilter: (req, file, callback) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
        return callback(new Error('Only image files are allowed!'), false);
      }
      callback(null, true);
    },
  }))
  create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createServiceDto: CreateServiceDto,
    @Request() req
  ) {
    console.log('Creating service for user:', req.user.id, 'Data:', createServiceDto, 'File:', file);
    
    // Format the image path to match the static file serving configuration
    // multer's file.path returns something like 'uploads/services/service-123.jpg'
    // which is exactly what we need since static files are served from /uploads/ prefix
    const imagePath = file?.path;
    console.log('Image path to save:', imagePath);
    
    return this.servicesService.create(createServiceDto, req.user.id, imagePath);
  }


  @Get()
  findAll() {
    return this.servicesService.findAll();
  }

  @Get('my-services')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PROVIDER)
  findMyServices(@Request() req) {
    return this.servicesService.findByProviderId(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.servicesService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PROVIDER)
  update(@Param('id') id: string, @Body() updateServiceDto: UpdateServiceDto, @Request() req) {
    return this.servicesService.update(+id, updateServiceDto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PROVIDER)
  remove(@Param('id') id: string, @Request() req) {
    return this.servicesService.remove(+id, req.user.id);
  }
}
