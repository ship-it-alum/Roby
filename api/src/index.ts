import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { robotRoutes } from './routes/robot';
import { credentialRoutes } from './routes/credential';
import { commandRoutes } from './routes/command';
import { healthRoutes } from './routes/health';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));

app.use('/api/v1/robots', robotRoutes);
app.use('/api/v1/credentials', credentialRoutes);
app.use('/api/v1/commands', commandRoutes);
app.use('/health', healthRoutes);

app.use(errorHandler);

app.listen(port, () => {
  logger.info(`Roby API server running on port ${port}`);
});

export default app;





















