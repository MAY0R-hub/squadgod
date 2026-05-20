import { Link, useLocation } from "wouter";
import { Activity } from "lucide-react";
function Navbar() {
  const [location] = useLocation();
  return <nav className="border-b border-primary/20 bg-background/95 backdrop-blur z-50 sticky top-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <Activity className="h-6 w-6 text-primary" />
              <span className="font-mono text-xl font-bold tracking-widest text-primary glow-text">SQUADGOD</span>
            </Link>
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-4">
                <NavLink href="/" active={location === "/"}>DASHBOARD</NavLink>
                <NavLink href="/players" active={location.startsWith("/players")}>PLAYERS</NavLink>
                <NavLink href="/squads" active={location.startsWith("/squads")}>SQUADS</NavLink>
                <NavLink href="/matches" active={location.startsWith("/matches")}>PREDICTIONS</NavLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>;
}
function NavLink({ href, active, children }) {
  return <Link
    href={href}
    className={`px-3 py-2 text-sm font-mono tracking-wider transition-all duration-200 border-b-2 ${active ? "border-primary text-primary glow-text bg-primary/5" : "border-transparent text-muted-foreground hover:text-primary hover:border-primary/50"}`}
  >
      {children}
    </Link>;
}
export {
  Navbar
};
