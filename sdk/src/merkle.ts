import { createHash } from 'crypto';

export class MerkleTree {
  private leaves: Buffer[];
  private layers: Buffer[][];

  constructor(leaves: Buffer[]) {
    this.leaves = leaves.map((leaf) => this.hashLeaf(leaf));
    this.layers = this.buildTree();
  }

  private hashLeaf(data: Buffer): Buffer {
    return createHash('sha256').update(data).digest();
  }

  private hashPair(a: Buffer, b: Buffer): Buffer {
    const combined = Buffer.concat([a, b].sort(Buffer.compare));
    return createHash('sha256').update(combined).digest();
  }

  private buildTree(): Buffer[][] {
    if (this.leaves.length === 0) {
      return [[]];
    }

    const layers: Buffer[][] = [this.leaves];
    let currentLayer = this.leaves;

    while (currentLayer.length > 1) {
      const nextLayer: Buffer[] = [];

      for (let i = 0; i < currentLayer.length; i += 2) {
        if (i + 1 < currentLayer.length) {
          nextLayer.push(this.hashPair(currentLayer[i], currentLayer[i + 1]));
        } else {
          nextLayer.push(currentLayer[i]);
        }
      }

      layers.push(nextLayer);
      currentLayer = nextLayer;
    }

    return layers;
  }

  getRoot(): Buffer {
    if (this.layers.length === 0 || this.layers[this.layers.length - 1].length === 0) {
      return Buffer.alloc(32);
    }
    return this.layers[this.layers.length - 1][0];
  }

  getProof(leaf: Buffer): Buffer[] {
    const hashedLeaf = this.hashLeaf(leaf);
    let index = this.leaves.findIndex((l) => l.equals(hashedLeaf));

    if (index === -1) {
      throw new Error('Leaf not found in tree');
    }

    const proof: Buffer[] = [];

    for (let i = 0; i < this.layers.length - 1; i++) {
      const layer = this.layers[i];
      const isRightNode = index % 2 === 1;
      const siblingIndex = isRightNode ? index - 1 : index + 1;

      if (siblingIndex < layer.length) {
        proof.push(layer[siblingIndex]);
      }

      index = Math.floor(index / 2);
    }

    return proof;
  }

  static verify(leaf: Buffer, proof: Buffer[], root: Buffer): boolean {
    let computedHash = createHash('sha256').update(leaf).digest();

    for (const proofElement of proof) {
      const combined = Buffer.concat(
        [computedHash, proofElement].sort(Buffer.compare)
      );
      computedHash = createHash('sha256').update(combined).digest();
    }

    return computedHash.equals(root);
  }

  getLeaves(): Buffer[] {
    return [...this.leaves];
  }

  getLayerCount(): number {
    return this.layers.length;
  }
}

export function createCredentialLeaf(
  owner: string,
  robot: string,
  permissionLevel: number,
  validFrom: number,
  validUntil: number
): Buffer {
  const data = Buffer.concat([
    Buffer.from(owner),
    Buffer.from(robot),
    Buffer.from([permissionLevel]),
    Buffer.from(validFrom.toString()),
    Buffer.from(validUntil.toString()),
  ]);
  return createHash('sha256').update(data).digest();
}







