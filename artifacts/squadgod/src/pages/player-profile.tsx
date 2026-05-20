import { useRoute } from "wouter";
import { useGetPlayer } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from "recharts";

export default function PlayerProfile() {
  const [, params] = useRoute("/players/:id");
  const id = params?.id ? parseInt(params.id, 10) : 0;
  
  const { data: player, isLoading } = useGetPlayer(id, { query: { enabled: !!id } });

  if (isLoading) {
    return <div className="p-8 text-center font-mono text-primary animate-pulse">DECRYPTING_ASSET_DATA...</div>;
  }

  if (!player) {
    return <div className="p-8 text-center font-mono text-destructive">ASSET_NOT_FOUND</div>;
  }

  const radarData = [
    { subject: "PAC", A: player.pace, fullMark: 99 },
    { subject: "SHO", A: player.shooting, fullMark: 99 },
    { subject: "PAS", A: player.passing, fullMark: 99 },
    { subject: "DRI", A: player.dribbling, fullMark: 99 },
    { subject: "DEF", A: player.defending, fullMark: 99 },
    { subject: "PHY", A: player.physical, fullMark: 99 },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
      <Link href="/players" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary font-mono text-sm mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /> BACK_TO_DATABASE
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-card/80 border-primary/30 cyber-grid overflow-hidden relative shadow-[0_0_30px_-10px_hsl(var(--primary)/0.2)]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
            <CardContent className="p-8 text-center relative z-10">
              <div className="text-6xl font-black font-mono text-secondary glow-text mb-2">{player.rating}</div>
              <div className="text-xl font-mono text-primary border border-primary/30 inline-block px-4 py-1 bg-primary/10 mb-6">{player.position}</div>
              <h1 className="text-3xl font-bold uppercase tracking-widest mb-2">{player.name}</h1>
              <div className="text-sm font-mono text-muted-foreground space-y-1">
                <p>CLUB: {player.club}</p>
                <p>NATION: {player.nationality}</p>
                <p>ID_REF: #{player.id.toString().padStart(4, '0')}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-card/50 border-primary/20 h-full">
            <CardContent className="p-6 h-full flex flex-col">
              <h3 className="text-lg font-mono text-primary border-b border-primary/20 pb-2 mb-6">PERFORMANCE_METRICS</h3>
              
              <div className="flex-1 flex flex-col md:flex-row items-center gap-8">
                <div className="w-full md:w-1/2 h-64 md:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                      <PolarGrid stroke="hsl(var(--primary)/0.2)" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: "hsl(var(--primary))", fontFamily: "monospace", fontSize: 12 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar name={player.name} dataKey="A" stroke="hsl(var(--secondary))" fill="hsl(var(--secondary))" fillOpacity={0.3} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--primary)/0.5)", borderRadius: 0, fontFamily: "monospace" }}
                        itemStyle={{ color: "hsl(var(--secondary))" }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="w-full md:w-1/2 space-y-4">
                  <DetailedStat label="PACE" value={player.pace} />
                  <DetailedStat label="SHOOTING" value={player.shooting} />
                  <DetailedStat label="PASSING" value={player.passing} />
                  <DetailedStat label="DRIBBLING" value={player.dribbling} />
                  <DetailedStat label="DEFENDING" value={player.defending} />
                  <DetailedStat label="PHYSICAL" value={player.physical} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function DetailedStat({ label, value }: { label: string; value: number }) {
  const colorClass = value >= 80 ? "bg-secondary" : value >= 70 ? "bg-primary" : "bg-muted-foreground";
  return (
    <div>
      <div className="flex justify-between text-xs font-mono mb-1">
        <span className="text-muted-foreground">{label}</span>
        <span className="text-primary">{value}/99</span>
      </div>
      <div className="h-2 w-full bg-background border border-primary/20">
        <div className={`h-full ${colorClass} transition-all duration-1000`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
