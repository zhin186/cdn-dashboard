import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import dashboardRoutes from './routes/dashboard';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));

app.use('/api', dashboardRoutes);

app.listen(PORT, () => {
  console.log(`CDN Analytics Backend running on port ${PORT}`);
  console.log(`OpenObserve URL: ${process.env.O2_URL}`);
  console.log(`Organization: ${process.env.O2_ORG}`);
});