**Donation**: `4tZtM3goWdyP7j6Lz1BDnV2yKB18pVjszCqRKJZX5o1D`  
**CA**: `8kUkHWozdBTjGJNUb8zyhBRrVQBHErTBxZRFWPxHpump`

# Roby - Solana-Based Robotics Control System

> Inspired by and built upon concepts from [SendAI](https://github.com/sendaifun)

Roby is a production-level, blockchain-based robotics control system built on Solana. It provides transaction-based permission management and Merkle tree credential verification for secure, decentralized robot operation.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Roby System Architecture                 │
└─────────────────────────────────────────────────────────────┘

┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   Operator   │         │   Authority  │         │     Owner    │
│   (Client)   │         │   (Admin)    │         │  (Creator)   │
└──────┬───────┘         └──────┬───────┘         └──────┬───────┘
       │                        │                        │
       │ Execute Command        │ Issue Credential       │ Initialize
       │                        │                        │
       ▼                        ▼                        ▼
┌─────────────────────────────────────────────────────────────┐
│                      REST API Layer                          │
│  ┌────────────┐  ┌────────────┐  ┌────────────────────┐    │
│  │   Robot    │  │ Credential │  │     Command        │    │
│  │  Endpoints │  │ Endpoints  │  │    Endpoints       │    │
│  └────────────┘  └────────────┘  └────────────────────┘    │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                     TypeScript SDK                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  RobyClient │ Instructions │ State │ Merkle Proofs  │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   Solana Blockchain                          │
│  ┌────────────────────────────────────────────────────┐     │
│  │              Roby Program (Rust)                   │     │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────┐    │     │
│  │  │  Robot   │  │Credential│  │   Command    │    │     │
│  │  │  State   │  │  State   │  │     Log      │    │     │
│  │  └──────────┘  └──────────┘  └──────────────┘    │     │
│  │                                                    │     │
│  │  ┌────────────────────────────────────────────┐  │     │
│  │  │      Merkle Tree Verification Engine       │  │     │
│  │  └────────────────────────────────────────────┘  │     │
│  └────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Solana Program (Rust)

The core smart contract implementing:

- **Robot State Management**: Track robot status, ownership, and operational parameters
- **Merkle Tree Credential System**: Verify operator credentials using cryptographic proofs
- **Permission-Based Access Control**: Multi-level authorization (Owner, Administrator, Operator, Observer)
- **Command Execution & Logging**: Secure command processing with complete audit trail

#### State Structures

```rust
pub struct Robot {
    pub owner: Pubkey,              // Robot owner
    pub authority: Pubkey,          // Control authority
    pub status: RobotStatus,        // Current operational status
    pub robot_id: [u8; 32],         // Unique identifier
    pub merkle_root: [u8; 32],      // Root of credential tree
    pub total_commands_executed: u64,
    pub active_operators: Vec<Pubkey>,
    pub emergency_stop: bool,
}

pub struct Credential {
    pub owner: Pubkey,
    pub robot: Pubkey,
    pub permission_level: PermissionLevel,
    pub valid_from: UnixTimestamp,
    pub valid_until: UnixTimestamp,
    pub revoked: bool,
    pub credential_hash: [u8; 32],
}
```

### 2. TypeScript SDK

Production-ready SDK for interacting with Roby:

```typescript
import { RobyClient } from '@roby/sdk';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';

const connection = new Connection('https://api.devnet.solana.com');
const programId = new PublicKey('YOUR_PROGRAM_ID');
const client = new RobyClient(connection, programId);

// Initialize a robot
const { robotAccount } = await client.initializeRobot({
  robotId: Buffer.from('unique-robot-id'),
  merkleRoot: merkleTree.getRoot(),
  metadataUri: 'https://metadata.uri/robot.json',
  owner: ownerKeypair.publicKey,
  authority: authorityKeypair.publicKey,
}, ownerKeypair);

// Issue credential
const { credentialAccount } = await client.issueCredential({
  recipient: operatorPublicKey,
  robot: robotAccount,
  permissionLevel: PermissionLevel.Operator,
  validFrom: Date.now() / 1000,
  validUntil: (Date.now() / 1000) + 86400,
  credentialHash: computedHash,
  issuer: authorityKeypair.publicKey,
}, authorityKeypair);

// Execute command with Merkle proof
await client.executeCommand({
  robot: robotAccount,
  executor: operatorKeypair.publicKey,
  credential: credentialAccount,
  commandType: CommandType.Move,
  parameters: Buffer.from(JSON.stringify({ x: 10, y: 20 })),
  merkleProof: merkleTree.getProof(credentialLeaf),
}, operatorKeypair);
```

### 3. REST API

Full-featured API service with:

- Rate limiting and security middleware
- Comprehensive error handling
- Request validation
- Logging and monitoring

#### API Endpoints

**Robot Management**

```bash
# Get robot details
GET /api/v1/robots/:publicKey

# Initialize new robot
POST /api/v1/robots
{
  "robotId": "hex_string",
  "merkleRoot": "hex_string",
  "metadataUri": "https://...",
  "ownerPrivateKey": "base58_string",
  "authorityPublicKey": "base58_string"
}

# Emergency stop
POST /api/v1/robots/:publicKey/emergency-stop

# Resume operation
POST /api/v1/robots/:publicKey/resume

# Get robots by owner
GET /api/v1/robots/owner/:ownerPublicKey
```

**Credential Management**

```bash
# Get credential details
GET /api/v1/credentials/:publicKey

# Issue new credential
POST /api/v1/credentials
{
  "recipientPublicKey": "...",
  "robotPublicKey": "...",
  "permissionLevel": 2,
  "validFrom": 1234567890,
  "validUntil": 1234567890,
  "credentialHash": "hex_string",
  "issuerPrivateKey": "base58_string"
}

# Revoke credential
POST /api/v1/credentials/:publicKey/revoke
```

**Command Execution**

```bash
# Execute command
POST /api/v1/commands/execute
{
  "robotPublicKey": "...",
  "credentialPublicKey": "...",
  "executorPrivateKey": "base58_string",
  "commandType": 0,
  "parameters": "hex_string",
  "merkleProof": ["hex_string", "hex_string"]
}
```

## Merkle Tree Credential System

```
                    Root Hash (On-chain)
                         │
            ┌────────────┴────────────┐
            │                         │
         Hash AB                   Hash CD
            │                         │
      ┌─────┴─────┐            ┌─────┴─────┐
      │           │            │           │
   Hash A      Hash B       Hash C      Hash D
      │           │            │           │
  Cred A      Cred B       Cred C      Cred D
  (Alice)     (Bob)      (Charlie)    (Dave)

To verify Alice's credential:
1. Provide: Cred A + Hash B + Hash CD
2. Compute: Hash A = hash(Cred A)
3. Compute: Hash AB = hash(Hash A, Hash B)
4. Compute: Root = hash(Hash AB, Hash CD)
5. Verify: Computed Root == On-chain Root
```

### Benefits

- **Privacy**: Only the root hash is stored on-chain
- **Efficiency**: Verification is O(log n) in credential count
- **Flexibility**: Update credentials by updating root hash
- **Security**: Cryptographically secure proof system

## Permission Levels

| Level | Name          | Capabilities                                    |
|-------|---------------|-------------------------------------------------|
| 0     | None          | No access                                       |
| 1     | Observer      | View robot status                               |
| 2     | Operator      | Execute standard commands                       |
| 3     | Administrator | Execute all commands, manage operators          |
| 4     | Owner         | Full control, transfer ownership, update config |

## Security Features

### Transaction-Based Control

All robot operations are Solana transactions, providing:

- **Atomic Execution**: Commands either complete fully or fail entirely
- **Cryptographic Signatures**: Every action requires valid signature
- **Immutable Audit Trail**: All operations permanently recorded
- **Replay Protection**: Built into Solana's transaction system

### Multi-Layer Authorization

```
┌─────────────────────────────────────────────┐
│  Layer 1: Signature Verification            │
│  ✓ Valid Ed25519 signature required         │
└──────────────┬──────────────────────────────┘
               │
┌──────────────▼──────────────────────────────┐
│  Layer 2: Credential Validation             │
│  ✓ Credential not revoked                   │
│  ✓ Current time within validity period      │
│  ✓ Credential owner matches signer          │
└──────────────┬──────────────────────────────┘
               │
┌──────────────▼──────────────────────────────┐
│  Layer 3: Merkle Proof Verification         │
│  ✓ Proof validates against on-chain root    │
└──────────────┬──────────────────────────────┘
               │
┌──────────────▼──────────────────────────────┐
│  Layer 4: Permission Level Check            │
│  ✓ Sufficient permission for command type   │
└──────────────┬──────────────────────────────┘
               │
               ▼
         Command Execution
```

## Installation & Setup

### Prerequisites

- Rust 1.75+
- Solana CLI 1.18+
- Node.js 18+
- Anchor Framework (optional)

### Building the Program

```bash
# Navigate to program directory
cd program

# Build the program
cargo build-bpf

# Deploy to devnet
solana program deploy target/deploy/roby_program.so
```

### Installing the SDK

```bash
cd sdk
npm install
npm run build
```

### Running the API

```bash
cd api
npm install

# Configure environment
cp .env.example .env
# Edit .env with your program ID and RPC URL

# Start the server
npm run dev
```

## Usage Examples

### Complete Workflow

```typescript
import { RobyClient, MerkleTree, createCredentialLeaf } from '@roby/sdk';
import { Connection, Keypair } from '@solana/web3.js';

// Step 1: Initialize client
const connection = new Connection('https://api.devnet.solana.com');
const programId = new PublicKey('YOUR_PROGRAM_ID');
const client = new RobyClient(connection, programId);

// Step 2: Create credential leaves
const credentials = [
  createCredentialLeaf(
    operator1.publicKey.toBase58(),
    robotAccount.toBase58(),
    PermissionLevel.Operator,
    validFrom,
    validUntil
  ),
  createCredentialLeaf(
    operator2.publicKey.toBase58(),
    robotAccount.toBase58(),
    PermissionLevel.Administrator,
    validFrom,
    validUntil
  ),
];

// Step 3: Build Merkle tree
const merkleTree = new MerkleTree(credentials);
const merkleRoot = merkleTree.getRoot();

// Step 4: Initialize robot
const { robotAccount } = await client.initializeRobot({
  robotId: generateRobotId(),
  merkleRoot,
  metadataUri: 'ipfs://...',
  owner: owner.publicKey,
  authority: authority.publicKey,
}, owner);

// Step 5: Issue credentials
const credentialHash = credentials[0];
const { credentialAccount } = await client.issueCredential({
  recipient: operator1.publicKey,
  robot: robotAccount,
  permissionLevel: PermissionLevel.Operator,
  validFrom,
  validUntil,
  credentialHash,
  issuer: authority.publicKey,
}, authority);

// Step 6: Execute command with proof
const proof = merkleTree.getProof(credentials[0]);
await client.executeCommand({
  robot: robotAccount,
  executor: operator1.publicKey,
  credential: credentialAccount,
  commandType: CommandType.Move,
  parameters: Buffer.from(JSON.stringify({ x: 100, y: 200, z: 50 })),
  merkleProof: proof,
}, operator1);
```

## Command Types

| Type          | Value | Description                          | Min Permission |
|---------------|-------|--------------------------------------|----------------|
| Move          | 0     | Move robot to position               | Operator       |
| Rotate        | 1     | Rotate robot                         | Operator       |
| Grab          | 2     | Activate gripper/grabber             | Operator       |
| Release       | 3     | Release gripper                      | Operator       |
| EmergencyStop | 4     | Emergency stop all operations        | Administrator  |
| Reset         | 5     | Reset robot to initial state         | Operator       |
| Calibrate     | 6     | Run calibration routine              | Operator       |
| UpdateConfig  | 7     | Update robot configuration           | Administrator  |
| Custom        | 8     | Custom command with parameters       | Operator       |

## Project Structure

```
roby/
├── program/              # Rust Solana program
│   ├── src/
│   │   ├── lib.rs       # Program entrypoint
│   │   ├── processor.rs # Instruction processors
│   │   ├── state.rs     # State structures
│   │   ├── instruction.rs
│   │   ├── merkle.rs    # Merkle tree verification
│   │   └── error.rs     # Error definitions
│   └── Cargo.toml
│
├── sdk/                 # TypeScript SDK
│   ├── src/
│   │   ├── roby.ts      # Main client
│   │   ├── instructions.ts
│   │   ├── state.ts
│   │   ├── merkle.ts
│   │   ├── types.ts
│   │   └── utils.ts
│   ├── package.json
│   └── tsconfig.json
│
├── api/                 # REST API service
│   ├── src/
│   │   ├── index.ts
│   │   ├── config.ts
│   │   ├── routes/
│   │   │   ├── robot.ts
│   │   │   ├── credential.ts
│   │   │   └── command.ts
│   │   ├── middleware/
│   │   └── utils/
│   └── package.json
│
└── README.md
```

## Testing

### Program Tests

```bash
cd program
cargo test-bpf
```

### SDK Tests

```bash
cd sdk
npm test
```

### Integration Tests

```bash
# Deploy program to localnet
solana-test-validator &
cd program
cargo build-bpf
solana program deploy target/deploy/roby_program.so

# Run integration tests
cd ../sdk
npm run test:integration
```

## Performance Characteristics

- **Transaction Finality**: ~400ms on Solana mainnet
- **Throughput**: Up to 65,000 TPS (Solana network limit)
- **Merkle Verification**: O(log n) complexity
- **Storage Efficiency**: ~1KB per robot, ~512 bytes per credential
- **API Response Time**: <100ms average (excluding blockchain confirmation)

## Roadmap

- Multi-signature support for critical operations
- Hardware integration modules (ROS, MQTT bridges)
- Advanced monitoring and analytics dashboard
- Cross-program invocation for DeFi integration
- Zero-knowledge proof support for enhanced privacy
- Batch command execution for complex workflows

## Security Considerations

### Best Practices

1. **Key Management**: Use hardware wallets for owner/authority keys
2. **Credential Rotation**: Regularly update Merkle roots and reissue credentials
3. **Rate Limiting**: Implement command rate limits based on robot capabilities
4. **Emergency Procedures**: Always maintain emergency stop authority
5. **Audit Trail**: Monitor command logs for suspicious activity

### Known Limitations

- Merkle tree updates require authority signature
- Credential revocation requires separate transaction
- Command parameters limited to 256 bytes
- Maximum 10 active operators per robot (configurable)

## Contributing

Contributions are welcome. Please ensure:

- All tests pass
- Code follows Rust and TypeScript style guidelines
- Documentation is updated
- Security implications are considered

## License

Apache-2.0

## Acknowledgments

Built upon concepts and tooling from [SendAI](https://github.com/sendaifun), accelerating the Solana AI ecosystem.

## Contact & Support

For issues, questions, or discussions, please open an issue in the repository.

---

**Disclaimer**: This is experimental software. Use at your own risk in production environments. Always conduct thorough testing and security audits before deploying to mainnet.









