import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { LoanModule } from './loan/loan.module';
import { PrismaModule } from './prisma/prisma.module';
import { StellarModule } from './stellar/stellar.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    StellarModule,
    AuthModule,
    LoanModule,
  ],
})
export class AppModule {}
