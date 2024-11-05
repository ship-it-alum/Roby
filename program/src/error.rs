use solana_program::program_error::ProgramError;
use thiserror::Error;

#[derive(Error, Debug, Copy, Clone)]
pub enum RobyError {
    #[error("Invalid Instruction")]
    InvalidInstruction,
    
    #[error("Not Authorized")]
    NotAuthorized,
    
    #[error("Already Initialized")]
    AlreadyInitialized,
    
    #[error("Uninitialized Account")]
    UninitializedAccount,
    
    #[error("Invalid Merkle Proof")]
    InvalidMerkleProof,
    
    #[error("Robot Already Active")]
    RobotAlreadyActive,
    
    #[error("Robot Not Active")]
    RobotNotActive,
    
    #[error("Invalid Robot State")]
    InvalidRobotState,
    
    #[error("Permission Denied")]
    PermissionDenied,
    
    #[error("Invalid Credential")]
    InvalidCredential,
    
    #[error("Command Execution Failed")]
    CommandExecutionFailed,
    
    #[error("Invalid Account Data")]
    InvalidAccountData,
    
    #[error("Arithmetic Overflow")]
    ArithmeticOverflow,
    
    #[error("Invalid Control Authority")]
    InvalidControlAuthority,
    
    #[error("Robot Offline")]
    RobotOffline,
}

impl From<RobyError> for ProgramError {
    fn from(e: RobyError) -> Self {
        ProgramError::Custom(e as u32)
    }
}



