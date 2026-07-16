import { Module } from '@nestjs/common';
import { LoanController } from './loan.controller';
import { LoanService } from './loan.service';
import { StellarModule } from '../stellar/stellar.module';

@Module({
  imports: [StellarModule],
  controllers: [LoanController],
  providers: [LoanService],
})
export class LoanModule {}
