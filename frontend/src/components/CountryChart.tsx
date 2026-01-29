import { useEffect, useState } from 'react';
import axios from 'axios';
import ReactECharts from 'echarts-for-react';
import { Globe } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '';

interface Props {
  streams: string[];
  timeRange: [Date, Date];
}

export function CountryChart({ streams, timeRange }: Props) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (streams.length === 0) return;
    fetchData();
  }, [streams, timeRange]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/metrics/countries`, {
        streams,
        timeRange: [
          timeRange[0].toISOString(),
          timeRange[1].toISOString()
        ]
      });
      setData(res.data);
    } catch (err) {
      console.error('Failed to fetch countries:', err);
    } finally {
      setLoading(false);
    }
  };

  const pieOption = {
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        const item = data[params.dataIndex];
        return `
          <div style="font-weight:bold">${item.country}</div>
          <div>请求数: ${item.requests.toLocaleString()}</div>
          <div>占比: ${params.percent}%</div>
          <div style="color:${item.error_rate > 5 ? 'red' : 'green'}">5xx率: ${item.error_rate}%</div>
        `;
      }
    },
    legend: {
      type: 'scroll',
      orient: 'vertical',
      right: 10,
      top: 20,
      bottom: 20,
      data: data.map(d => d.country).slice(0, 10)
    },
    series: [
      {
        name: '请求分布',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['35%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: { show: false },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        data: data.slice(0, 10).map(d => ({
          value: d.requests,
          name: d.country,
          itemStyle: { color: d.error_rate > 5 ? '#ef4444' : undefined }
        }))
      }
    ]
  };

  return (
    <div className="card">
      <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
        <Globe className="w-5 h-5" />
        请求源国家分布 (Top 10)
      </h3>
      {loading && !data.length ? (
        <div className="h-80 flex items-center justify-center text-gray-400">加载中...</div>
      ) : (
        <ReactECharts option={pieOption} style={{ height: 320 }} />
      )}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">国家</th>
              <th className="px-4 py-2 text-right">请求数</th>
              <th className="px-4 py-2 text-right">5xx率</th>
            </tr>
          </thead>
          <tbody>
            {data.slice(0, 5).map(item => (
              <tr key={item.country} className="border-t">
                <td className="px-4 py-2">{item.country}</td>
                <td className="px-4 py-2 text-right">{item.requests.toLocaleString()}</td>
                <td className="px-4 py-2 text-right">
                  <span className={item.error_rate > 5 ? 'text-red-600 font-bold' : 'text-green-600'}>
                    {item.error_rate}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}