import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async register(email: string, password: string, stellarPubkey?: string) {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new ConflictException('Email already registered');

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await this.prisma.user.create({
      data: { email, passwordHash, stellarPubkey },
    });

    return this.signToken(user.id, user.email);
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    return this.signToken(user.id, user.email);
  }

  async linkWallet(userId: string, stellarPubkey: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { stellarPubkey },
      select: { id: true, email: true, stellarPubkey: true },
    });
  }

  private signToken(userId: string, email: string) {
    const token = this.jwt.sign({ sub: userId, email });
    return { access_token: token, userId, email };
  }
}
