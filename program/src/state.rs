use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    pubkey::Pubkey,
    program_pack::{IsInitialized, Sealed},
    clock::UnixTimestamp,
};

#[derive(BorshSerialize, BorshDeserialize, Debug, Clone, PartialEq)]
pub enum RobotStatus {
    Offline,
    Idle,
    Active,
    Executing,
    Error,
    Maintenance,
}

#[derive(BorshSerialize, BorshDeserialize, Debug, Clone, PartialEq)]
pub enum PermissionLevel {
    None,
    Observer,
    Operator,
    Administrator,
    Owner,
}

#[derive(BorshSerialize, BorshDeserialize, Debug, Clone)]
pub struct Robot {
    pub is_initialized: bool,
    pub owner: Pubkey,
    pub authority: Pubkey,
    pub status: RobotStatus,
    pub robot_id: [u8; 32],
    pub merkle_root: [u8; 32],
    pub last_command_timestamp: UnixTimestamp,
    pub total_commands_executed: u64,
    pub active_operators: Vec<Pubkey>,
    pub max_operators: u8,
    pub emergency_stop: bool,
    pub metadata_uri: String,
}

impl Robot {
    pub const LEN: usize = 1 + 32 + 32 + 1 + 32 + 32 + 8 + 8 + (32 * 10) + 1 + 1 + 256;
    
    pub fn new(
        owner: Pubkey,
        authority: Pubkey,
        robot_id: [u8; 32],
        merkle_root: [u8; 32],
        metadata_uri: String,
    ) -> Self {
        Self {
            is_initialized: true,
            owner,
            authority,
            status: RobotStatus::Idle,
            robot_id,
            merkle_root,
            last_command_timestamp: 0,
            total_commands_executed: 0,
            active_operators: Vec::new(),
            max_operators: 10,
            emergency_stop: false,
            metadata_uri,
        }
    }
}

impl Sealed for Robot {}

impl IsInitialized for Robot {
    fn is_initialized(&self) -> bool {
        self.is_initialized
    }
}

#[derive(BorshSerialize, BorshDeserialize, Debug, Clone)]
pub struct Credential {
    pub is_initialized: bool,
    pub owner: Pubkey,
    pub robot: Pubkey,
    pub permission_level: PermissionLevel,
    pub valid_from: UnixTimestamp,
    pub valid_until: UnixTimestamp,
    pub revoked: bool,
    pub credential_hash: [u8; 32],
    pub issuer: Pubkey,
}

impl Credential {
    pub const LEN: usize = 1 + 32 + 32 + 1 + 8 + 8 + 1 + 32 + 32;
    
    pub fn new(
        owner: Pubkey,
        robot: Pubkey,
        permission_level: PermissionLevel,
        valid_from: UnixTimestamp,
        valid_until: UnixTimestamp,
        credential_hash: [u8; 32],
        issuer: Pubkey,
    ) -> Self {
        Self {
            is_initialized: true,
            owner,
            robot,
            permission_level,
            valid_from,
            valid_until,
            revoked: false,
            credential_hash,
            issuer,
        }
    }
    
    pub fn is_valid(&self, current_timestamp: UnixTimestamp) -> bool {
        !self.revoked
            && current_timestamp >= self.valid_from
            && current_timestamp <= self.valid_until
    }
}

impl Sealed for Credential {}

impl IsInitialized for Credential {
    fn is_initialized(&self) -> bool {
        self.is_initialized
    }
}

#[derive(BorshSerialize, BorshDeserialize, Debug, Clone)]
pub struct CommandLog {
    pub is_initialized: bool,
    pub robot: Pubkey,
    pub executor: Pubkey,
    pub command_type: CommandType,
    pub timestamp: UnixTimestamp,
    pub parameters: Vec<u8>,
    pub success: bool,
    pub error_code: u32,
}

impl CommandLog {
    pub const LEN: usize = 1 + 32 + 32 + 1 + 8 + 256 + 1 + 4;
}

#[derive(BorshSerialize, BorshDeserialize, Debug, Clone, PartialEq)]
pub enum CommandType {
    Move,
    Rotate,
    Grab,
    Release,
    EmergencyStop,
    Reset,
    Calibrate,
    UpdateConfig,
    Custom,
}











