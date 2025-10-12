import { RobyClient, MerkleTree, createCredentialLeaf, PermissionLevel, CommandType } from '@roby/sdk';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';

async function main() {
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  const programId = new PublicKey('YOUR_PROGRAM_ID_HERE');
  const client = new RobyClient(connection, programId);

  const owner = Keypair.generate();
  const authority = Keypair.generate();
  const operator = Keypair.generate();

  console.log('Airdropping SOL for testing...');
  const airdropSignature = await connection.requestAirdrop(
    owner.publicKey,
    2000000000
  );
  await connection.confirmTransaction(airdropSignature);

  const credentials = [
    createCredentialLeaf(
      operator.publicKey.toBase58(),
      '',
      PermissionLevel.Operator,
      Math.floor(Date.now() / 1000),
      Math.floor(Date.now() / 1000) + 86400
    ),
  ];

  const merkleTree = new MerkleTree(credentials);
  const merkleRoot = merkleTree.getRoot();

  console.log('Initializing robot...');
  const { robotAccount, signature: initSig } = await client.initializeRobot({
    robotId: Buffer.from('robot-001-test'),
    merkleRoot,
    metadataUri: 'https://example.com/robot-metadata.json',
    owner: owner.publicKey,
    authority: authority.publicKey,
  }, owner);

  console.log(`Robot initialized: ${robotAccount.toBase58()}`);
  console.log(`Transaction: ${initSig}`);

  const updatedCredentials = credentials.map(c => {
    const leaf = createCredentialLeaf(
      operator.publicKey.toBase58(),
      robotAccount.toBase58(),
      PermissionLevel.Operator,
      Math.floor(Date.now() / 1000),
      Math.floor(Date.now() / 1000) + 86400
    );
    return leaf;
  });

  console.log('Issuing credential...');
  const { credentialAccount } = await client.issueCredential({
    recipient: operator.publicKey,
    robot: robotAccount,
    permissionLevel: PermissionLevel.Operator,
    validFrom: Math.floor(Date.now() / 1000),
    validUntil: Math.floor(Date.now() / 1000) + 86400,
    credentialHash: updatedCredentials[0],
    issuer: authority.publicKey,
  }, authority);

  console.log(`Credential issued: ${credentialAccount.toBase58()}`);

  const robotData = await client.getRobotData(robotAccount);
  console.log('Robot data:', robotData);

  console.log('Example completed successfully!');
}

main().catch(console.error);













