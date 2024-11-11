import { MerkleTree, createCredentialLeaf, PermissionLevel } from '@roby/sdk';
import { Keypair, PublicKey } from '@solana/web3.js';

function demoMerkleTree() {
  console.log('=== Merkle Tree Credential System Demo ===\n');

  const robotPublicKey = 'RobotPublicKeyExample123456789';
  const validFrom = Math.floor(Date.now() / 1000);
  const validUntil = validFrom + 86400;

  const operators = [
    { name: 'Alice', level: PermissionLevel.Operator },
    { name: 'Bob', level: PermissionLevel.Operator },
    { name: 'Charlie', level: PermissionLevel.Administrator },
    { name: 'Dave', level: PermissionLevel.Observer },
  ];

  const operatorKeys = operators.map(() => Keypair.generate());

  const credentials = operators.map((op, i) =>
    createCredentialLeaf(
      operatorKeys[i].publicKey.toBase58(),
      robotPublicKey,
      op.level,
      validFrom,
      validUntil
    )
  );

  console.log('Creating Merkle tree with credentials:');
  operators.forEach((op, i) => {
    console.log(`  ${i + 1}. ${op.name}: Permission Level ${op.level}`);
  });
  console.log();

  const merkleTree = new MerkleTree(credentials);
  const root = merkleTree.getRoot();

  console.log(`Merkle Root: ${root.toString('hex')}`);
  console.log(`Tree has ${merkleTree.getLayerCount()} layers\n`);

  console.log('Generating proof for Alice\'s credential:');
  const aliceProof = merkleTree.getProof(credentials[0]);
  console.log(`Proof length: ${aliceProof.length} hashes`);
  aliceProof.forEach((hash, i) => {
    console.log(`  ${i + 1}. ${hash.toString('hex').substring(0, 16)}...`);
  });
  console.log();

  console.log('Verifying Alice\'s proof:');
  const isValid = MerkleTree.verify(credentials[0], aliceProof, root);
  console.log(`Proof valid: ${isValid}\n`);

  console.log('Testing invalid proof:');
  const fakeCredential = Buffer.from('fake_credential_data');
  const isInvalid = MerkleTree.verify(fakeCredential, aliceProof, root);
  console.log(`Fake credential valid: ${isInvalid}\n`);

  console.log('Storage efficiency:');
  console.log(`  Total credentials: ${credentials.length}`);
  console.log(`  On-chain storage: 32 bytes (root hash only)`);
  console.log(`  Proof size per verification: ${aliceProof.length * 32} bytes`);
  console.log(`  Total off-chain storage: ${credentials.length * 32} bytes\n`);

  console.log('=== Demo Complete ===');
}

demoMerkleTree();





