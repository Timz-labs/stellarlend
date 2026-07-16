import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StellarService } from '../stellar/stellar.service';

@Injectable()
export class LoanService {
  constructor(
    private prisma: PrismaService,
    private stellar: StellarService,
  ) {}

  /** Build XDR for requesting a loan — returns unsigned tx for frontend to sign */
  async buildRequestLoan(
    borrowerPubkey: string,
    borrowToken: string,
    borrowAmount: bigint,
    collateralToken: string,
    collateralAmount: bigint,
    interestRateBps: number,
    termDays: 30 | 60 | 90,
  ): Promise<string> {
    const termMap = { 30: 0, 60: 1, 90: 2 };
    return this.stellar.buildContractCall(
      borrowerPubkey,
      this.stellar.getLendingContractId(),
      'request_loan',
      [
        this.stellar.toAddress(borrowerPubkey),
        this.stellar.toAddress(borrowToken),
        this.stellar.toI128(borrowAmount),
        this.stellar.toAddress(collateralToken),
        this.stellar.toI128(collateralAmount),
        this.stellar.toU32(interestRateBps),
        this.stellar.toU32(termMap[termDays]),
      ],
    );
  }

  /** Build XDR for funding a loan request */
  async buildFundLoan(lenderPubkey: string, requestId: bigint): Promise<string> {
    return this.stellar.buildContractCall(
      lenderPubkey,
      this.stellar.getLendingContractId(),
      'fund_loan',
      [
        this.stellar.toAddress(lenderPubkey),
        this.stellar.toU64(requestId),
      ],
    );
  }

  /** Build XDR for repaying a loan */
  async buildRepay(
    borrowerPubkey: string,
    requestId: bigint,
    amount: bigint,
  ): Promise<string> {
    return this.stellar.buildContractCall(
      borrowerPubkey,
      this.stellar.getLendingContractId(),
      'repay',
      [
        this.stellar.toAddress(borrowerPubkey),
        this.stellar.toU64(requestId),
        this.stellar.toI128(amount),
      ],
    );
  }

  /** Submit a signed transaction */
  async submitTransaction(signedXdr: string): Promise<{ txHash: string }> {
    const txHash = await this.stellar.submitTransaction(signedXdr);
    return { txHash };
  }

  /** Get all loan requests from DB */
  async getLoanRequests(status?: string) {
    return this.prisma.loanRequestRecord.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  /** Get a single loan request */
  async getLoanRequest(onChainId: bigint) {
    const record = await this.prisma.loanRequestRecord.findUnique({
      where: { onChainId },
      include: { loan: true },
    });
    if (!record) throw new NotFoundException('Loan request not found');
    return record;
  }

  /** Save a loan request after on-chain confirmation */
  async saveLoanRequest(data: {
    onChainId: bigint;
    borrowerId: string;
    borrowToken: string;
    borrowAmount: string;
    collateralToken: string;
    collateralAmount: string;
    interestRateBps: number;
    termDays: number;
    txHash: string;
  }) {
    return this.prisma.loanRequestRecord.create({ data });
  }
}
