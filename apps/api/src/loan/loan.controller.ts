import { Controller, Get, Post, Body, Param, UseGuards, Req, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LoanService } from './loan.service';
import { IsString, IsNumber, IsIn, IsOptional } from 'class-validator';

class RequestLoanDto {
  @IsString() borrowerPubkey: string;
  @IsString() borrowToken: string;
  @IsString() borrowAmount: string;
  @IsString() collateralToken: string;
  @IsString() collateralAmount: string;
  @IsNumber() interestRateBps: number;
  @IsIn([30, 60, 90]) termDays: 30 | 60 | 90;
}

class FundLoanDto {
  @IsString() lenderPubkey: string;
  @IsString() requestId: string;
}

class RepayDto {
  @IsString() borrowerPubkey: string;
  @IsString() requestId: string;
  @IsString() amount: string;
}

class SubmitTxDto {
  @IsString() signedXdr: string;
}

@Controller('loans')
export class LoanController {
  constructor(private loan: LoanService) {}

  /** Build unsigned XDR for requesting a loan */
  @UseGuards(AuthGuard('jwt'))
  @Post('request/build')
  buildRequest(@Body() dto: RequestLoanDto) {
    return this.loan.buildRequestLoan(
      dto.borrowerPubkey,
      dto.borrowToken,
      BigInt(dto.borrowAmount),
      dto.collateralToken,
      BigInt(dto.collateralAmount),
      dto.interestRateBps,
      dto.termDays,
    );
  }

  /** Build unsigned XDR for funding a loan */
  @UseGuards(AuthGuard('jwt'))
  @Post('fund/build')
  buildFund(@Body() dto: FundLoanDto) {
    return this.loan.buildFundLoan(dto.lenderPubkey, BigInt(dto.requestId));
  }

  /** Build unsigned XDR for repaying a loan */
  @UseGuards(AuthGuard('jwt'))
  @Post('repay/build')
  buildRepay(@Body() dto: RepayDto) {
    return this.loan.buildRepay(
      dto.borrowerPubkey,
      BigInt(dto.requestId),
      BigInt(dto.amount),
    );
  }

  /** Submit a signed transaction */
  @UseGuards(AuthGuard('jwt'))
  @Post('submit')
  submit(@Body() dto: SubmitTxDto) {
    return this.loan.submitTransaction(dto.signedXdr);
  }

  /** Get all loan requests */
  @Get()
  getLoans(@Query('status') status?: string) {
    return this.loan.getLoanRequests(status);
  }

  /** Get a specific loan request */
  @Get(':id')
  getLoan(@Param('id') id: string) {
    return this.loan.getLoanRequest(BigInt(id));
  }
}
