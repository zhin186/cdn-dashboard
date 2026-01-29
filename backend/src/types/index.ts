export interface QueryRequest {
  streams: string[];
  timeRange: [string, string];
  granularity?: string;
}

export interface ErrorRatePoint {
  timestamp: number;
  total_requests: number;
  error_5xx: number;
  error_rate: number;
}

export interface CountryData {
  country: string;
  country_code: string;
  requests: number;
  error_5xx: number;
  error_rate: number;
  bytes_sent: number;
}

export interface LogStream {
  name: string;
  schema: Array<{name: string; type: string}>;
}