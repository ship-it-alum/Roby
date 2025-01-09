import { Router, Request, Response, NextFunction } from 'express';
import { body, param } from 'express-validator';
import { PublicKey, Keypair } from '@solana/web3.js';
import { getRobyClient } from '../config';
import { validate } from '../middleware/validation';
import { apiLimiter } from '../middleware/rateLimit';
import { createError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { PermissionLevel } from '@roby/sdk';
import bs58 from 'bs58';

export const credentialRoutes = Router();

credentialRoutes.use(apiLimiter);

credentialRoutes.get(
  '/:publicKey',
  param('publicKey').isString(),
  validate([param('publicKey')]),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const client = getRobyClient();
      const credentialPubkey = new PublicKey(req.params.publicKey);
      
      const credentialData = await client.getCredentialData(credentialPubkey);
      
      if (!credentialData) {
        throw createError('Credential not found', 404, 'CREDENTIAL_NOT_FOUND');
      }
      
      res.json({
        publicKey: credentialPubkey.toBase58(),
        data: {
          owner: credentialData.owner.toBase58(),
          robot: credentialData.robot.toBase58(),
          permissionLevel: credentialData.permissionLevel,
          validFrom: credentialData.validFrom,
          validUntil: credentialData.validUntil,
          revoked: credentialData.revoked,
          credentialHash: credentialData.credentialHash.toString('hex'),
          issuer: credentialData.issuer.toBase58(),
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

credentialRoutes.post(
  '/',
  body('recipientPublicKey').isString(),
  body('robotPublicKey').isString(),
  body('permissionLevel').isInt({ min: 0, max: 4 }),
  body('validFrom').isInt(),
  body('validUntil').isInt(),
  body('credentialHash').isString(),
  body('issuerPrivateKey').isString(),
  validate([
    body('recipientPublicKey'),
    body('robotPublicKey'),
    body('permissionLevel'),
    body('validFrom'),
    body('validUntil'),
    body('credentialHash'),
    body('issuerPrivateKey'),
  ]),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const client = getRobyClient();
      
      const recipient = new PublicKey(req.body.recipientPublicKey);
      const robot = new PublicKey(req.body.robotPublicKey);
      const permissionLevel = req.body.permissionLevel as PermissionLevel;
      const validFrom = req.body.validFrom;
      const validUntil = req.body.validUntil;
      const credentialHash = Buffer.from(req.body.credentialHash, 'hex');
      const issuerKeypair = Keypair.fromSecretKey(
        bs58.decode(req.body.issuerPrivateKey)
      );
      
      const result = await client.issueCredential(
        {
          recipient,
          robot,
          permissionLevel,
          validFrom,
          validUntil,
          credentialHash,
          issuer: issuerKeypair.publicKey,
        },
        issuerKeypair
      );
      
      logger.info('Credential issued:', {
        credentialAccount: result.credentialAccount.toBase58(),
        signature: result.signature,
      });
      
      res.status(201).json({
        credentialAccount: result.credentialAccount.toBase58(),
        signature: result.signature,
      });
    } catch (error) {
      next(error);
    }
  }
);

credentialRoutes.post(
  '/:publicKey/revoke',
  param('publicKey').isString(),
  body('robotPublicKey').isString(),
  body('authorityPrivateKey').isString(),
  validate([
    param('publicKey'),
    body('robotPublicKey'),
    body('authorityPrivateKey'),
  ]),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const client = getRobyClient();
      const credentialPubkey = new PublicKey(req.params.publicKey);
      const robotPubkey = new PublicKey(req.body.robotPublicKey);
      const authorityKeypair = Keypair.fromSecretKey(
        bs58.decode(req.body.authorityPrivateKey)
      );
      
      const signature = await client.revokeCredential(
        credentialPubkey,
        robotPubkey,
        authorityKeypair
      );
      
      logger.info('Credential revoked:', {
        credential: credentialPubkey.toBase58(),
        signature,
      });
      
      res.json({ signature });
    } catch (error) {
      next(error);
    }
  }
);









