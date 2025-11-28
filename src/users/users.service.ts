import { ConflictException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const hashedPassword = createUserDto.password ? await bcrypt.hash(createUserDto.password, 10) : null;
    try {
      return await this.prisma.user.create({
        data: {
          ...createUserDto,
          password: hashedPassword,
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Email already exists');
      }
      throw error;
    }
  }

  findAll() {
    return this.prisma.user.findMany();
  }

  findOne(id: number) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  remove(id: number) {
    return this.prisma.user.delete({ where: { id } });
  }

  // Email verification methods
  async setVerificationCode(userId: number, code: string, expiry: Date) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        verificationCode: code,
        verificationCodeExpiry: expiry,
      },
    });
  }

  async updateVerificationStatus(userId: number, verified: boolean) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        emailVerified: verified,
        verificationCode: null,
        verificationCodeExpiry: null,
      },
    });
  }

  // Password reset methods
  async setResetPasswordToken(userId: number, token: string, expiry: Date) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        resetPasswordToken: token,
        resetPasswordExpiry: expiry,
      },
    });
  }

  async clearResetPasswordToken(userId: number) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        resetPasswordToken: null,
        resetPasswordExpiry: null,
      },
    });
  }

  // OAuth methods
  findByGoogleId(googleId: string) {
    return this.prisma.user.findUnique({ where: { googleId } });
  }

  async linkGoogleAccount(userId: number, googleId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        googleId,
        provider: 'google',
        emailVerified: true,
      },
    });
  }

  // Helper for password reset
  findByResetToken(token: string) {
    return this.prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpiry: { gt: new Date() },
      },
    });
  }
}
