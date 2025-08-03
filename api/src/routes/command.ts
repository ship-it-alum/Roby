import { Router, Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import { PublicKey, Keypair } from '@solana/web3.js';
import { getRobyClient } from '../config';
import { validate } from '../middleware/validation';
import { strictLimiter } from '../middleware/rateLimit';
import { logger } from '../utils/logger';
import { CommandType } from '@roby/sdk';
import bs58 from 'bs58';

export const commandRoutes = Router();

commandRoutes.use(strictLimiter);

commandRoutes.post(
  '/execute',
  body('robotPublicKey').isString(),
  body('credentialPublicKey').isString(),
  body('executorPrivateKey').isString(),
  body('commandType').isInt({ min: 0, max: 8 }),
  body('parameters').isString(),
  body('merkleProof').isArray(),
  validate([
    body('robotPublicKey'),
    body('credentialPublicKey'),
    body('executorPrivateKey'),
    body('commandType'),
    body('parameters'),
    body('merkleProof'),
  ]),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const client = getRobyClient();
      
      const robot = new PublicKey(req.body.robotPublicKey);
      const credential = new PublicKey(req.body.credentialPublicKey);
      const executorKeypair = Keypair.fromSecretKey(
        bs58.decode(req.body.executorPrivateKey)
      );
      const commandType = req.body.commandType as CommandType;
      const parameters = Buffer.from(req.body.parameters, 'hex');
      const merkleProof = req.body.merkleProof.map((p: string) =>
        Buffer.from(p, 'hex')
      );
      
      const result = await client.executeCommand(
        {
          robot,
          executor: executorKeypair.publicKey,
          credential,
          commandType,
          parameters,
          merkleProof,
        },
        executorKeypair
      );
      
      logger.info('Command executed:', {
        robot: robot.toBase58(),
        commandType,
        commandLog: result.commandLogAccount.toBase58(),
        signature: result.signature,
      });
      
      res.status(200).json({
        commandLogAccount: result.commandLogAccount.toBase58(),
        signature: result.signature,
      });
    } catch (error) {
      next(error);
    }
  }
);

















