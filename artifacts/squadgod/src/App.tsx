import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navbar } from "@/components/layout/Navbar";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Players from "@/pages/players";
import PlayerProfile from "@/pages/player-profile";
import Squads from "@/pages/squads";
import SquadDetail from "@/pages/squad-detail";
import Matches from "@/pages/matches";

const queryClient = new QueryClient();

function Router() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1 relative">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/players" component={Players} />
          <Route path="/players/:id" component={PlayerProfile} />
          <Route path="/squads" component={Squads} />
          <Route path="/squads/:id" component={SquadDetail} />
          <Route path="/matches" component={Matches} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

import { useEffect } from "react";
export default App;
