import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  SorobanRpc,
  TransactionBuilder,
  Networks,
  BASE_FEE,
  Contract,
  Keypair,
  nativeToScVal,
  Address,
  xdr,
} from '@stellar/stellar-sdk';

@Injectable()
export class StellarService {
  private readonly server: SorobanRpc.Server;
  private readonly networkPassphrase: string;
  private readonly lendingContractId: string;
  private readonly oracleContractId: string;

  constructor(private config: ConfigService) {
    const rpcUrl = config.get<string>('STELLAR_RPC_URL', 'https://soroban-testnet.stellar.org');
    this.server = new SorobanRpc.Server(rpcUrl, { allowHttp: false });
    this.networkPassphrase = config.get<string>(
      'STELLAR_NETWORK_PASSPHRASE',
      Networks.TESTNET,
    );
    this.lendingContractId = config.get<string>('LENDING_CONTRACT_ID', '');
    this.oracleContractId = config.get<string>('ORACLE_CONTRACT_ID', '');
  }

  /**
   * Build and simulate a contract call — returns prepared XDR for signing.
   */
  async buildContractCall(
    callerPublicKey: string,
    contractId: string,
    method: string,
    args: xdr.ScVal[],
  ): Promise<string> {
    const account = await this.server.getAccount(callerPublicKey);
    const contract = new Contract(contractId);

    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: this.networkPassphrase,
    })
      .addOperation(contract.call(method, ...args))
      .setTimeout(30)
      .build();

    const simResult = await this.server.simulateTransaction(tx);
    if (SorobanRpc.Api.isSimulationError(simResult)) {
      throw new Error(`Simulation failed: ${simResult.error}`);
    }

    return SorobanRpc.assembleTransaction(tx, simResult).build().toXDR();
  }

  /**
   * Submit a signed XDR transaction and wait for confirmation.
   */
  async submitTransaction(signedXdr: string): Promise<string> {
    const tx = TransactionBuilder.fromXDR(signedXdr, this.networkPassphrase);
    const result = await this.server.sendTransaction(tx);

    if (result.status === 'ERROR') {
      throw new Error(`Transaction error: ${JSON.stringify(result.errorResult)}`);
    }

    let getResult = await this.server.getTransaction(result.hash);
    let attempts = 0;
    while (
      getResult.status === SorobanRpc.Api.GetTransactionStatus.NOT_FOUND &&
      attempts < 20
    ) {
      await new Promise((r) => setTimeout(r, 1500));
      getResult = await this.server.getTransaction(result.hash);
      attempts++;
    }

    if (getResult.status !== SorobanRpc.Api.GetTransactionStatus.SUCCESS) {
      throw new Error(`Transaction failed: ${getResult.status}`);
    }

    return result.hash;
  }

  /**
   * Read-only contract query (no signing needed).
   */
  async queryContract<T>(
    contractId: string,
    method: string,
    args: xdr.ScVal[],
    parser: (val: xdr.ScVal) => T,
  ): Promise<T> {
    const SIMULATION_SOURCE = 'GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN';
    const account = await this.server.getAccount(SIMULATION_SOURCE);
    const contract = new Contract(contractId);

    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: this.networkPassphrase,
    })
      .addOperation(contract.call(method, ...args))
      .setTimeout(30)
      .build();

    const simResult = await this.server.simulateTransaction(tx);
    if (SorobanRpc.Api.isSimulationError(simResult)) {
      throw new Error(`Query failed: ${simResult.error}`);
    }

    const retval = (simResult as SorobanRpc.Api.SimulateTransactionSuccessResponse)
      .result?.retval;
    if (!retval) throw new Error('No return value');

    return parser(retval);
  }

  // ── Helpers ──────────────────────────────────────────────────────────────

  toAddress(addr: string): xdr.ScVal {
    return new Address(addr).toScVal();
  }

  toU64(n: bigint): xdr.ScVal {
    return nativeToScVal(n, { type: 'u64' });
  }

  toI128(n: bigint): xdr.ScVal {
    return nativeToScVal(n, { type: 'i128' });
  }

  toU32(n: number): xdr.ScVal {
    return xdr.ScVal.scvU32(n);
  }

  getLendingContractId(): string {
    return this.lendingContractId;
  }

  getOracleContractId(): string {
    return this.oracleContractId;
  }
}
