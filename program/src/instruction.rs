use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    program_error::ProgramError,
    pubkey::Pubkey,
    clock::UnixTimestamp,
};

use crate::state::{PermissionLevel, CommandType};

#[derive(BorshSerialize, BorshDeserialize, Debug, Clone)]
pub enum RobyInstruction {
    InitializeRobot {
        robot_id: [u8; 32],
        merkle_root: [u8; 32],
        metadata_uri: String,
    },
    
    IssueCredential {
        permission_level: PermissionLevel,
        valid_from: UnixTimestamp,
        valid_until: UnixTimestamp,
        credential_hash: [u8; 32],
    },
    
    RevokeCredential,
    
    ExecuteCommand {
        command_type: CommandType,
        parameters: Vec<u8>,
        merkle_proof: Vec<[u8; 32]>,
    },
    
    UpdateMerkleRoot {
        new_merkle_root: [u8; 32],
    },
    
    TransferAuthority {
        new_authority: Pubkey,
    },
    
    AddOperator {
        operator: Pubkey,
    },
    
    RemoveOperator {
        operator: Pubkey,
    },
    
    EmergencyStop,
    
    Resume,
    
    UpdateRobotStatus {
        status: u8,
    },
    
    TransferOwnership {
        new_owner: Pubkey,
    },
}

impl RobyInstruction {
    pub fn unpack(input: &[u8]) -> Result<Self, ProgramError> {
        Self::try_from_slice(input).map_err(|_| ProgramError::InvalidInstructionData)
    }
    
    pub fn pack(&self) -> Vec<u8> {
        self.try_to_vec().expect("pack")
    }
}





