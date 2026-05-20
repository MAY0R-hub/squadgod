import { useGetSquadsOverview, useListMatches, useListTopRatedPlayers, useListSquads } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Users, Shield, Zap } from "lucide-react";
import { Link } from "wouter";
function Home() {
  const { data: overview, isLoading: isOverviewLoading } = useGetSquadsOverview();
  const { data: topPlayers, isLoading: isTopPlayersLoading } = useListTopRatedPlayers({ limit: 5 });
  const { data: matches, isLoading: isMatchesLoading } = useListMatches({ limit: 3 });
  const { data: squads, isLoading: isSquadsLoading } = useListSquads();
  return <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in zoom-in duration-500">
      
      <div className="flex items-center justify-between border-b border-primary/20 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-primary glow-text">SYSTEM.OVERVIEW</h1>
          <p className="text-muted-foreground font-mono text-sm mt-1">Status: ONLINE // Analyzing global data</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
    title="TOTAL SQUADS"
    value={isOverviewLoading ? "..." : overview?.totalSquads}
    icon={<Shield className="h-5 w-5 text-primary" />}
  />
        <StatCard
    title="TOTAL PLAYERS"
    value={isOverviewLoading ? "..." : overview?.totalPlayers}
    icon={<Users className="h-5 w-5 text-primary" />}
  />
        <StatCard
    title="AVG RATING"
    value={isOverviewLoading ? "..." : overview?.avgOverallRating.toFixed(1)}
    icon={<Activity className="h-5 w-5 text-secondary" />}
    glow="secondary"
  />
        <StatCard
    title="TOP FORMATION"
    value={isOverviewLoading ? "..." : overview?.topFormation}
    icon={<Zap className="h-5 w-5 text-secondary" />}
    glow="secondary"
  />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="bg-card/50 border-primary/20 rounded-none cyber-grid lg:col-span-1">
          <CardHeader className="border-b border-primary/20">
            <CardTitle className="text-lg font-mono text-primary flex justify-between">
              <span>ELITE_ASSETS</span>
              <Link href="/players" className="text-xs text-muted-foreground hover:text-primary transition-colors">VIEW ALL &gt;</Link>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-primary/10">
              {isTopPlayersLoading ? <div className="p-6 text-center text-muted-foreground font-mono text-sm">FETCHING DATA...</div> : topPlayers?.map((player) => <Link key={player.id} href={`/players/${player.id}`} className="flex items-center justify-between p-4 hover:bg-primary/5 transition-colors group cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary/10 border border-primary/30 flex items-center justify-center font-mono font-bold text-primary group-hover:border-primary transition-colors">
                        {player.position}
                      </div>
                      <div>
                        <div className="font-bold">{player.name}</div>
                        <div className="text-xs text-muted-foreground font-mono">{player.club}</div>
                      </div>
                    </div>
                    <div className="text-xl font-mono font-bold text-secondary group-hover:text-primary glow-text transition-colors">
                      {player.rating}
                    </div>
                  </Link>)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-primary/20 rounded-none cyber-grid lg:col-span-1">
          <CardHeader className="border-b border-primary/20">
            <CardTitle className="text-lg font-mono text-primary flex justify-between">
              <span>RECENT_UNITS</span>
              <Link href="/squads" className="text-xs text-muted-foreground hover:text-primary transition-colors">VIEW ALL &gt;</Link>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
             <div className="divide-y divide-primary/10">
              {isSquadsLoading ? <div className="p-6 text-center text-muted-foreground font-mono text-sm">FETCHING SQUADS...</div> : squads?.length === 0 ? <div className="p-6 text-center text-muted-foreground font-mono text-sm">NO UNITS FOUND</div> : squads?.slice(0, 5).map((squad) => <Link key={squad.id} href={`/squads/${squad.id}`} className="flex items-center justify-between p-4 hover:bg-primary/5 transition-colors group cursor-pointer">
                    <div>
                      <div className="font-bold uppercase tracking-wider">{squad.name}</div>
                      <div className="text-xs text-muted-foreground font-mono">FORM: {squad.formation}</div>
                    </div>
                    <div className="text-xl font-mono font-bold text-primary glow-text transition-colors">
                      {squad.overallRating}
                    </div>
                  </Link>)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-primary/20 rounded-none cyber-grid lg:col-span-1">
          <CardHeader className="border-b border-primary/20">
            <CardTitle className="text-lg font-mono text-primary flex justify-between">
              <span>RECENT_SIMULATIONS</span>
              <Link href="/matches" className="text-xs text-muted-foreground hover:text-primary transition-colors">VIEW ALL &gt;</Link>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
             <div className="divide-y divide-primary/10">
              {isMatchesLoading ? <div className="p-6 text-center text-muted-foreground font-mono text-sm">PROCESSING PREDICTIONS...</div> : matches?.length === 0 ? <div className="p-6 text-center text-muted-foreground font-mono text-sm">NO PREDICTIONS FOUND</div> : matches?.map((match) => <div key={match.id} className="p-4 hover:bg-primary/5 transition-colors">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-mono text-xs text-muted-foreground">{new Date(match.createdAt).toLocaleDateString()}</span>
                      <span className="font-mono text-xs text-secondary border border-secondary/30 px-2 py-0.5">CONF: {match.confidence}%</span>
                    </div>
                    <div className="flex items-center justify-between font-mono text-lg font-bold">
                      <div className="flex-1 text-right truncate">{match.homeTeam}</div>
                      <div className="px-4 text-primary">{match.homeScore} - {match.awayScore}</div>
                      <div className="flex-1 text-left truncate">{match.awayTeam}</div>
                    </div>
                  </div>)}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>;
}
function StatCard({ title, value, icon, glow = "primary" }) {
  return <Card className="rounded-none border-primary/20 bg-card/50 backdrop-blur">
      <CardContent className="p-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-mono text-muted-foreground mb-1">{title}</p>
          <p className={`text-3xl font-mono font-bold ${glow === "primary" ? "text-primary" : "text-secondary"} glow-text`}>{value}</p>
        </div>
        <div className={`p-3 border ${glow === "primary" ? "border-primary/30 bg-primary/5" : "border-secondary/30 bg-secondary/5"}`}>
          {icon}
        </div>
      </CardContent>
    </Card>;
}
export {
  Home as default
};
