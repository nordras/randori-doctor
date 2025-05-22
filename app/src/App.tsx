import { useState } from 'react';
import { ThemeProvider } from "./components/theme/theme-provider";
import MainLayout from './components/layout/MainLayout';
import SessionProvider from './context/SessionContext';
import LeaderDashboard from './components/dashboard/LeaderDashboard';
import { Toaster } from "./components/ui/toaster";

function App() {
  const [isLoading, setIsLoading] = useState(true);
  
  // Simulate loading state (replace with actual data fetching)
  setTimeout(() => {
    setIsLoading(false);
  }, 1000);

  return (
    <ThemeProvider defaultTheme="light" storageKey="randori-doctor-theme">
      <SessionProvider>
        <MainLayout isLoading={isLoading}>
          <LeaderDashboard />
        </MainLayout>
        <Toaster />
      </SessionProvider>
    </ThemeProvider>
  );
}

export default App;