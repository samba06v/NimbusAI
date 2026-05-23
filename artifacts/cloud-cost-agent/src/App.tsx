import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/Layout";

import LandingPage from "@/pages/LandingPage";
import Dashboard from "@/pages/Dashboard";
import Resources from "@/pages/Resources";
import Recommendations from "@/pages/Recommendations";
import Forecasts from "@/pages/Forecasts";
import Alerts from "@/pages/Alerts";
import Accounts from "@/pages/Accounts";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function AppRoutes() {
  return (
    <Switch>
      {/* Landing page — standalone, no sidebar */}
      <Route path="/landing" component={LandingPage} />

      {/* App pages — wrapped in Layout with sidebar */}
      <Route path="/">
        {() => (
          <Layout>
            <Dashboard />
          </Layout>
        )}
      </Route>
      <Route path="/resources">
        {() => (
          <Layout>
            <Resources />
          </Layout>
        )}
      </Route>
      <Route path="/recommendations">
        {() => (
          <Layout>
            <Recommendations />
          </Layout>
        )}
      </Route>
      <Route path="/forecasts">
        {() => (
          <Layout>
            <Forecasts />
          </Layout>
        )}
      </Route>
      <Route path="/alerts">
        {() => (
          <Layout>
            <Alerts />
          </Layout>
        )}
      </Route>
      <Route path="/accounts">
        {() => (
          <Layout>
            <Accounts />
          </Layout>
        )}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AppRoutes />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
