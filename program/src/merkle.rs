use solana_program::keccak;

pub struct MerkleProof {
    pub proof: Vec<[u8; 32]>,
    pub leaf: [u8; 32],
}

impl MerkleProof {
    pub fn verify(&self, root: &[u8; 32]) -> bool {
        let mut computed_hash = self.leaf;
        
        for proof_element in self.proof.iter() {
            computed_hash = if computed_hash <= *proof_element {
                hash_pair(&computed_hash, proof_element)
            } else {
                hash_pair(proof_element, &computed_hash)
            };
        }
        
        &computed_hash == root
    }
}

pub fn hash_leaf(data: &[u8]) -> [u8; 32] {
    keccak::hash(data).to_bytes()
}

pub fn hash_pair(a: &[u8; 32], b: &[u8; 32]) -> [u8; 32] {
    let mut combined = [0u8; 64];
    combined[..32].copy_from_slice(a);
    combined[32..].copy_from_slice(b);
    keccak::hash(&combined).to_bytes()
}

pub fn compute_merkle_root(leaves: &[[u8; 32]]) -> [u8; 32] {
    if leaves.is_empty() {
        return [0u8; 32];
    }
    
    if leaves.len() == 1 {
        return leaves[0];
    }
    
    let mut current_level = leaves.to_vec();
    
    while current_level.len() > 1 {
        let mut next_level = Vec::new();
        
        for i in (0..current_level.len()).step_by(2) {
            if i + 1 < current_level.len() {
                next_level.push(hash_pair(&current_level[i], &current_level[i + 1]));
            } else {
                next_level.push(current_level[i]);
            }
        }
        
        current_level = next_level;
    }
    
    current_level[0]
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_merkle_proof_verification() {
        let leaf1 = hash_leaf(b"credential_1");
        let leaf2 = hash_leaf(b"credential_2");
        let leaf3 = hash_leaf(b"credential_3");
        let leaf4 = hash_leaf(b"credential_4");
        
        let leaves = vec![leaf1, leaf2, leaf3, leaf4];
        let root = compute_merkle_root(&leaves);
        
        let proof_for_leaf1 = vec![
            leaf2,
            hash_pair(&leaf3, &leaf4),
        ];
        
        let merkle_proof = MerkleProof {
            proof: proof_for_leaf1,
            leaf: leaf1,
        };
        
        assert!(merkle_proof.verify(&root));
    }
    
    #[test]
    fn test_invalid_proof() {
        let leaf1 = hash_leaf(b"credential_1");
        let leaf2 = hash_leaf(b"credential_2");
        
        let leaves = vec![leaf1, leaf2];
        let root = compute_merkle_root(&leaves);
        
        let wrong_proof = vec![hash_leaf(b"wrong")];
        let merkle_proof = MerkleProof {
            proof: wrong_proof,
            leaf: leaf1,
        };
        
        assert!(!merkle_proof.verify(&root));
    }
}



