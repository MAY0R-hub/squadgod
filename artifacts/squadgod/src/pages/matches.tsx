import { useState } from "react";
import { useListMatches, usePredictMatch, getListMatchesQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Crosshair, Zap } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function Matches() {
  const { data: matches, isLoading } = useListMatches();
  const predictMatch = usePredictMatch();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [homeTeam, setHomeTeam] = useState("");
  const [awayTeam, setAwayTeam] = useState("");

  const handlePredict = (e: React.FormEvent) => {
    e.preventDefault();
    if (!homeTeam.trim() || !awayTeam.trim()) return;

    predictMatch.mutate({ data: { homeTeam, awayTeam } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListMatchesQueryKey() });
        toast({ title: "PREDICTION_COMPLETE", description: "Simulation results logged." });
        setHomeTeam("");
        setAwayTeam("");
      },
      onError: () => {
        toast({ title: "SIMULATION_ERROR", description: "Failed to run prediction model.", variant: "destructive" });
      }
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-primary glow-text">MATCH_PREDICTOR</h1>
        <p className="text-muted-foreground font-mono text-sm mt-1">NEURAL_NETWORK_SIMULATION</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card className="bg-card/50 border-secondary/30 rounded-none cyber-grid sticky top-24">
            <CardHeader className="border-b border-secondary/20">
              <CardTitle className="font-mono text-secondary flex items-center gap-2">
                <Crosshair className="h-5 w-5" /> NEW_SIMULATION
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handlePredict} className="space-y-6">
                <div className="space-y-2">
                  <label className="font-mono text-xs text-muted-foreground">HOME_TEAM</label>
                  <Input 
                    value={homeTeam} 
                    onChange={e => setHomeTeam(e.target.value)} 
                    placeholder="ENTER_TEAM_NAME..."
                    className="font-mono border-secondary/30 bg-background rounded-none focus-visible:ring-secondary"
                  />
                </div>
                
                <div className="flex items-center justify-center">
                  <div className="h-px bg-secondary/30 flex-1" />
                  <span className="font-mono text-xs text-secondary px-4">VS</span>
                  <div className="h-px bg-secondary/30 flex-1" />
                </div>

                <div className="space-y-2">
                  <label className="font-mono text-xs text-muted-foreground">AWAY_TEAM</label>
                  <Input 
                    value={awayTeam} 
                    onChange={e => setAwayTeam(e.target.value)} 
                    placeholder="ENTER_TEAM_NAME..."
                    className="font-mono border-secondary/30 bg-background rounded-none focus-visible:ring-secondary"
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={predictMatch.isPending || !homeTeam.trim() || !awayTeam.trim()}
                  className="w-full bg-secondary/20 text-secondary border border-secondary hover:bg-secondary hover:text-secondary-foreground font-mono rounded-none transition-all shadow-[0_0_15px_-3px_hsl(var(--secondary)/0.3)]"
                >
                  {predictMatch.isPending ? "SIMULATING..." : "RUN_PREDICTION"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-mono text-primary mb-4 border-b border-primary/20 pb-2">SIMULATION_LOGS</h3>
          
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <Card key={i} className="bg-card/50 border-primary/20 h-32 animate-pulse cyber-grid" />
              ))}
            </div>
          ) : matches?.length === 0 ? (
            <div className="text-center py-12 border border-primary/20 bg-card/30 cyber-grid">
              <p className="font-mono text-muted-foreground">NO_LOGS_FOUND</p>
            </div>
          ) : (
            <div className="space-y-4">
              {matches?.map((match) => (
                <Card key={match.id} className="bg-card/50 border-primary/20 rounded-none overflow-hidden">
                  <div className="flex flex-col sm:flex-row">
                    <div className="flex-1 p-6 border-b sm:border-b-0 sm:border-r border-primary/10">
                      <div className="flex justify-between items-center mb-4">
                        <span className="font-mono text-xs text-muted-foreground">{new Date(match.createdAt).toLocaleString()}</span>
                        <span className="font-mono text-xs border border-secondary/30 px-2 py-0.5 text-secondary flex items-center gap-1">
                          <Zap className="h-3 w-3" /> CONF: {match.confidence}%
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between font-mono text-2xl font-bold">
                        <div className="flex-1 text-right">{match.homeTeam}</div>
                        <div className="px-6 text-primary glow-text text-3xl">{match.homeScore} - {match.awayScore}</div>
                        <div className="flex-1 text-left">{match.awayTeam}</div>
                      </div>
                    </div>
                    
                    <div className="sm:w-1/3 p-4 bg-primary/5">
                      <p className="text-xs font-mono text-muted-foreground mb-1">AI_ANALYSIS_SUMMARY</p>
                      <p className="text-sm font-mono text-primary/80 line-clamp-3">
                        &gt; {match.aiAnalysis}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
