import { Test, TestingModule } from '@nestjs/testing';
import { StellarService } from './stellar.service';
import { ConfigService } from '@nestjs/config';

const mockConfig = {
  get: jest.fn((key: string, def: string) => {
    const values: Record<string, string> = {
      STELLAR_RPC_URL: 'https://soroban-testnet.stellar.org',
      STELLAR_NETWORK_PASSPHRASE: 'Test SDF Network ; September 2015',
      LENDING_CONTRACT_ID: 'CCEJCHUANEQRTC2YQ7PEDH773I272DRLRWKAFZS4MBXWUXXARMFYM6MI',
      ORACLE_CONTRACT_ID: 'CBOE6DS7WYIS6LDQ5OAC3XUZG3LYLL5WNTO2CYTY5GSS2RAKG7JQWMSX',
    };
    return values[key] ?? def;
  }),
};

describe('StellarService', () => {
  let service: StellarService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StellarService,
        { provide: ConfigService, useValue: mockConfig },
      ],
    }).compile();

    service = module.get<StellarService>(StellarService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return lending contract ID', () => {
    expect(service.getLendingContractId()).toBe(
      'CCEJCHUANEQRTC2YQ7PEDH773I272DRLRWKAFZS4MBXWUXXARMFYM6MI'
    );
  });

  it('should return oracle contract ID', () => {
    expect(service.getOracleContractId()).toBe(
      'CBOE6DS7WYIS6LDQ5OAC3XUZG3LYLL5WNTO2CYTY5GSS2RAKG7JQWMSX'
    );
  });

  it('should convert address to ScVal', () => {
    const addr = 'GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN';
    const scVal = service.toAddress(addr);
    expect(scVal).toBeDefined();
    expect(scVal.switch().name).toBe('scvAddress');
  });

  it('should convert u64 to ScVal', () => {
    const scVal = service.toU64(BigInt(42));
    expect(scVal).toBeDefined();
    expect(scVal.switch().name).toBe('scvU64');
  });

  it('should convert i128 to ScVal', () => {
    const scVal = service.toI128(BigInt(1000_0000000));
    expect(scVal).toBeDefined();
    expect(scVal.switch().name).toBe('scvI128');
  });

  it('should convert u32 to ScVal', () => {
    const scVal = service.toU32(800);
    expect(scVal).toBeDefined();
    expect(scVal.switch().name).toBe('scvU32');
    expect(scVal.u32()).toBe(800);
  });
});
