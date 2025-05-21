import { PublicKey, Keypair } from '@solana/web3.js';
import { createHash, randomBytes } from 'crypto';

export function generateRobotId(): Buffer {
  return randomBytes(32);
}

export function deriveRobotAddress(
  programId: PublicKey,
  owner: PublicKey,
  robotId: Buffer
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('robot'), owner.toBuffer(), robotId],
    programId
  );
}

export function deriveCredentialAddress(
  programId: PublicKey,
  robot: PublicKey,
  owner: PublicKey
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('credential'), robot.toBuffer(), owner.toBuffer()],
    programId
  );
}

export function hashCredential(
  owner: PublicKey,
  robot: PublicKey,
  permissionLevel: number,
  validFrom: number,
  validUntil: number
): Buffer {
  const data = Buffer.concat([
    owner.toBuffer(),
    robot.toBuffer(),
    Buffer.from([permissionLevel]),
    Buffer.from(validFrom.toString()),
    Buffer.from(validUntil.toString()),
  ]);
  return createHash('sha256').update(data).digest();
}

export function isValidPermissionLevel(level: number): boolean {
  return level >= 0 && level <= 4;
}

export function canExecuteCommand(
  permissionLevel: number,
  commandType: number
): boolean {
  if (permissionLevel === 0 || permissionLevel === 1) {
    return false;
  }
  
  if (commandType === 4 || commandType === 7) {
    return permissionLevel >= 3;
  }
  
  return true;
}

export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  
  constructor(
    private maxRequests: number,
    private windowMs: number
  ) {}
  
  canMakeRequest(identifier: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(identifier) || [];
    
    const validRequests = requests.filter(
      (timestamp) => now - timestamp < this.windowMs
    );
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    validRequests.push(now);
    this.requests.set(identifier, validRequests);
    
    return true;
  }
  
  reset(identifier: string): void {
    this.requests.delete(identifier);
  }
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function retry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        await sleep(delayMs * Math.pow(2, i));
      }
    }
  }
  
  throw lastError!;
}







