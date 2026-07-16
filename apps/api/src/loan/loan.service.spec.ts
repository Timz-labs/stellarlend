import { Test, TestingModule } from '@nestjs/testing';
import { LoanService } from './loan.service';
import { PrismaService } from '../prisma/prisma.service';
import { StellarService } from '../stellar/stellar.service';

const mockPrisma = {
  loanRequestRecord: {
    findMany: jest.fn().mockResolvedValue([]),
    findUnique: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockResolvedValue({ id: '1' }),
  },
};

const mockStellar = {
  buildContractCall: jest.fn().mockResolvedValue('mock_xdr'),
  submitTransaction: jest.fn().mockResolvedValue('mock_tx_hash'),
  getLendingContractId: jest.fn().mockReturnValue('CTEST'),
  toAddress: jest.fn().mockReturnValue({}),
  toI128: jest.fn().mockReturnValue({}),
  toU32: jest.fn().mockReturnValue({}),
  toU64: jest.fn().mockReturnValue({}),
};

describe('LoanService', () => {
  let service: LoanService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoanService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: StellarService, useValue: mockStellar },
      ],
    }).compile();

    service = module.get<LoanService>(LoanService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should build request loan XDR', async () => {
    const xdr = await service.buildRequestLoan(
      'GABC123',
      'GUSDC123',
      BigInt(1000_0000000),
      'GXLM123',
      BigInt(15000_0000000),
      800,
      30,
    );
    expect(xdr).toBe('mock_xdr');
    expect(mockStellar.buildContractCall).toHaveBeenCalledWith(
      'GABC123',
      'CTEST',
      'request_loan',
      expect.any(Array),
    );
  });

  it('should build fund loan XDR', async () => {
    const xdr = await service.buildFundLoan('GLENDER123', BigInt(1));
    expect(xdr).toBe('mock_xdr');
  });

  it('should build repay XDR', async () => {
    const xdr = await service.buildRepay('GBORROWER123', BigInt(1), BigInt(1080_0000000));
    expect(xdr).toBe('mock_xdr');
  });

  it('should submit a transaction', async () => {
    const result = await service.submitTransaction('signed_xdr');
    expect(result.txHash).toBe('mock_tx_hash');
  });

  it('should get loan requests', async () => {
    const loans = await service.getLoanRequests();
    expect(Array.isArray(loans)).toBe(true);
  });

  it('should throw when loan request not found', async () => {
    await expect(service.getLoanRequest(BigInt(999))).rejects.toThrow();
  });
});
