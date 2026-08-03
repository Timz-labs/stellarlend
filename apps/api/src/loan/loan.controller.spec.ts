import { Test, TestingModule } from '@nestjs/testing';
import { LoanController } from './loan.controller';
import { LoanService } from './loan.service';

const mockLoanService = {
  buildRequestLoan: jest.fn().mockResolvedValue('mock_xdr_request'),
  buildFundLoan: jest.fn().mockResolvedValue('mock_xdr_fund'),
  buildRepay: jest.fn().mockResolvedValue('mock_xdr_repay'),
  submitTransaction: jest.fn().mockResolvedValue({ txHash: 'mock_hash_abc' }),
  getLoanRequests: jest.fn().mockResolvedValue([
    { onChainId: 1n, status: 'Requested', borrowToken: 'USDC', borrowAmount: '1000' },
  ]),
  getLoanRequest: jest.fn().mockResolvedValue({
    onChainId: 1n, status: 'Active', borrowAmount: '1000',
  }),
};

describe('LoanController', () => {
  let controller: LoanController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LoanController],
      providers: [{ provide: LoanService, useValue: mockLoanService }],
    }).compile();

    controller = module.get<LoanController>(LoanController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('POST /loans/request/build — should return XDR string', async () => {
    const result = await controller.buildRequest({
      borrowerPubkey: 'GABC123',
      borrowToken: 'GUSDC123',
      borrowAmount: '10000000000',
      collateralToken: 'GXLM123',
      collateralAmount: '150000000000',
      interestRateBps: 800,
      termDays: 30,
    });
    expect(result).toBe('mock_xdr_request');
    expect(mockLoanService.buildRequestLoan).toHaveBeenCalledTimes(1);
  });

  it('POST /loans/fund/build — should return XDR string', async () => {
    const result = await controller.buildFund({
      lenderPubkey: 'GLENDER123',
      requestId: '1',
    });
    expect(result).toBe('mock_xdr_fund');
  });

  it('POST /loans/repay/build — should return XDR string', async () => {
    const result = await controller.buildRepay({
      borrowerPubkey: 'GBORROWER123',
      requestId: '1',
      amount: '10800000000',
    });
    expect(result).toBe('mock_xdr_repay');
  });

  it('POST /loans/submit — should return txHash', async () => {
    const result = await controller.submit({ signedXdr: 'signed_xdr_abc' });
    expect(result).toEqual({ txHash: 'mock_hash_abc' });
  });

  it('GET /loans — should return array of loans', async () => {
    const result = await controller.getLoans();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it('GET /loans — should filter by status', async () => {
    await controller.getLoans('Requested');
    expect(mockLoanService.getLoanRequests).toHaveBeenCalledWith('Requested');
  });

  it('GET /loans/:id — should return a single loan', async () => {
    const result = await controller.getLoan('1');
    expect(result).toBeDefined();
    expect(mockLoanService.getLoanRequest).toHaveBeenCalledWith(1n);
  });
});
