import { useState } from "react";
import { Link } from "wouter";
import { useListPlayers } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Search } from "lucide-react";
function Players() {
  const [search, setSearch] = useState("");
  const [position, setPosition] = useState("ALL");
  const { data: players, isLoading } = useListPlayers({
    search: search.length > 2 ? search : void 0,
    position: position !== "ALL" ? position : void 0
  });
  return <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in zoom-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-primary/20 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-primary glow-text">PLAYER_DATABASE</h1>
          <p className="text-muted-foreground font-mono text-sm mt-1">QUERYING: GLOBAL_TALENT_POOL</p>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-primary" />
            <Input
    type="text"
    placeholder="SEARCH_TARGET..."
    className="pl-9 font-mono border-primary/30 focus-visible:ring-primary bg-card/50"
    value={search}
    onChange={(e) => setSearch(e.target.value)}
  />
          </div>
          <Select value={position} onValueChange={setPosition}>
            <SelectTrigger className="w-[120px] font-mono border-primary/30 bg-card/50">
              <SelectValue placeholder="POSITION" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">ALL</SelectItem>
              <SelectItem value="FW">FW</SelectItem>
              <SelectItem value="MF">MF</SelectItem>
              <SelectItem value="DF">DF</SelectItem>
              <SelectItem value="GK">GK</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => <Card key={i} className="bg-card/50 border-primary/20 h-48 animate-pulse cyber-grid" />)}
        </div> : players?.length === 0 ? <div className="text-center py-20 border border-primary/20 bg-card/30 cyber-grid">
          <p className="font-mono text-muted-foreground">NO_TARGETS_FOUND</p>
        </div> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {players?.map((player, index) => <Link key={player.id} href={`/players/${player.id}`}>
              <Card
    className="bg-card/50 border-primary/20 hover:border-primary cursor-pointer transition-all duration-300 group cyber-grid overflow-hidden relative"
    style={{ animationDelay: `${index * 50}ms` }}
  >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardContent className="p-6 relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-xl font-bold uppercase tracking-wider group-hover:text-primary transition-colors">{player.name}</h2>
                      <p className="text-xs font-mono text-muted-foreground mt-1">{player.club} // {player.nationality}</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-2xl font-bold font-mono text-secondary glow-text">{player.rating}</span>
                      <span className="text-[10px] font-mono border border-primary/30 px-1 bg-primary/10 text-primary mt-1">{player.position}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-y-3 gap-x-2 mt-6">
                    <StatBar label="PAC" value={player.pace} />
                    <StatBar label="SHO" value={player.shooting} />
                    <StatBar label="PAS" value={player.passing} />
                    <StatBar label="DRI" value={player.dribbling} />
                    <StatBar label="DEF" value={player.defending} />
                    <StatBar label="PHY" value={player.physical} />
                  </div>
                </CardContent>
              </Card>
            </Link>)}
        </div>}
    </div>;
}
function StatBar({ label, value }) {
  const colorClass = value >= 80 ? "bg-secondary" : value >= 70 ? "bg-primary" : "bg-muted-foreground";
  return <div className="flex items-center gap-2">
      <span className="text-[10px] font-mono text-muted-foreground w-6">{label}</span>
      <div className="flex-1 h-1.5 bg-background border border-primary/20">
        <div className={`h-full ${colorClass}`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-[10px] font-mono w-4 text-right">{value}</span>
    </div>;
}
export {
  Players as default
};
