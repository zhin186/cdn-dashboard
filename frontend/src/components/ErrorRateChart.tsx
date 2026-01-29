import { useEffect, useState } from 'react';
import axios from 'axios';
import ReactECharts from 'echarts-for-react';
import { format } from 'date-fns';
import { AlertTriangle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '';

interface Props {
  streams: string[];
  timeRange: [Date, Date];
}

export function ErrorRateChart({ streams, timeRange }: Props) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (streams.length === 0) return;
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [streams, timeRange]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/metrics/error-rate`, {
        streams,
        timeRange: [
          timeRange[0].toISOString(),
          timeRange[1].toISOString()
        ],
        granularity: '5 minute'
      });
      setData(res.data);
    } catch (err) {
      console.error('Failed to fetch error rate:', err);
    } finally {
      setLoading(false);
    }
  };

  const hasHighError = data.some(d => d.error_rate > 5);

  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: (params: any[]) => {
        const point = data[params[0].dataIndex];
        return `
          <div style="font-weight:bold">${format(point.timestamp, 'MM-dd HH:mm')}</div>
          <div>错误率: <span style="color:${point.error_rate > 5 ? 'red' : 'green'};font-weight:bold">${point.error_rate}%</span></div>
          <div>总请求: ${point.total_requests.toLocaleString()}</div>
          <div>5xx错误: ${point.error_5xx}</div>
        `;
      }
    },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: data.map(d => format(d.timestamp, 'HH:mm')),
      axisLine: { lineStyle: { color: '#ccc' } }
    },
    yAxis: [
      {
        type: 'value',
        name: '错误率(%)',
        axisLabel: { formatter: '{value}%' },
        splitLine: { lineStyle: { color: '#f0f0f0' } }
      },
      {
        type: 'value',
        name: '请求数',
        axisLabel: { formatter: (v: number) => v >= 1000 ? `${(v/1000).toFixed(1)}k` : v }
      }
    ],
    series: [
      {
        name: '错误率',
        type: 'line',
        data: data.map(d => d.error_rate),
        smooth: true,
        lineStyle: { width: 3, color: '#ef4444' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(239, 68, 68, 0.3)' },
              { offset: 1, color: 'rgba(239, 68, 68, 0.05)' }
            ]
          }
        },
        markLine: {
          silent: true,
          data: [{ yAxis: 5, lineStyle: { color: '#f59e0b', type: 'dashed' } }]
        }
      },
      {
        name: '5xx数量',
        type: 'bar',
        yAxisIndex: 1,
        data: data.map(d => d.error_5xx),
        itemStyle: { color: '#fca5a5' },
        barWidth: '40%'
      }
    ]
  };

  const avgRate = data.length 
    ? (data.reduce((a, b) => a + b.error_rate, 0) / data.length).toFixed(2)
    : '0.00';

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium flex items-center gap-2">
          5xx 错误率趋势
          {hasHighError && <AlertTriangle className="w-5 h-5 text-red-500" />}
        </h3>
        <div className="text-sm text-gray-500">
          平均: <span className={parseFloat(avgRate) > 5 ? 'text-red-600 font-bold' : 'text-green-600'}>{avgRate}%</span>
        </div>
      </div>
      {loading && !data.length ? (
        <div className="h-80 flex items-center justify-center text-gray-400">加载中...</div>
      ) : (
        <ReactECharts option={option} style={{ height: 320 }} />
      )}
    </div>
  );
}