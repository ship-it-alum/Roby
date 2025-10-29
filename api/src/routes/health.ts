import { Router, Request, Response } from 'express';
import { getConnection } from '../config';

export const healthRoutes = Router();

healthRoutes.get('/', async (req: Request, res: Response) => {
  try {
    const connection = getConnection();
    const blockHeight = await connection.getBlockHeight();
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      solana: {
        connected: true,
        blockHeight,
      },
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: (error as Error).message,
    });
  }
});





