import axios, { AxiosInstance } from 'axios';
import * as http from 'http';
import * as https from 'https';

export class OpenObserveClient {
  private client: AxiosInstance;
  
  constructor() {
    const baseURL = process.env.O2_URL || 'http://openobserve-router.openobserve.svc.cluster.local:5080';
    
    this.client = axios.create({
      baseURL: `${baseURL}/api/${process.env.O2_ORG || 'default'}`,
      timeout: 120000,
      headers: {
        'Authorization': `Basic ${Buffer.from(
          `${process.env.O2_USER || 'root@example.com'}:${process.env.O2_PASS || 'Complexpass#123'}`
        ).toString('base64')}`,
        'Content-Type': 'application/json'
      },
      httpAgent: new http.Agent({
        keepAlive: true,
        maxSockets: 20,
        keepAliveMsecs: 30000
      })
    });
  }

  async query(sql: string): Promise<any> {
    try {
      const response = await this.client.post('/_search?type=logs&sql=true', {
        query: { sql, from: 0, size: 10000 }
      });
      return response.data;
    } catch (error: any) {
      console.error('O2 Query Error:', error.message);
      throw error;
    }
  }

  async getStreams(): Promise<any> {
    try {
      const response = await this.client.get('/streams?type=logs');
      return response.data;
    } catch (error: any) {
      console.error('Get Streams Error:', error.message);
      throw error;
    }
  }
}