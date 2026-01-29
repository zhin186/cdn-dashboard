import { QueryRequest } from '../types';

export class QueryBuilder {
  buildErrorRateSQL(req: QueryRequest): string {
    const { streams, timeRange, granularity = '5 minute' } = req;
    
    if (streams.length === 0) throw new Error('No streams selected');
    
    const fromClause = streams.length === 1 
      ? streams[0] 
      : streams.map(s => `SELECT * FROM ${s}`).join(' UNION ALL ');
    
    return `
      SELECT 
        histogram(_timestamp, '${granularity}') as timestamp,
        COUNT(*) as total_requests,
        COUNT(CASE WHEN statuscode >= 500 THEN 1 END) as error_5xx,
        ROUND(
          COUNT(CASE WHEN statuscode >= 500 THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0), 
          2
        ) as error_rate
      FROM (${fromClause})
      WHERE _timestamp >= '${timeRange[0]}' AND _timestamp <= '${timeRange[1]}'
      GROUP BY timestamp
      ORDER BY timestamp ASC
    `;
  }

  buildCountrySQL(req: QueryRequest): string {
    const { streams, timeRange } = req;
    
    const fromClause = streams.length === 1 
      ? streams[0] 
      : streams.map(s => `SELECT * FROM ${s}`).join(' UNION ALL ');
    
    return `
      SELECT 
        country as country,
        country as country_code,
        COUNT(*) as requests,
        COUNT(CASE WHEN statuscode >= 500 THEN 1 END) as error_5xx,
        ROUND(
          COUNT(CASE WHEN statuscode >= 500 THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0), 
          2
        ) as error_rate,
        SUM(COALESCE(bytes_sent, 0)) as bytes_sent
      FROM (${fromClause})
      WHERE _timestamp >= '${timeRange[0]}' AND _timestamp <= '${timeRange[1]}'
        AND country IS NOT NULL 
        AND country != ''
      GROUP BY country
      ORDER BY requests DESC
      LIMIT 50
    `;
  }
}