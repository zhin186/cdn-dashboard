import { useEffect, useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { X, Database, Clock } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '';

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

  useEffect(() => {
    fetchStreams();
  }, []);

  const fetchStreams = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/streams`);
      setStreams(res.data);
      if (res.data.length > 0 && selected.length === 0) {
        onChange([res.data[0].name]);
      }
    } catch (err) {
      console.error('Failed to fetch streams:', err);
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
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Database className="w-5 h-5" />
            数据流配置
          </h3>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4" />
            <input
              type="datetime-local"
              value={format(timeRange[0], "yyyy-MM-dd'T'HH:mm")}
              onChange={(e) => onTimeRangeChange([new Date(e.target.value), timeRange[1]])}
              className="border rounded px-2 py-1"
            />
            <span>~</span>
            <input
              type="datetime-local"
              value={format(timeRange[1], "yyyy-MM-dd'T'HH:mm")}
              onChange={(e) => onTimeRangeChange([timeRange[0], new Date(e.target.value)])}
              className="border rounded px-2 py-1"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {streams.map(stream => (
            <button
              key={stream.name}
              onClick={() => toggleStream(stream.name)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${
                selected.includes(stream.name)
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {stream.name}
              {selected.includes(stream.name) && (
                <X className="w-3 h-3" onClick={(e) => {
                  e.stopPropagation();
                  toggleStream(stream.name);
                }} />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}