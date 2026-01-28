import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { createClient } from 'redis';
import { OpenObserveHAClient } from './services/o2-ha-client';
import { dashboardRouter } from './routes/dashboard';
import { healthRouter } from './routes/health';

const app = express();
const PORT = process.env.PORT || 3000;

// HA Client 初始化
const o2Client = new OpenObserveHAClient({
  nodes: (process.env.O2_NODES || '').split(',').filter(Boolean),
  timeout: 30000
});

const redisClient = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
redisClient.connect();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(compression());
app.use(express.json());

// 依赖注入
app.use((req, res, next) => {
  req.o2Client = o2Client;
  req.redis = redisClient;
  next();
});

app.use('/api', dashboardRouter);
app.use('/health', healthRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`O2 Nodes: ${process.env.O2_NODES}`);
});