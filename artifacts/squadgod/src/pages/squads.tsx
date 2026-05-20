import { useState } from "react";
import { Link } from "wouter";
import { useListSquads, useCreateSquad, getListSquadsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Shield, Plus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function Squads() {
  const { data: squads, isLoading } = useListSquads();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between border-b border-primary/20 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-primary glow-text">TACTICAL_UNITS</h1>
          <p className="text-muted-foreground font-mono text-sm mt-1">SQUAD_MANAGEMENT_SYSTEM</p>
        </div>
        
        <CreateSquadDialog open={isOpen} onOpenChange={setIsOpen} />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="bg-card/50 border-primary/20 h-32 animate-pulse cyber-grid" />
          ))}
        </div>
      ) : squads?.length === 0 ? (
        <div className="text-center py-20 border border-primary/20 bg-card/30 cyber-grid flex flex-col items-center justify-center">
          <Shield className="h-12 w-12 text-primary/30 mb-4" />
          <p className="font-mono text-muted-foreground mb-4">NO_ACTIVE_UNITS_DETECTED</p>
          <Button variant="outline" className="border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground font-mono rounded-none" onClick={() => setIsOpen(true)}>
            INITIALIZE_NEW_SQUAD
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {squads?.map((squad) => (
            <Link key={squad.id} href={`/squads/${squad.id}`}>
              <Card className="bg-card/50 border-primary/20 hover:border-primary cursor-pointer transition-all duration-300 group cyber-grid">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-xl font-bold uppercase tracking-wider group-hover:text-primary transition-colors">{squad.name}</h2>
                      <div className="text-xs font-mono border border-secondary/30 inline-block px-2 py-0.5 bg-secondary/10 text-secondary mt-2">
                        FORM: {squad.formation}
                      </div>
                    </div>
                    <div className="text-3xl font-black font-mono text-primary glow-text">
                      {squad.overallRating}
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-xs font-mono text-muted-foreground border-t border-primary/10 pt-4 mt-4">
                    <span>PLAYERS: {squad.players.length}/11</span>
                    <span>ID: #{squad.id.toString().padStart(4, '0')}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function CreateSquadDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const [name, setName] = useState("");
  const [formation, setFormation] = useState("4-3-3");
  const createSquad = useCreateSquad();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleCreate = () => {
    if (!name.trim()) return;
    createSquad.mutate({ data: { name, formation } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListSquadsQueryKey() });
        toast({ title: "SQUAD_INITIALIZED", description: `Unit ${name} online.` });
        onOpenChange(false);
        setName("");
      },
      onError: () => {
        toast({ title: "ERROR", description: "Failed to initialize squad.", variant: "destructive" });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-primary/10 border border-primary text-primary hover:bg-primary hover:text-primary-foreground font-mono rounded-none">
          <Plus className="mr-2 h-4 w-4" /> INIT_SQUAD
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-primary/50 rounded-none cyber-grid sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-primary font-mono glow-text">INITIALIZE_NEW_SQUAD</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label className="font-mono text-xs text-muted-foreground">UNIT_DESIGNATION</label>
            <Input 
              value={name} 
              onChange={e => setName(e.target.value)} 
              className="font-mono border-primary/30 rounded-none bg-background focus-visible:ring-primary"
              placeholder="E.g. NEON_STRIKERS"
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
            onClick={handleCreate} 
            disabled={createSquad.isPending || !name.trim()}
            className="bg-primary text-primary-foreground hover:bg-primary/80 font-mono rounded-none w-full"
          >
            {createSquad.isPending ? "INITIALIZING..." : "EXECUTE_INIT"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
