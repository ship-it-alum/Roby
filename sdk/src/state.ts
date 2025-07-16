import { PublicKey } from '@solana/web3.js';
import { deserialize, serialize } from 'borsh';
import { RobotData, CredentialData, CommandLogData, RobotStatus, PermissionLevel, CommandType } from './types';

class RobotAccount {
  isInitialized: boolean;
  owner: Uint8Array;
  authority: Uint8Array;
  status: number;
  robotId: Uint8Array;
  merkleRoot: Uint8Array;
  lastCommandTimestamp: bigint;
  totalCommandsExecuted: bigint;
  activeOperators: Uint8Array[];
  maxOperators: number;
  emergencyStop: boolean;
  metadataUri: string;

  constructor(fields: any) {
    this.isInitialized = fields.isInitialized;
    this.owner = fields.owner;
    this.authority = fields.authority;
    this.status = fields.status;
    this.robotId = fields.robotId;
    this.merkleRoot = fields.merkleRoot;
    this.lastCommandTimestamp = fields.lastCommandTimestamp;
    this.totalCommandsExecuted = fields.totalCommandsExecuted;
    this.activeOperators = fields.activeOperators;
    this.maxOperators = fields.maxOperators;
    this.emergencyStop = fields.emergencyStop;
    this.metadataUri = fields.metadataUri;
  }

  static schema = new Map([
    [
      RobotAccount,
      {
        kind: 'struct',
        fields: [
          ['isInitialized', 'u8'],
          ['owner', [32]],
          ['authority', [32]],
          ['status', 'u8'],
          ['robotId', [32]],
          ['merkleRoot', [32]],
          ['lastCommandTimestamp', 'i64'],
          ['totalCommandsExecuted', 'u64'],
          ['activeOperators', [[32]]],
          ['maxOperators', 'u8'],
          ['emergencyStop', 'u8'],
          ['metadataUri', 'string'],
        ],
      },
    ],
  ]);

  static decode(data: Buffer): RobotData {
    const decoded = deserialize(this.schema, RobotAccount, data) as RobotAccount;
    return {
      isInitialized: decoded.isInitialized !== 0,
      owner: new PublicKey(decoded.owner),
      authority: new PublicKey(decoded.authority),
      status: decoded.status as RobotStatus,
      robotId: Buffer.from(decoded.robotId),
      merkleRoot: Buffer.from(decoded.merkleRoot),
      lastCommandTimestamp: Number(decoded.lastCommandTimestamp),
      totalCommandsExecuted: Number(decoded.totalCommandsExecuted),
      activeOperators: decoded.activeOperators.map((op) => new PublicKey(op)),
      maxOperators: decoded.maxOperators,
      emergencyStop: decoded.emergencyStop !== 0,
      metadataUri: decoded.metadataUri,
    };
  }
}

class CredentialAccount {
  isInitialized: boolean;
  owner: Uint8Array;
  robot: Uint8Array;
  permissionLevel: number;
  validFrom: bigint;
  validUntil: bigint;
  revoked: boolean;
  credentialHash: Uint8Array;
  issuer: Uint8Array;

  constructor(fields: any) {
    this.isInitialized = fields.isInitialized;
    this.owner = fields.owner;
    this.robot = fields.robot;
    this.permissionLevel = fields.permissionLevel;
    this.validFrom = fields.validFrom;
    this.validUntil = fields.validUntil;
    this.revoked = fields.revoked;
    this.credentialHash = fields.credentialHash;
    this.issuer = fields.issuer;
  }

  static schema = new Map([
    [
      CredentialAccount,
      {
        kind: 'struct',
        fields: [
          ['isInitialized', 'u8'],
          ['owner', [32]],
          ['robot', [32]],
          ['permissionLevel', 'u8'],
          ['validFrom', 'i64'],
          ['validUntil', 'i64'],
          ['revoked', 'u8'],
          ['credentialHash', [32]],
          ['issuer', [32]],
        ],
      },
    ],
  ]);

  static decode(data: Buffer): CredentialData {
    const decoded = deserialize(this.schema, CredentialAccount, data) as CredentialAccount;
    return {
      isInitialized: decoded.isInitialized !== 0,
      owner: new PublicKey(decoded.owner),
      robot: new PublicKey(decoded.robot),
      permissionLevel: decoded.permissionLevel as PermissionLevel,
      validFrom: Number(decoded.validFrom),
      validUntil: Number(decoded.validUntil),
      revoked: decoded.revoked !== 0,
      credentialHash: Buffer.from(decoded.credentialHash),
      issuer: new PublicKey(decoded.issuer),
    };
  }
}

class CommandLogAccount {
  isInitialized: boolean;
  robot: Uint8Array;
  executor: Uint8Array;
  commandType: number;
  timestamp: bigint;
  parameters: Uint8Array;
  success: boolean;
  errorCode: number;

  constructor(fields: any) {
    this.isInitialized = fields.isInitialized;
    this.robot = fields.robot;
    this.executor = fields.executor;
    this.commandType = fields.commandType;
    this.timestamp = fields.timestamp;
    this.parameters = fields.parameters;
    this.success = fields.success;
    this.errorCode = fields.errorCode;
  }

  static schema = new Map([
    [
      CommandLogAccount,
      {
        kind: 'struct',
        fields: [
          ['isInitialized', 'u8'],
          ['robot', [32]],
          ['executor', [32]],
          ['commandType', 'u8'],
          ['timestamp', 'i64'],
          ['parameters', ['u8']],
          ['success', 'u8'],
          ['errorCode', 'u32'],
        ],
      },
    ],
  ]);

  static decode(data: Buffer): CommandLogData {
    const decoded = deserialize(this.schema, CommandLogAccount, data) as CommandLogAccount;
    return {
      isInitialized: decoded.isInitialized !== 0,
      robot: new PublicKey(decoded.robot),
      executor: new PublicKey(decoded.executor),
      commandType: decoded.commandType as CommandType,
      timestamp: Number(decoded.timestamp),
      parameters: Buffer.from(decoded.parameters),
      success: decoded.success !== 0,
      errorCode: decoded.errorCode,
    };
  }
}

export { RobotAccount, CredentialAccount, CommandLogAccount };













