import { useRoute, useLocation } from "wouter";
import {
  useGetSquad,
  useGetSquadAnalysis,
  useDeleteSquad,
  useUpdateSquad,
  useAddPlayerToSquad,
  useRemovePlayerFromSquad,
  useListPlayers,
  getGetSquadQueryKey,
  getListSquadsQueryKey,
  getGetSquadsOverviewQueryKey
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, BrainCircuit, Trash2, Edit2, Plus, X } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
const POSITIONS = ["GK", "LB", "CB1", "CB2", "RB", "CDM1", "CDM2", "CM", "CAM", "LW", "RW", "ST"];
function SquadDetail() {
  const [, params] = useRoute("/squads/:id");
  const [, setLocation] = useLocation();
  const id = params?.id ? parseInt(params.id, 10) : 0;
  const { data: squad, isLoading } = useGetSquad(id, { query: { enabled: !!id } });
  const deleteSquad = useDeleteSquad();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this squad?")) {
      deleteSquad.mutate({ id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListSquadsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetSquadsOverviewQueryKey() });
          toast({ title: "SQUAD_DELETED", description: "Unit removed from system." });
          setLocation("/squads");
        }
      });
    }
  };
  if (isLoading) {
    return <div className="p-8 text-center font-mono text-primary animate-pulse">LOADING_TACTICAL_DATA...</div>;
  }
  if (!squad) {
    return <div className="p-8 text-center font-mono text-destructive">SQUAD_NOT_FOUND</div>;
  }
  return <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
      <Link href="/squads" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary font-mono text-sm mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /> BACK_TO_SQUADS
      </Link>

      <div className="flex flex-col md:flex-row items-start justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-4">
            <h1 className="text-4xl font-bold uppercase tracking-widest text-primary glow-text">{squad.name}</h1>
            <EditSquadDialog squad={squad} />
            <Button variant="ghost" size="icon" onClick={handleDelete} className="text-destructive hover:bg-destructive/20 hover:text-destructive">
              <Trash2 className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex gap-4 mt-2">
            <span className="font-mono text-sm border border-secondary/50 px-2 py-0.5 bg-secondary/10 text-secondary">
              FORM: {squad.formation}
            </span>
            <span className="font-mono text-sm border border-primary/50 px-2 py-0.5 bg-primary/10 text-primary">
              RATING: {squad.overallRating}
            </span>
          </div>
        </div>
        <AnalysisDialog squadId={squad.id} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {
    /* Pitch Display */
  }
        <div className="lg:col-span-2">
          <Card className="bg-green-950/20 border-primary/30 h-[600px] relative overflow-hidden flex flex-col justify-center items-center">
            {
    /* Pitch markings */
  }
            <div className="absolute inset-0 border-2 border-primary/20 m-4 pointer-events-none" />
            <div className="absolute top-1/2 left-4 right-4 h-px bg-primary/20 pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 w-32 h-32 -mt-16 -ml-16 rounded-full border-2 border-primary/20 pointer-events-none" />
            
            <div className="z-10 w-full h-full p-8 flex flex-col justify-between relative text-center">
               <div className="text-center font-mono text-primary/50 text-sm h-full flex items-center justify-center absolute inset-0 pointer-events-none">
                TACTICAL_BOARD_VISUALIZATION_ACTIVE
                <br />
                (Players: {squad.players.length}/11)
              </div>
              <div className="grid grid-cols-5 gap-4 h-full relative z-20 place-items-center">
                {POSITIONS.map((pos) => {
    const member = squad.players.find((p) => p.positionSlot === pos);
    return <div key={pos} className="w-16 h-16 border-2 border-primary/30 rounded-full flex items-center justify-center bg-card/80 backdrop-blur">
                      {member ? <div className="text-center cursor-pointer group relative">
                          <div className="font-bold text-xs uppercase truncate max-w-[50px]">{member.player.name.slice(0, 6)}</div>
                          <div className="text-primary text-[10px] font-mono">{member.player.rating}</div>
                        </div> : <span className="text-muted-foreground/50 text-xs font-mono">{pos}</span>}
                    </div>;
  })}
              </div>
            </div>
          </Card>
        </div>

        {
    /* Player List */
  }
        <div className="lg:col-span-1 space-y-4">
          <Card className="bg-card/50 border-primary/20 h-[600px] flex flex-col">
            <CardHeader className="border-b border-primary/20 pb-4 flex flex-row items-center justify-between">
              <CardTitle className="font-mono text-primary text-lg">ROSTER [{squad.players.length}/11]</CardTitle>
              <AddPlayerDialog squadId={squad.id} squadPlayers={squad.players} />
            </CardHeader>
            <CardContent className="p-0 overflow-auto flex-1">
              <div className="divide-y divide-primary/10">
                {squad.players.length === 0 ? <div className="p-6 text-center text-muted-foreground font-mono text-sm">NO_ASSETS_ASSIGNED</div> : squad.players.map((member) => <PlayerRow key={member.id} squadId={squad.id} member={member} />)}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>;
}
function PlayerRow({ squadId, member }) {
  const queryClient = useQueryClient();
  const removePlayer = useRemovePlayerFromSquad();
  const { toast } = useToast();
  const handleRemove = () => {
    removePlayer.mutate({ squadId, playerId: member.playerId }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetSquadQueryKey(squadId) });
        queryClient.invalidateQueries({ queryKey: getGetSquadsOverviewQueryKey() });
        toast({ title: "ASSET_REMOVED", description: `${member.player.name} removed from slot ${member.positionSlot}.` });
      }
    });
  };
  return <div className="p-4 hover:bg-primary/5 transition-colors flex items-center justify-between group">
      <div>
        <div className="font-bold">{member.player.name}</div>
        <div className="text-xs text-muted-foreground font-mono">SLOT: {member.positionSlot} // POS: {member.player.position}</div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-xl font-mono font-bold text-secondary glow-text">
          {member.player.rating}
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/20 hover:text-destructive" onClick={handleRemove}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>;
}
function EditSquadDialog({ squad }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(squad.name);
  const [formation, setFormation] = useState(squad.formation);
  const updateSquad = useUpdateSquad();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const handleUpdate = () => {
    if (!name.trim()) return;
    updateSquad.mutate({ id: squad.id, data: { name, formation } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetSquadQueryKey(squad.id) });
        queryClient.invalidateQueries({ queryKey: getListSquadsQueryKey() });
        toast({ title: "SQUAD_UPDATED", description: "Unit parameters modified." });
        setOpen(false);
      }
    });
  };
  return <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/20 hover:text-primary">
          <Edit2 className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-primary/50 rounded-none cyber-grid sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-primary font-mono glow-text">MODIFY_SQUAD_PARAMETERS</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label className="font-mono text-xs text-muted-foreground">UNIT_DESIGNATION</label>
            <Input
    value={name}
    onChange={(e) => setName(e.target.value)}
    className="font-mono border-primary/30 rounded-none bg-background focus-visible:ring-primary"
  />
          </div>
          <div className="grid gap-2">
            <label className="font-mono text-xs text-muted-foreground">TACTICAL_FORMATION</label>
            <Select value={formation} onValueChange={setFormation}>
              <SelectTrigger className="font-mono border-primary/30 rounded-none bg-background focus-visible:ring-primary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-none border-primary/50">
                <SelectItem value="4-3-3">4-3-3</SelectItem>
                <SelectItem value="4-4-2">4-4-2</SelectItem>
                <SelectItem value="4-2-3-1">4-2-3-1</SelectItem>
                <SelectItem value="3-5-2">3-5-2</SelectItem>
                <SelectItem value="5-3-2">5-3-2</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end">
          <Button
    onClick={handleUpdate}
    disabled={updateSquad.isPending || !name.trim()}
    className="bg-primary text-primary-foreground hover:bg-primary/80 font-mono rounded-none w-full"
  >
            {updateSquad.isPending ? "UPDATING..." : "COMMIT_CHANGES"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>;
}
function AddPlayerDialog({ squadId, squadPlayers }) {
  const [open, setOpen] = useState(false);
  const [slot, setSlot] = useState(POSITIONS[0]);
  const [search, setSearch] = useState("");
  const { data: players, isLoading } = useListPlayers({ search: search.length > 2 ? search : void 0 });
  const addPlayer = useAddPlayerToSquad();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const handleAdd = (playerId) => {
    addPlayer.mutate({ squadId, data: { playerId, positionSlot: slot } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetSquadQueryKey(squadId) });
        queryClient.invalidateQueries({ queryKey: getGetSquadsOverviewQueryKey() });
        toast({ title: "ASSET_ASSIGNED", description: `Player assigned to slot ${slot}.` });
        setOpen(false);
      },
      onError: (err) => {
        toast({ title: "ASSIGNMENT_FAILED", description: err.message || "Could not assign player.", variant: "destructive" });
      }
    });
  };
  const occupiedSlots = squadPlayers.map((p) => p.positionSlot);
  const availableSlots = POSITIONS.filter((p) => !occupiedSlots.includes(p));
  return <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-8 bg-primary/20 text-primary border border-primary hover:bg-primary hover:text-primary-foreground font-mono rounded-none">
          <Plus className="h-4 w-4 mr-1" /> ADD
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-primary/50 rounded-none cyber-grid sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-primary font-mono glow-text">ASSIGN_NEW_ASSET</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label className="font-mono text-xs text-muted-foreground">TARGET_SLOT</label>
            <Select value={slot} onValueChange={setSlot}>
              <SelectTrigger className="font-mono border-primary/30 rounded-none bg-background focus-visible:ring-primary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-none border-primary/50">
                {availableSlots.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                {availableSlots.length === 0 && <SelectItem value="FULL" disabled>ALL_SLOTS_OCCUPIED</SelectItem>}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <label className="font-mono text-xs text-muted-foreground">SEARCH_ASSET</label>
            <Input
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    placeholder="Name..."
    className="font-mono border-primary/30 rounded-none bg-background focus-visible:ring-primary"
  />
          </div>

          <div className="h-64 overflow-y-auto border border-primary/20 bg-background/50 divide-y divide-primary/10">
            {isLoading ? <div className="p-4 text-center text-muted-foreground font-mono text-sm">SEARCHING...</div> : players?.length === 0 ? <div className="p-4 text-center text-muted-foreground font-mono text-sm">NO_MATCHES</div> : players?.map((player) => {
    const isAlreadyInSquad = squadPlayers.some((sp) => sp.playerId === player.id);
    return <div key={player.id} className="p-3 flex items-center justify-between hover:bg-primary/5 transition-colors">
                    <div>
                      <div className="font-bold text-sm">{player.name}</div>
                      <div className="text-xs text-muted-foreground font-mono">{player.position} // RATING: {player.rating}</div>
                    </div>
                    <Button
      size="sm"
      onClick={() => handleAdd(player.id)}
      disabled={addPlayer.isPending || isAlreadyInSquad || availableSlots.length === 0}
      className="bg-primary/20 text-primary hover:bg-primary hover:text-primary-foreground font-mono rounded-none h-8 text-xs"
    >
                      {isAlreadyInSquad ? "ASSIGNED" : "SELECT"}
                    </Button>
                  </div>;
  })}
          </div>
        </div>
      </DialogContent>
    </Dialog>;
}
function AnalysisDialog({ squadId }) {
  const [open, setOpen] = useState(false);
  const { data: analysis, isLoading, isFetching } = useGetSquadAnalysis(squadId, { query: { enabled: open } });
  return <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-secondary/20 border border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground font-mono rounded-none shadow-[0_0_15px_-3px_hsl(var(--secondary)/0.4)]">
          <BrainCircuit className="mr-2 h-4 w-4" /> RUN_AI_DIAGNOSTIC
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-secondary/50 rounded-none cyber-grid sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-secondary font-mono glow-text flex items-center gap-2">
            <BrainCircuit className="h-5 w-5" /> TACTICAL_ANALYSIS_REPORT
          </DialogTitle>
        </DialogHeader>
        
        {isLoading || isFetching ? <div className="py-12 text-center flex flex-col items-center">
            <BrainCircuit className="h-8 w-8 text-secondary animate-pulse mb-4" />
            <span className="font-mono text-secondary animate-pulse">PROCESSING_NEURAL_MODELS...</span>
          </div> : analysis ? <div className="grid gap-6 py-4">
            <div className="flex justify-between items-center border-b border-secondary/20 pb-4">
              <span className="font-mono text-muted-foreground">OVERALL_GRADE</span>
              <span className="text-4xl font-black font-mono text-primary glow-text">{analysis.overallGrade}</span>
            </div>
            
            <div>
              <h4 className="font-mono text-primary mb-2 text-sm">STRENGTHS</h4>
              <ul className="space-y-1">
                {analysis.strengths.map((s, i) => <li key={i} className="text-sm font-mono text-muted-foreground flex items-start gap-2">
                    <span className="text-primary mt-0.5">+</span> {s}
                  </li>)}
              </ul>
            </div>

            <div>
              <h4 className="font-mono text-destructive mb-2 text-sm">WEAKNESSES</h4>
              <ul className="space-y-1">
                {analysis.weaknesses.map((w, i) => <li key={i} className="text-sm font-mono text-muted-foreground flex items-start gap-2">
                    <span className="text-destructive mt-0.5">-</span> {w}
                  </li>)}
              </ul>
            </div>

            <div className="bg-secondary/10 border border-secondary/30 p-4">
              <h4 className="font-mono text-secondary mb-2 text-sm">SYSTEM_SUGGESTIONS</h4>
              <ul className="space-y-2">
                {analysis.suggestions.map((s, i) => <li key={i} className="text-sm font-mono text-secondary/80">
                    &gt; {s}
                  </li>)}
              </ul>
            </div>
          </div> : <div className="py-8 text-center font-mono text-destructive">ANALYSIS_FAILED</div>}
      </DialogContent>
    </Dialog>;
}
export {
  SquadDetail as default
};
