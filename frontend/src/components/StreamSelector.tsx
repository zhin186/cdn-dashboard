// frontend/src/components/StreamSelector.tsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { X, Database, Clock, RefreshCw, AlertCircle } from 'lucide-react';

const API_URL = '';

interface Stream {
  name: string;
  schema: any[];
}

interface Props {
  selected: string[];
  onChange: (streams: string[]) => void;
  timeRange: [Date, Date];
  onTimeRangeChange: (range: [Date, Date]) => void;
}

export function StreamSelector({ selected, onChange, timeRange, onTimeRangeChange }: Props) {
  const [streams, setStreams] = useState<Stream[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStreams();
  }, []);

  const fetchStreams = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_URL}/api/streams`);
      const data = res.data || [];
      setStreams(data);
      
      // 如果没有选择且有数据，默认选择第一个
      if (data.length > 0 && selected.length === 0) {
        onChange([data[0].name]);
      }
    } catch (err: any) {
      console.error('Failed to fetch streams:', err);
      setError(err.response?.data?.error || err.message || '获取数据流失败');
    } finally {
      setLoading(false);
    }
  };

  const toggleStream = (name: string) => {
    if (selected.includes(name)) {
      onChange(selected.filter(s => s !== name));
    } else {
      onChange([...selected, name]);
    }
  };

  return (
    <div className="card">
      <div className="flex flex-col gap-4">
        {/* 头部：标题和时间选择 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-600" />
            数据流配置
            {selected.length > 0 && (
              <span className="text-sm font-normal text-gray-500">
                (已选 {selected.length} 个)
              </span>
            )}
          </h3>
          
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-gray-400" />
            <input
              type="datetime-local"
              value={format(timeRange[0], "yyyy-MM-dd'T'HH:mm")}
              onChange={(e) => onTimeRangeChange([new Date(e.target.value), timeRange[1]])}
              className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-gray-500">~</span>
            <input
              type="datetime-local"
              value={format(timeRange[1], "yyyy-MM-dd'T'HH:mm")}
              onChange={(e) => onTimeRangeChange([timeRange[0], new Date(e.target.value)])}
              className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-red-700 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1">{error}</span>
            <button 
              onClick={fetchStreams}
              className="flex items-center gap-1 px-2 py-1 bg-red-100 hover:bg-red-200 rounded text-xs font-medium"
            >
              <RefreshCw className="w-3 h-3" />
              重试
            </button>
          </div>
        )}

        {/* 加载中 */}
        {loading && !streams.length && (
          <div className="flex items-center justify-center py-8 text-gray-500">
            <RefreshCw className="w-5 h-5 animate-spin mr-2" />
            加载数据流列表...
          </div>
        )}

        {/* 数据流选择按钮区域 - 总是显示 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 font-medium">可选数据流：</span>
            {streams.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={() => onChange(streams.map(s => s.name))}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  全选
                </button>
                <span className="text-gray-300">|</span>
                <button
                  onClick={() => onChange([])}
                  className="text-xs text-gray-600 hover:text-gray-800 font-medium"
                >
                  清空
                </button>
              </div>
            )}
          </div>

          {/* 流列表 */}
          {streams.length === 0 && !loading ? (
            <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
              <Database className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm mb-3">未获取到数据流列表</p>
              <button
                onClick={fetchStreams}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 flex items-center gap-2 mx-auto"
              >
                <RefreshCw className="w-4 h-4" />
                刷新重试
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg min-h-[60px]">
              {streams.map(stream => (
                <button
                  key={stream.name}
                  onClick={() => toggleStream(stream.name)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 border ${
                    selected.includes(stream.name)
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }`}
                  title={`Schema: ${stream.schema?.map((s: any) => s.name).join(', ') || 'unknown'}`}
                >
                  {stream.name}
                  {selected.includes(stream.name) && (
                    <X 
                      className="w-3 h-3 cursor-pointer hover:text-blue-200" 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleStream(stream.name);
                      }}
                    />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 已选提示 */}
        {selected.length === 0 && streams.length > 0 && (
          <p className="text-sm text-amber-600 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            请至少选择一个数据流开始分析
          </p>
        )}
      </div>
    </div>
  );
}