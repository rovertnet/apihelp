import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { MailService } from '../mail/mail.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    // Check if user exists and has a password (local auth)
    if (user && user.password && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { 
      email: user.email, 
      sub: user.id, 
      role: user.role,
      emailVerified: user.emailVerified 
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        emailVerified: user.emailVerified,
      },
    };
  }

  async register(createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    
    // Generate verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + 15); // 15 minutes expiry

    await this.usersService.setVerificationCode(user.id, code, expiry);
    await this.mailService.sendVerificationCode(user.email, code, user.name);

    return {
      message: 'Registration successful. Please check your email for verification code.',
      userId: user.id,
      email: user.email
    };
  }

  async verifyEmail(email: string, code: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.emailVerified) {
      // Si déjà vérifié, retourner un nouveau token valide
      return this.login(user);
    }

    if (user.verificationCode !== code || !user.verificationCodeExpiry || new Date() > user.verificationCodeExpiry) {
      throw new BadRequestException('Invalid or expired verification code');
    }

    await this.usersService.updateVerificationStatus(user.id, true);
    await this.mailService.sendWelcomeEmail(user.email, user.name);
    
    // Récupérer l'utilisateur mis à jour avec emailVerified: true
    const updatedUser = await this.usersService.findByEmail(email);
    
    // Auto login after verification avec le nouvel état
    return this.login(updatedUser);
  }

  async resendVerificationCode(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.emailVerified) {
      throw new BadRequestException('Email already verified');
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + 15);

    await this.usersService.setVerificationCode(user.id, code, expiry);
    await this.mailService.sendVerificationCode(user.email, code, user.name);

    return { message: 'Verification code sent' };
  }

  async requestPasswordReset(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      // Don't reveal if user exists
      return { message: 'If email exists, reset instructions have been sent.' };
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 1); // 1 hour expiry

    await this.usersService.setResetPasswordToken(user.id, token, expiry);
    await this.mailService.sendPasswordReset(user.email, token, user.name);

    return { message: 'If email exists, reset instructions have been sent.' };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.usersService.findByResetToken(token);
    if (!user) {
      throw new BadRequestException('Invalid or expired password reset token');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.usersService.update(user.id, { password: hashedPassword });
    await this.usersService.clearResetPasswordToken(user.id);

    return { message: 'Password has been reset successfully' };
  }

  async validateGoogleUser(profile: any) {
    const { id, emails, displayName, photos } = profile;
    const email = emails[0].value;

    let user = await this.usersService.findByGoogleId(id);

    if (!user) {
      // Check if user exists with same email
      user = await this.usersService.findByEmail(email);
      
      if (user) {
        // Link account
        user = await this.usersService.linkGoogleAccount(user.id, id);
      } else {
        // Create new user
        user = await this.usersService.create({
          email,
          name: displayName,
          password: '', // No password for OAuth
          // role: Role.CLIENT // Default
        });
        // Update with googleId
        user = await this.usersService.linkGoogleAccount(user.id, id);
      }
    }
    
    return user;
  }
}
