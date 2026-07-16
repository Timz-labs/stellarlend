import { Controller, Post, Body, UseGuards, Req, Patch } from '@nestjs/common';
import { AuthService } from './auth.service';
import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';
import { AuthGuard } from '@nestjs/passport';

class RegisterDto {
  @IsEmail() email: string;
  @IsString() @MinLength(8) password: string;
  @IsOptional() @IsString() stellarPubkey?: string;
}

class LoginDto {
  @IsEmail() email: string;
  @IsString() password: string;
}

class LinkWalletDto {
  @IsString() stellarPubkey: string;
}

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto.email, dto.password, dto.stellarPubkey);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto.email, dto.password);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('wallet')
  linkWallet(@Req() req: any, @Body() dto: LinkWalletDto) {
    return this.auth.linkWallet(req.user.sub, dto.stellarPubkey);
  }
}
