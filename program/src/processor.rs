use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint::ProgramResult,
    msg,
    program_error::ProgramError,
    program_pack::IsInitialized,
    pubkey::Pubkey,
    rent::Rent,
    sysvar::Sysvar,
    clock::Clock,
};

use crate::{
    error::RobyError,
    instruction::RobyInstruction,
    state::{Robot, Credential, CommandLog, RobotStatus, PermissionLevel, CommandType},
    merkle::MerkleProof,
};

pub struct Processor;

impl Processor {
    pub fn process(
        program_id: &Pubkey,
        accounts: &[AccountInfo],
        instruction_data: &[u8],
    ) -> ProgramResult {
        let instruction = RobyInstruction::unpack(instruction_data)?;
        
        match instruction {
            RobyInstruction::InitializeRobot {
                robot_id,
                merkle_root,
                metadata_uri,
            } => {
                msg!("Instruction: InitializeRobot");
                Self::process_initialize_robot(
                    accounts,
                    program_id,
                    robot_id,
                    merkle_root,
                    metadata_uri,
                )
            }
            RobyInstruction::IssueCredential {
                permission_level,
                valid_from,
                valid_until,
                credential_hash,
            } => {
                msg!("Instruction: IssueCredential");
                Self::process_issue_credential(
                    accounts,
                    program_id,
                    permission_level,
                    valid_from,
                    valid_until,
                    credential_hash,
                )
            }
            RobyInstruction::RevokeCredential => {
                msg!("Instruction: RevokeCredential");
                Self::process_revoke_credential(accounts, program_id)
            }
            RobyInstruction::ExecuteCommand {
                command_type,
                parameters,
                merkle_proof,
            } => {
                msg!("Instruction: ExecuteCommand");
                Self::process_execute_command(
                    accounts,
                    program_id,
                    command_type,
                    parameters,
                    merkle_proof,
                )
            }
            RobyInstruction::UpdateMerkleRoot { new_merkle_root } => {
                msg!("Instruction: UpdateMerkleRoot");
                Self::process_update_merkle_root(accounts, program_id, new_merkle_root)
            }
            RobyInstruction::TransferAuthority { new_authority } => {
                msg!("Instruction: TransferAuthority");
                Self::process_transfer_authority(accounts, program_id, new_authority)
            }
            RobyInstruction::AddOperator { operator } => {
                msg!("Instruction: AddOperator");
                Self::process_add_operator(accounts, program_id, operator)
            }
            RobyInstruction::RemoveOperator { operator } => {
                msg!("Instruction: RemoveOperator");
                Self::process_remove_operator(accounts, program_id, operator)
            }
            RobyInstruction::EmergencyStop => {
                msg!("Instruction: EmergencyStop");
                Self::process_emergency_stop(accounts, program_id)
            }
            RobyInstruction::Resume => {
                msg!("Instruction: Resume");
                Self::process_resume(accounts, program_id)
            }
            RobyInstruction::UpdateRobotStatus { status } => {
                msg!("Instruction: UpdateRobotStatus");
                Self::process_update_robot_status(accounts, program_id, status)
            }
            RobyInstruction::TransferOwnership { new_owner } => {
                msg!("Instruction: TransferOwnership");
                Self::process_transfer_ownership(accounts, program_id, new_owner)
            }
        }
    }
    
    fn process_initialize_robot(
        accounts: &[AccountInfo],
        program_id: &Pubkey,
        robot_id: [u8; 32],
        merkle_root: [u8; 32],
        metadata_uri: String,
    ) -> ProgramResult {
        let account_info_iter = &mut accounts.iter();
        let robot_account = next_account_info(account_info_iter)?;
        let owner_account = next_account_info(account_info_iter)?;
        let authority_account = next_account_info(account_info_iter)?;
        let rent_sysvar = next_account_info(account_info_iter)?;
        
        if robot_account.owner != program_id {
            return Err(ProgramError::IncorrectProgramId);
        }
        
        if !owner_account.is_signer {
            return Err(RobyError::NotAuthorized.into());
        }
        
        let rent = Rent::from_account_info(rent_sysvar)?;
        if !rent.is_exempt(robot_account.lamports(), robot_account.data_len()) {
            return Err(ProgramError::AccountNotRentExempt);
        }
        
        let mut robot_data = Robot::try_from_slice(&robot_account.data.borrow())?;
        if robot_data.is_initialized() {
            return Err(RobyError::AlreadyInitialized.into());
        }
        
        robot_data = Robot::new(
            *owner_account.key,
            *authority_account.key,
            robot_id,
            merkle_root,
            metadata_uri,
        );
        
        robot_data.serialize(&mut &mut robot_account.data.borrow_mut()[..])?;
        
        msg!("Robot initialized with ID: {:?}", robot_id);
        Ok(())
    }
    
    fn process_issue_credential(
        accounts: &[AccountInfo],
        program_id: &Pubkey,
        permission_level: PermissionLevel,
        valid_from: i64,
        valid_until: i64,
        credential_hash: [u8; 32],
    ) -> ProgramResult {
        let account_info_iter = &mut accounts.iter();
        let credential_account = next_account_info(account_info_iter)?;
        let robot_account = next_account_info(account_info_iter)?;
        let issuer_account = next_account_info(account_info_iter)?;
        let recipient_account = next_account_info(account_info_iter)?;
        let rent_sysvar = next_account_info(account_info_iter)?;
        
        if credential_account.owner != program_id || robot_account.owner != program_id {
            return Err(ProgramError::IncorrectProgramId);
        }
        
        if !issuer_account.is_signer {
            return Err(RobyError::NotAuthorized.into());
        }
        
        let robot_data = Robot::try_from_slice(&robot_account.data.borrow())?;
        if !robot_data.is_initialized() {
            return Err(RobyError::UninitializedAccount.into());
        }
        
        if robot_data.authority != *issuer_account.key && robot_data.owner != *issuer_account.key {
            return Err(RobyError::NotAuthorized.into());
        }
        
        let rent = Rent::from_account_info(rent_sysvar)?;
        if !rent.is_exempt(credential_account.lamports(), credential_account.data_len()) {
            return Err(ProgramError::AccountNotRentExempt);
        }
        
        let credential = Credential::new(
            *recipient_account.key,
            *robot_account.key,
            permission_level,
            valid_from,
            valid_until,
            credential_hash,
            *issuer_account.key,
        );
        
        credential.serialize(&mut &mut credential_account.data.borrow_mut()[..])?;
        
        msg!("Credential issued to: {}", recipient_account.key);
        Ok(())
    }
    
    fn process_revoke_credential(
        accounts: &[AccountInfo],
        program_id: &Pubkey,
    ) -> ProgramResult {
        let account_info_iter = &mut accounts.iter();
        let credential_account = next_account_info(account_info_iter)?;
        let authority_account = next_account_info(account_info_iter)?;
        let robot_account = next_account_info(account_info_iter)?;
        
        if credential_account.owner != program_id || robot_account.owner != program_id {
            return Err(ProgramError::IncorrectProgramId);
        }
        
        if !authority_account.is_signer {
            return Err(RobyError::NotAuthorized.into());
        }
        
        let robot_data = Robot::try_from_slice(&robot_account.data.borrow())?;
        if robot_data.authority != *authority_account.key && robot_data.owner != *authority_account.key {
            return Err(RobyError::NotAuthorized.into());
        }
        
        let mut credential_data = Credential::try_from_slice(&credential_account.data.borrow())?;
        if !credential_data.is_initialized() {
            return Err(RobyError::UninitializedAccount.into());
        }
        
        credential_data.revoked = true;
        credential_data.serialize(&mut &mut credential_account.data.borrow_mut()[..])?;
        
        msg!("Credential revoked");
        Ok(())
    }
    
    fn process_execute_command(
        accounts: &[AccountInfo],
        program_id: &Pubkey,
        command_type: CommandType,
        parameters: Vec<u8>,
        merkle_proof: Vec<[u8; 32]>,
    ) -> ProgramResult {
        let account_info_iter = &mut accounts.iter();
        let robot_account = next_account_info(account_info_iter)?;
        let executor_account = next_account_info(account_info_iter)?;
        let credential_account = next_account_info(account_info_iter)?;
        let command_log_account = next_account_info(account_info_iter)?;
        let clock_sysvar = next_account_info(account_info_iter)?;
        
        if robot_account.owner != program_id {
            return Err(ProgramError::IncorrectProgramId);
        }
        
        if !executor_account.is_signer {
            return Err(RobyError::NotAuthorized.into());
        }
        
        let mut robot_data = Robot::try_from_slice(&robot_account.data.borrow())?;
        if !robot_data.is_initialized() {
            return Err(RobyError::UninitializedAccount.into());
        }
        
        if robot_data.emergency_stop {
            return Err(RobyError::RobotNotActive.into());
        }
        
        let credential_data = Credential::try_from_slice(&credential_account.data.borrow())?;
        if !credential_data.is_initialized() {
            return Err(RobyError::InvalidCredential.into());
        }
        
        let clock = Clock::from_account_info(clock_sysvar)?;
        if !credential_data.is_valid(clock.unix_timestamp) {
            return Err(RobyError::InvalidCredential.into());
        }
        
        if credential_data.owner != *executor_account.key {
            return Err(RobyError::PermissionDenied.into());
        }
        
        let proof = MerkleProof {
            proof: merkle_proof,
            leaf: credential_data.credential_hash,
        };
        
        if !proof.verify(&robot_data.merkle_root) {
            return Err(RobyError::InvalidMerkleProof.into());
        }
        
        match credential_data.permission_level {
            PermissionLevel::None | PermissionLevel::Observer => {
                return Err(RobyError::PermissionDenied.into());
            }
            _ => {}
        }
        
        robot_data.status = RobotStatus::Executing;
        robot_data.last_command_timestamp = clock.unix_timestamp;
        robot_data.total_commands_executed = robot_data
            .total_commands_executed
            .checked_add(1)
            .ok_or(RobyError::ArithmeticOverflow)?;
        
        robot_data.serialize(&mut &mut robot_account.data.borrow_mut()[..])?;
        
        let command_log = CommandLog {
            is_initialized: true,
            robot: *robot_account.key,
            executor: *executor_account.key,
            command_type,
            timestamp: clock.unix_timestamp,
            parameters,
            success: true,
            error_code: 0,
        };
        
        if command_log_account.data_len() >= CommandLog::LEN {
            command_log.serialize(&mut &mut command_log_account.data.borrow_mut()[..])?;
        }
        
        msg!("Command executed successfully");
        Ok(())
    }
    
    fn process_update_merkle_root(
        accounts: &[AccountInfo],
        program_id: &Pubkey,
        new_merkle_root: [u8; 32],
    ) -> ProgramResult {
        let account_info_iter = &mut accounts.iter();
        let robot_account = next_account_info(account_info_iter)?;
        let authority_account = next_account_info(account_info_iter)?;
        
        if robot_account.owner != program_id {
            return Err(ProgramError::IncorrectProgramId);
        }
        
        if !authority_account.is_signer {
            return Err(RobyError::NotAuthorized.into());
        }
        
        let mut robot_data = Robot::try_from_slice(&robot_account.data.borrow())?;
        if !robot_data.is_initialized() {
            return Err(RobyError::UninitializedAccount.into());
        }
        
        if robot_data.authority != *authority_account.key {
            return Err(RobyError::NotAuthorized.into());
        }
        
        robot_data.merkle_root = new_merkle_root;
        robot_data.serialize(&mut &mut robot_account.data.borrow_mut()[..])?;
        
        msg!("Merkle root updated");
        Ok(())
    }
    
    fn process_transfer_authority(
        accounts: &[AccountInfo],
        program_id: &Pubkey,
        new_authority: Pubkey,
    ) -> ProgramResult {
        let account_info_iter = &mut accounts.iter();
        let robot_account = next_account_info(account_info_iter)?;
        let current_authority_account = next_account_info(account_info_iter)?;
        
        if robot_account.owner != program_id {
            return Err(ProgramError::IncorrectProgramId);
        }
        
        if !current_authority_account.is_signer {
            return Err(RobyError::NotAuthorized.into());
        }
        
        let mut robot_data = Robot::try_from_slice(&robot_account.data.borrow())?;
        if robot_data.authority != *current_authority_account.key {
            return Err(RobyError::NotAuthorized.into());
        }
        
        robot_data.authority = new_authority;
        robot_data.serialize(&mut &mut robot_account.data.borrow_mut()[..])?;
        
        msg!("Authority transferred to: {}", new_authority);
        Ok(())
    }
    
    fn process_add_operator(
        accounts: &[AccountInfo],
        program_id: &Pubkey,
        operator: Pubkey,
    ) -> ProgramResult {
        let account_info_iter = &mut accounts.iter();
        let robot_account = next_account_info(account_info_iter)?;
        let authority_account = next_account_info(account_info_iter)?;
        
        if robot_account.owner != program_id {
            return Err(ProgramError::IncorrectProgramId);
        }
        
        if !authority_account.is_signer {
            return Err(RobyError::NotAuthorized.into());
        }
        
        let mut robot_data = Robot::try_from_slice(&robot_account.data.borrow())?;
        if robot_data.authority != *authority_account.key {
            return Err(RobyError::NotAuthorized.into());
        }
        
        if robot_data.active_operators.len() >= robot_data.max_operators as usize {
            return Err(RobyError::InvalidRobotState.into());
        }
        
        if !robot_data.active_operators.contains(&operator) {
            robot_data.active_operators.push(operator);
        }
        
        robot_data.serialize(&mut &mut robot_account.data.borrow_mut()[..])?;
        
        msg!("Operator added: {}", operator);
        Ok(())
    }
    
    fn process_remove_operator(
        accounts: &[AccountInfo],
        program_id: &Pubkey,
        operator: Pubkey,
    ) -> ProgramResult {
        let account_info_iter = &mut accounts.iter();
        let robot_account = next_account_info(account_info_iter)?;
        let authority_account = next_account_info(account_info_iter)?;
        
        if robot_account.owner != program_id {
            return Err(ProgramError::IncorrectProgramId);
        }
        
        if !authority_account.is_signer {
            return Err(RobyError::NotAuthorized.into());
        }
        
        let mut robot_data = Robot::try_from_slice(&robot_account.data.borrow())?;
        if robot_data.authority != *authority_account.key {
            return Err(RobyError::NotAuthorized.into());
        }
        
        robot_data.active_operators.retain(|&x| x != operator);
        robot_data.serialize(&mut &mut robot_account.data.borrow_mut()[..])?;
        
        msg!("Operator removed: {}", operator);
        Ok(())
    }
    
    fn process_emergency_stop(
        accounts: &[AccountInfo],
        program_id: &Pubkey,
    ) -> ProgramResult {
        let account_info_iter = &mut accounts.iter();
        let robot_account = next_account_info(account_info_iter)?;
        let authority_account = next_account_info(account_info_iter)?;
        
        if robot_account.owner != program_id {
            return Err(ProgramError::IncorrectProgramId);
        }
        
        if !authority_account.is_signer {
            return Err(RobyError::NotAuthorized.into());
        }
        
        let mut robot_data = Robot::try_from_slice(&robot_account.data.borrow())?;
        
        robot_data.emergency_stop = true;
        robot_data.status = RobotStatus::Error;
        robot_data.serialize(&mut &mut robot_account.data.borrow_mut()[..])?;
        
        msg!("Emergency stop activated");
        Ok(())
    }
    
    fn process_resume(
        accounts: &[AccountInfo],
        program_id: &Pubkey,
    ) -> ProgramResult {
        let account_info_iter = &mut accounts.iter();
        let robot_account = next_account_info(account_info_iter)?;
        let authority_account = next_account_info(account_info_iter)?;
        
        if robot_account.owner != program_id {
            return Err(ProgramError::IncorrectProgramId);
        }
        
        if !authority_account.is_signer {
            return Err(RobyError::NotAuthorized.into());
        }
        
        let mut robot_data = Robot::try_from_slice(&robot_account.data.borrow())?;
        if robot_data.authority != *authority_account.key {
            return Err(RobyError::NotAuthorized.into());
        }
        
        robot_data.emergency_stop = false;
        robot_data.status = RobotStatus::Idle;
        robot_data.serialize(&mut &mut robot_account.data.borrow_mut()[..])?;
        
        msg!("Robot resumed");
        Ok(())
    }
    
    fn process_update_robot_status(
        accounts: &[AccountInfo],
        program_id: &Pubkey,
        status: u8,
    ) -> ProgramResult {
        let account_info_iter = &mut accounts.iter();
        let robot_account = next_account_info(account_info_iter)?;
        let authority_account = next_account_info(account_info_iter)?;
        
        if robot_account.owner != program_id {
            return Err(ProgramError::IncorrectProgramId);
        }
        
        if !authority_account.is_signer {
            return Err(RobyError::NotAuthorized.into());
        }
        
        let mut robot_data = Robot::try_from_slice(&robot_account.data.borrow())?;
        if robot_data.authority != *authority_account.key {
            return Err(RobyError::NotAuthorized.into());
        }
        
        robot_data.status = match status {
            0 => RobotStatus::Offline,
            1 => RobotStatus::Idle,
            2 => RobotStatus::Active,
            3 => RobotStatus::Executing,
            4 => RobotStatus::Error,
            5 => RobotStatus::Maintenance,
            _ => return Err(RobyError::InvalidRobotState.into()),
        };
        
        robot_data.serialize(&mut &mut robot_account.data.borrow_mut()[..])?;
        
        msg!("Robot status updated");
        Ok(())
    }
    
    fn process_transfer_ownership(
        accounts: &[AccountInfo],
        program_id: &Pubkey,
        new_owner: Pubkey,
    ) -> ProgramResult {
        let account_info_iter = &mut accounts.iter();
        let robot_account = next_account_info(account_info_iter)?;
        let current_owner_account = next_account_info(account_info_iter)?;
        
        if robot_account.owner != program_id {
            return Err(ProgramError::IncorrectProgramId);
        }
        
        if !current_owner_account.is_signer {
            return Err(RobyError::NotAuthorized.into());
        }
        
        let mut robot_data = Robot::try_from_slice(&robot_account.data.borrow())?;
        if robot_data.owner != *current_owner_account.key {
            return Err(RobyError::NotAuthorized.into());
        }
        
        robot_data.owner = new_owner;
        robot_data.serialize(&mut &mut robot_account.data.borrow_mut()[..])?;
        
        msg!("Ownership transferred to: {}", new_owner);
        Ok(())
    }
}















