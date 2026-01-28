import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { ErrorRateDashboard } from './components/dashboard/ErrorRateDashboard';
import { CountryAnalytics } from './components/dashboard/CountryAnalytics';
import { StreamSelector } from './components/dashboard/StreamSelector';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchInterval: 60000, staleTime: 30000 }
  }
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <DashboardLayout>
        <div className="space-y-6 p-6">
          <StreamSelector />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ErrorRateDashboard />
            <CountryAnalytics />
          </div>
        </div>
      </DashboardLayout>
    </QueryClientProvider>
  );
}

export default App;