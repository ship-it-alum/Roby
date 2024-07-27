import {
  Connection,
  PublicKey,
  Transaction,
  Keypair,
  SystemProgram,
  sendAndConfirmTransaction,
  TransactionSignature,
  AccountInfo,
} from '@solana/web3.js';
import { RobyInstructions } from './instructions';
import { RobotAccount, CredentialAccount, CommandLogAccount } from './state';
import {
  RobotData,
  CredentialData,
  InitializeRobotParams,
  IssueCredentialParams,
  ExecuteCommandParams,
  CommandType,
  PermissionLevel,
} from './types';
import { MerkleTree, createCredentialLeaf } from './merkle';

export class RobyClient {
  private instructions: RobyInstructions;

  constructor(
    private connection: Connection,
    private programId: PublicKey
  ) {
    this.instructions = new RobyInstructions(programId);
  }

  async initializeRobot(
    params: InitializeRobotParams,
    payer: Keypair
  ): Promise<{ signature: TransactionSignature; robotAccount: PublicKey }> {
    const robotAccount = Keypair.generate();
    const lamports = await this.connection.getMinimumBalanceForRentExemption(
      1024
    );

    const transaction = new Transaction().add(
      SystemProgram.createAccount({
        fromPubkey: payer.publicKey,
        newAccountPubkey: robotAccount.publicKey,
        lamports,
        space: 1024,
        programId: this.programId,
      }),
      this.instructions.createInitializeRobotInstruction(
        params,
        robotAccount.publicKey
      )
    );

    const signature = await sendAndConfirmTransaction(
      this.connection,
      transaction,
      [payer, robotAccount]
    );

    return {
      signature,
      robotAccount: robotAccount.publicKey,
    };
  }

  async issueCredential(
    params: IssueCredentialParams,
    payer: Keypair
  ): Promise<{ signature: TransactionSignature; credentialAccount: PublicKey }> {
    const credentialAccount = Keypair.generate();
    const lamports = await this.connection.getMinimumBalanceForRentExemption(
      512
    );

    const transaction = new Transaction().add(
      SystemProgram.createAccount({
        fromPubkey: payer.publicKey,
        newAccountPubkey: credentialAccount.publicKey,
        lamports,
        space: 512,
        programId: this.programId,
      }),
      this.instructions.createIssueCredentialInstruction(
        params,
        credentialAccount.publicKey,
        params.robot
      )
    );

    const signature = await sendAndConfirmTransaction(
      this.connection,
      transaction,
      [payer, credentialAccount]
    );

    return {
      signature,
      credentialAccount: credentialAccount.publicKey,
    };
  }

  async revokeCredential(
    credentialAccount: PublicKey,
    robotAccount: PublicKey,
    authority: Keypair
  ): Promise<TransactionSignature> {
    const transaction = new Transaction().add(
      this.instructions.createRevokeCredentialInstruction(
        credentialAccount,
        robotAccount,
        authority.publicKey
      )
    );

    return await sendAndConfirmTransaction(this.connection, transaction, [
      authority,
    ]);
  }

  async executeCommand(
    params: ExecuteCommandParams,
    executor: Keypair
  ): Promise<{ signature: TransactionSignature; commandLogAccount: PublicKey }> {
    const commandLogAccount = Keypair.generate();
    const lamports = await this.connection.getMinimumBalanceForRentExemption(
      512
    );

    const transaction = new Transaction().add(
      SystemProgram.createAccount({
        fromPubkey: executor.publicKey,
        newAccountPubkey: commandLogAccount.publicKey,
        lamports,
        space: 512,
        programId: this.programId,
      }),
      this.instructions.createExecuteCommandInstruction(
        params,
        commandLogAccount.publicKey
      )
    );

    const signature = await sendAndConfirmTransaction(
      this.connection,
      transaction,
      [executor, commandLogAccount]
    );

    return {
      signature,
      commandLogAccount: commandLogAccount.publicKey,
    };
  }

  async updateMerkleRoot(
    robotAccount: PublicKey,
    authority: Keypair,
    newMerkleRoot: Buffer
  ): Promise<TransactionSignature> {
    const transaction = new Transaction().add(
      this.instructions.createUpdateMerkleRootInstruction(
        robotAccount,
        authority.publicKey,
        newMerkleRoot
      )
    );

    return await sendAndConfirmTransaction(this.connection, transaction, [
      authority,
    ]);
  }

  async transferAuthority(
    robotAccount: PublicKey,
    currentAuthority: Keypair,
    newAuthority: PublicKey
  ): Promise<TransactionSignature> {
    const transaction = new Transaction().add(
      this.instructions.createTransferAuthorityInstruction(
        robotAccount,
        currentAuthority.publicKey,
        newAuthority
      )
    );

    return await sendAndConfirmTransaction(this.connection, transaction, [
      currentAuthority,
    ]);
  }

  async addOperator(
    robotAccount: PublicKey,
    authority: Keypair,
    operator: PublicKey
  ): Promise<TransactionSignature> {
    const transaction = new Transaction().add(
      this.instructions.createAddOperatorInstruction(
        robotAccount,
        authority.publicKey,
        operator
      )
    );

    return await sendAndConfirmTransaction(this.connection, transaction, [
      authority,
    ]);
  }

  async removeOperator(
    robotAccount: PublicKey,
    authority: Keypair,
    operator: PublicKey
  ): Promise<TransactionSignature> {
    const transaction = new Transaction().add(
      this.instructions.createRemoveOperatorInstruction(
        robotAccount,
        authority.publicKey,
        operator
      )
    );

    return await sendAndConfirmTransaction(this.connection, transaction, [
      authority,
    ]);
  }

  async emergencyStop(
    robotAccount: PublicKey,
    authority: Keypair
  ): Promise<TransactionSignature> {
    const transaction = new Transaction().add(
      this.instructions.createEmergencyStopInstruction(
        robotAccount,
        authority.publicKey
      )
    );

    return await sendAndConfirmTransaction(this.connection, transaction, [
      authority,
    ]);
  }

  async resume(
    robotAccount: PublicKey,
    authority: Keypair
  ): Promise<TransactionSignature> {
    const transaction = new Transaction().add(
      this.instructions.createResumeInstruction(
        robotAccount,
        authority.publicKey
      )
    );

    return await sendAndConfirmTransaction(this.connection, transaction, [
      authority,
    ]);
  }

  async getRobotData(robotAccount: PublicKey): Promise<RobotData | null> {
    const accountInfo = await this.connection.getAccountInfo(robotAccount);
    if (!accountInfo) {
      return null;
    }
    return RobotAccount.decode(accountInfo.data);
  }

  async getCredentialData(
    credentialAccount: PublicKey
  ): Promise<CredentialData | null> {
    const accountInfo = await this.connection.getAccountInfo(
      credentialAccount
    );
    if (!accountInfo) {
      return null;
    }
    return CredentialAccount.decode(accountInfo.data);
  }

  async getRobotsByOwner(owner: PublicKey): Promise<PublicKey[]> {
    const accounts = await this.connection.getProgramAccounts(this.programId, {
      filters: [
        {
          memcmp: {
            offset: 1,
            bytes: owner.toBase58(),
          },
        },
      ],
    });

    return accounts.map((account) => account.pubkey);
  }

  getProgramId(): PublicKey {
    return this.programId;
  }

  getConnection(): Connection {
    return this.connection;
  }
}



