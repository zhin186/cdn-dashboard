import { Router, Request, Response } from 'express';
import { OpenObserveClient } from '../services/o2-client';
import { QueryBuilder } from '../services/query-builder';

const router = Router();
const o2Client = new OpenObserveClient();
const queryBuilder = new QueryBuilder();

// 获取数据流列表
router.get('/streams', async (req: Request, res: Response) => {
  try {
    const data = await o2Client.getStreams();
    const streams = data.list.map((s: any) => ({
      name: s.name,
      schema: s.schema || []
    }));
    res.json(streams);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch streams' });
  }
});

// 5xx错误率趋势
router.post('/metrics/error-rate', async (req: Request, res: Response) => {
  try {
    const { streams, timeRange, granularity } = req.body;
    const sql = queryBuilder.buildErrorRateSQL({ streams, timeRange, granularity });
    const result = await o2Client.query(sql);
    
    const processed = result.hits?.records?.map((r: any) => ({
      timestamp: new Date(r.timestamp).getTime(),
      total_requests: parseInt(r.total_requests) || 0,
      error_5xx: parseInt(r.error_5xx) || 0,
      error_rate: parseFloat(r.error_rate) || 0
    })) || [];
    
    res.json(processed);
  } catch (error: any) {
    console.error('Error rate query failed:', error);
    res.status(500).json({ error: error.message });
  }
});

// 国家分布
router.post('/metrics/countries', async (req: Request, res: Response) => {
  try {
    const { streams, timeRange } = req.body;
    const sql = queryBuilder.buildCountrySQL({ streams, timeRange });
    const result = await o2Client.query(sql);
    
    const processed = result.hits?.records?.map((r: any) => ({
      country: r.country,
      country_code: r.country_code,
      requests: parseInt(r.requests) || 0,
      error_5xx: parseInt(r.error_5xx) || 0,
      error_rate: parseFloat(r.error_rate) || 0,
      bytes_sent: parseInt(r.bytes_sent) || 0
    })) || [];
    
    res.json(processed);
  } catch (error: any) {
    console.error('Country query failed:', error);
    res.status(500).json({ error: error.message });
  }
});

// 健康检查
router.get('/health', async (req: Request, res: Response) => {
  try {
    await o2Client.getStreams();
    res.json({ status: 'ok', o2_connected: true });
  } catch (error) {
    res.status(503).json({ status: 'error', o2_connected: false });
  }
});

export default router;