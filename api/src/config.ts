import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { RobyClient } from '@roby/sdk';

export const config = {
  solana: {
    network: process.env.SOLANA_NETWORK || 'devnet',
    rpcUrl: process.env.SOLANA_RPC_URL || clusterApiUrl('devnet'),
  },
  program: {
    id: process.env.PROGRAM_ID || '',
  },
  api: {
    port: parseInt(process.env.PORT || '3000'),
    rateLimit: {
      windowMs: 15 * 60 * 1000,
      max: 100,
    },
  },
};

let connection: Connection;
let robyClient: RobyClient;

export function getConnection(): Connection {
  if (!connection) {
    connection = new Connection(config.solana.rpcUrl, 'confirmed');
  }
  return connection;
}

export function getRobyClient(): RobyClient {
  if (!robyClient) {
    const conn = getConnection();
    const programId = new PublicKey(config.program.id);
    robyClient = new RobyClient(conn, programId);
  }
  return robyClient;
}



















