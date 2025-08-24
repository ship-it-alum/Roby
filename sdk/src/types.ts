import { PublicKey } from '@solana/web3.js';

export enum RobotStatus {
  Offline = 0,
  Idle = 1,
  Active = 2,
  Executing = 3,
  Error = 4,
  Maintenance = 5,
}

export enum PermissionLevel {
  None = 0,
  Observer = 1,
  Operator = 2,
  Administrator = 3,
  Owner = 4,
}

export enum CommandType {
  Move = 0,
  Rotate = 1,
  Grab = 2,
  Release = 3,
  EmergencyStop = 4,
  Reset = 5,
  Calibrate = 6,
  UpdateConfig = 7,
  Custom = 8,
}

export interface RobotData {
  isInitialized: boolean;
  owner: PublicKey;
  authority: PublicKey;
  status: RobotStatus;
  robotId: Buffer;
  merkleRoot: Buffer;
  lastCommandTimestamp: number;
  totalCommandsExecuted: number;
  activeOperators: PublicKey[];
  maxOperators: number;
  emergencyStop: boolean;
  metadataUri: string;
}

export interface CredentialData {
  isInitialized: boolean;
  owner: PublicKey;
  robot: PublicKey;
  permissionLevel: PermissionLevel;
  validFrom: number;
  validUntil: number;
  revoked: boolean;
  credentialHash: Buffer;
  issuer: PublicKey;
}

export interface CommandLogData {
  isInitialized: boolean;
  robot: PublicKey;
  executor: PublicKey;
  commandType: CommandType;
  timestamp: number;
  parameters: Buffer;
  success: boolean;
  errorCode: number;
}

export interface InitializeRobotParams {
  robotId: Buffer;
  merkleRoot: Buffer;
  metadataUri: string;
  owner: PublicKey;
  authority: PublicKey;
}

export interface IssueCredentialParams {
  recipient: PublicKey;
  robot: PublicKey;
  permissionLevel: PermissionLevel;
  validFrom: number;
  validUntil: number;
  credentialHash: Buffer;
  issuer: PublicKey;
}

export interface ExecuteCommandParams {
  robot: PublicKey;
  executor: PublicKey;
  credential: PublicKey;
  commandType: CommandType;
  parameters: Buffer;
  merkleProof: Buffer[];
}

















