import {
  PublicKey,
  TransactionInstruction,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  SYSVAR_CLOCK_PUBKEY,
} from '@solana/web3.js';
import { serialize } from 'borsh';
import {
  InitializeRobotParams,
  IssueCredentialParams,
  ExecuteCommandParams,
  PermissionLevel,
  CommandType,
} from './types';

export class RobyInstructions {
  constructor(private programId: PublicKey) {}

  createInitializeRobotInstruction(
    params: InitializeRobotParams,
    robotAccount: PublicKey
  ): TransactionInstruction {
    const data = Buffer.concat([
      Buffer.from([0]),
      params.robotId,
      params.merkleRoot,
      Buffer.from(this.encodeString(params.metadataUri)),
    ]);

    return new TransactionInstruction({
      keys: [
        { pubkey: robotAccount, isSigner: false, isWritable: true },
        { pubkey: params.owner, isSigner: true, isWritable: false },
        { pubkey: params.authority, isSigner: false, isWritable: false },
        { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
      ],
      programId: this.programId,
      data,
    });
  }

  createIssueCredentialInstruction(
    params: IssueCredentialParams,
    credentialAccount: PublicKey,
    robotAccount: PublicKey
  ): TransactionInstruction {
    const data = Buffer.concat([
      Buffer.from([1]),
      Buffer.from([params.permissionLevel]),
      this.encodeI64(params.validFrom),
      this.encodeI64(params.validUntil),
      params.credentialHash,
    ]);

    return new TransactionInstruction({
      keys: [
        { pubkey: credentialAccount, isSigner: false, isWritable: true },
        { pubkey: robotAccount, isSigner: false, isWritable: false },
        { pubkey: params.issuer, isSigner: true, isWritable: false },
        { pubkey: params.recipient, isSigner: false, isWritable: false },
        { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
      ],
      programId: this.programId,
      data,
    });
  }

  createRevokeCredentialInstruction(
    credentialAccount: PublicKey,
    robotAccount: PublicKey,
    authority: PublicKey
  ): TransactionInstruction {
    const data = Buffer.from([2]);

    return new TransactionInstruction({
      keys: [
        { pubkey: credentialAccount, isSigner: false, isWritable: true },
        { pubkey: authority, isSigner: true, isWritable: false },
        { pubkey: robotAccount, isSigner: false, isWritable: false },
      ],
      programId: this.programId,
      data,
    });
  }

  createExecuteCommandInstruction(
    params: ExecuteCommandParams,
    commandLogAccount: PublicKey
  ): TransactionInstruction {
    const proofData = Buffer.concat(
      params.merkleProof.map((p) => Buffer.from(p))
    );

    const data = Buffer.concat([
      Buffer.from([3]),
      Buffer.from([params.commandType]),
      this.encodeVec(params.parameters),
      this.encodeVec(proofData),
    ]);

    return new TransactionInstruction({
      keys: [
        { pubkey: params.robot, isSigner: false, isWritable: true },
        { pubkey: params.executor, isSigner: true, isWritable: false },
        { pubkey: params.credential, isSigner: false, isWritable: false },
        { pubkey: commandLogAccount, isSigner: false, isWritable: true },
        { pubkey: SYSVAR_CLOCK_PUBKEY, isSigner: false, isWritable: false },
      ],
      programId: this.programId,
      data,
    });
  }

  createUpdateMerkleRootInstruction(
    robotAccount: PublicKey,
    authority: PublicKey,
    newMerkleRoot: Buffer
  ): TransactionInstruction {
    const data = Buffer.concat([Buffer.from([4]), newMerkleRoot]);

    return new TransactionInstruction({
      keys: [
        { pubkey: robotAccount, isSigner: false, isWritable: true },
        { pubkey: authority, isSigner: true, isWritable: false },
      ],
      programId: this.programId,
      data,
    });
  }

  createTransferAuthorityInstruction(
    robotAccount: PublicKey,
    currentAuthority: PublicKey,
    newAuthority: PublicKey
  ): TransactionInstruction {
    const data = Buffer.concat([Buffer.from([5]), newAuthority.toBuffer()]);

    return new TransactionInstruction({
      keys: [
        { pubkey: robotAccount, isSigner: false, isWritable: true },
        { pubkey: currentAuthority, isSigner: true, isWritable: false },
      ],
      programId: this.programId,
      data,
    });
  }

  createAddOperatorInstruction(
    robotAccount: PublicKey,
    authority: PublicKey,
    operator: PublicKey
  ): TransactionInstruction {
    const data = Buffer.concat([Buffer.from([6]), operator.toBuffer()]);

    return new TransactionInstruction({
      keys: [
        { pubkey: robotAccount, isSigner: false, isWritable: true },
        { pubkey: authority, isSigner: true, isWritable: false },
      ],
      programId: this.programId,
      data,
    });
  }

  createRemoveOperatorInstruction(
    robotAccount: PublicKey,
    authority: PublicKey,
    operator: PublicKey
  ): TransactionInstruction {
    const data = Buffer.concat([Buffer.from([7]), operator.toBuffer()]);

    return new TransactionInstruction({
      keys: [
        { pubkey: robotAccount, isSigner: false, isWritable: true },
        { pubkey: authority, isSigner: true, isWritable: false },
      ],
      programId: this.programId,
      data,
    });
  }

  createEmergencyStopInstruction(
    robotAccount: PublicKey,
    authority: PublicKey
  ): TransactionInstruction {
    const data = Buffer.from([8]);

    return new TransactionInstruction({
      keys: [
        { pubkey: robotAccount, isSigner: false, isWritable: true },
        { pubkey: authority, isSigner: true, isWritable: false },
      ],
      programId: this.programId,
      data,
    });
  }

  createResumeInstruction(
    robotAccount: PublicKey,
    authority: PublicKey
  ): TransactionInstruction {
    const data = Buffer.from([9]);

    return new TransactionInstruction({
      keys: [
        { pubkey: robotAccount, isSigner: false, isWritable: true },
        { pubkey: authority, isSigner: true, isWritable: false },
      ],
      programId: this.programId,
      data,
    });
  }

  createUpdateRobotStatusInstruction(
    robotAccount: PublicKey,
    authority: PublicKey,
    status: number
  ): TransactionInstruction {
    const data = Buffer.from([10, status]);

    return new TransactionInstruction({
      keys: [
        { pubkey: robotAccount, isSigner: false, isWritable: true },
        { pubkey: authority, isSigner: true, isWritable: false },
      ],
      programId: this.programId,
      data,
    });
  }

  createTransferOwnershipInstruction(
    robotAccount: PublicKey,
    currentOwner: PublicKey,
    newOwner: PublicKey
  ): TransactionInstruction {
    const data = Buffer.concat([Buffer.from([11]), newOwner.toBuffer()]);

    return new TransactionInstruction({
      keys: [
        { pubkey: robotAccount, isSigner: false, isWritable: true },
        { pubkey: currentOwner, isSigner: true, isWritable: false },
      ],
      programId: this.programId,
      data,
    });
  }

  private encodeString(str: string): Uint8Array {
    const encoded = Buffer.from(str, 'utf8');
    const length = Buffer.alloc(4);
    length.writeUInt32LE(encoded.length, 0);
    return Buffer.concat([length, encoded]);
  }

  private encodeI64(value: number): Buffer {
    const buffer = Buffer.alloc(8);
    buffer.writeBigInt64LE(BigInt(value), 0);
    return buffer;
  }

  private encodeVec(data: Buffer): Buffer {
    const length = Buffer.alloc(4);
    length.writeUInt32LE(data.length, 0);
    return Buffer.concat([length, data]);
  }
}











