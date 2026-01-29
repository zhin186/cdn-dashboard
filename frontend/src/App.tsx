import { useState } from 'react';
import { format, subHours } from 'date-fns';
import { StreamSelector } from './components/StreamSelector';
import { ErrorRateChart } from './components/ErrorRateChart';
import { CountryChart } from './components/CountryChart';
import { AlertCircle, Database, Globe, Activity } from 'lucide-react';

function App() {
  const [selectedStreams, setSelectedStreams] = useState<string[]>([]);
  const [timeRange, setTimeRange] = useState<[Date, Date]>([
    subHours(new Date(), 24),
    new Date()
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900">CDN Analytics Dashboard</h1>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Database className="w-4 h-4" />
              {selectedStreams.length} streams
            </span>
            <span className="flex items-center gap-1">
              <Globe className="w-4 h-4" />
              {format(timeRange[0], 'MM-dd HH:mm')} ~ {format(timeRange[1], 'MM-dd HH:mm')}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedStreams.length === 0 ? (
          <div className="card flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">选择数据流</h3>
            <p className="text-gray-500 mb-6">请选择至少一个 OpenObserve 数据流开始分析</p>
          </div>
        ) : (
          <div className="space-y-6">
            <StreamSelector 
              selected={selectedStreams} 
              onChange={setSelectedStreams}
              timeRange={timeRange}
              onTimeRangeChange={setTimeRange}
            />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ErrorRateChart 
                streams={selectedStreams} 
                timeRange={timeRange}
              />
              <CountryChart 
                streams={selectedStreams} 
                timeRange={timeRange}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;