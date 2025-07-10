import { Router, Request, Response, NextFunction } from 'express';
import { body, param } from 'express-validator';
import { PublicKey, Keypair } from '@solana/web3.js';
import { getRobyClient } from '../config';
import { validate } from '../middleware/validation';
import { apiLimiter } from '../middleware/rateLimit';
import { createError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import bs58 from 'bs58';

export const robotRoutes = Router();

robotRoutes.use(apiLimiter);

robotRoutes.get(
  '/:publicKey',
  param('publicKey').isString(),
  validate([param('publicKey')]),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const client = getRobyClient();
      const robotPubkey = new PublicKey(req.params.publicKey);
      
      const robotData = await client.getRobotData(robotPubkey);
      
      if (!robotData) {
        throw createError('Robot not found', 404, 'ROBOT_NOT_FOUND');
      }
      
      res.json({
        publicKey: robotPubkey.toBase58(),
        data: {
          owner: robotData.owner.toBase58(),
          authority: robotData.authority.toBase58(),
          status: robotData.status,
          robotId: robotData.robotId.toString('hex'),
          merkleRoot: robotData.merkleRoot.toString('hex'),
          lastCommandTimestamp: robotData.lastCommandTimestamp,
          totalCommandsExecuted: robotData.totalCommandsExecuted,
          activeOperators: robotData.activeOperators.map(op => op.toBase58()),
          maxOperators: robotData.maxOperators,
          emergencyStop: robotData.emergencyStop,
          metadataUri: robotData.metadataUri,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

robotRoutes.post(
  '/',
  body('robotId').isString(),
  body('merkleRoot').isString(),
  body('metadataUri').isString(),
  body('ownerPrivateKey').isString(),
  body('authorityPublicKey').isString(),
  validate([
    body('robotId'),
    body('merkleRoot'),
    body('metadataUri'),
    body('ownerPrivateKey'),
    body('authorityPublicKey'),
  ]),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const client = getRobyClient();
      
      const robotId = Buffer.from(req.body.robotId, 'hex');
      const merkleRoot = Buffer.from(req.body.merkleRoot, 'hex');
      const metadataUri = req.body.metadataUri;
      
      const ownerKeypair = Keypair.fromSecretKey(
        bs58.decode(req.body.ownerPrivateKey)
      );
      const authority = new PublicKey(req.body.authorityPublicKey);
      
      const result = await client.initializeRobot(
        {
          robotId,
          merkleRoot,
          metadataUri,
          owner: ownerKeypair.publicKey,
          authority,
        },
        ownerKeypair
      );
      
      logger.info('Robot initialized:', {
        robotAccount: result.robotAccount.toBase58(),
        signature: result.signature,
      });
      
      res.status(201).json({
        robotAccount: result.robotAccount.toBase58(),
        signature: result.signature,
      });
    } catch (error) {
      next(error);
    }
  }
);

robotRoutes.post(
  '/:publicKey/emergency-stop',
  param('publicKey').isString(),
  body('authorityPrivateKey').isString(),
  validate([param('publicKey'), body('authorityPrivateKey')]),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const client = getRobyClient();
      const robotPubkey = new PublicKey(req.params.publicKey);
      const authorityKeypair = Keypair.fromSecretKey(
        bs58.decode(req.body.authorityPrivateKey)
      );
      
      const signature = await client.emergencyStop(
        robotPubkey,
        authorityKeypair
      );
      
      logger.warn('Emergency stop activated:', {
        robot: robotPubkey.toBase58(),
        signature,
      });
      
      res.json({ signature });
    } catch (error) {
      next(error);
    }
  }
);

robotRoutes.post(
  '/:publicKey/resume',
  param('publicKey').isString(),
  body('authorityPrivateKey').isString(),
  validate([param('publicKey'), body('authorityPrivateKey')]),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const client = getRobyClient();
      const robotPubkey = new PublicKey(req.params.publicKey);
      const authorityKeypair = Keypair.fromSecretKey(
        bs58.decode(req.body.authorityPrivateKey)
      );
      
      const signature = await client.resume(robotPubkey, authorityKeypair);
      
      logger.info('Robot resumed:', {
        robot: robotPubkey.toBase58(),
        signature,
      });
      
      res.json({ signature });
    } catch (error) {
      next(error);
    }
  }
);

robotRoutes.get(
  '/owner/:ownerPublicKey',
  param('ownerPublicKey').isString(),
  validate([param('ownerPublicKey')]),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const client = getRobyClient();
      const ownerPubkey = new PublicKey(req.params.ownerPublicKey);
      
      const robots = await client.getRobotsByOwner(ownerPubkey);
      
      res.json({
        owner: ownerPubkey.toBase58(),
        robots: robots.map(r => r.toBase58()),
        count: robots.length,
      });
    } catch (error) {
      next(error);
    }
  }
);







