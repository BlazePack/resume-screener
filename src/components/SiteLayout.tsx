import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Brain, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const nav = [
  { to: "/", label: "Home" },
  { to: "/screening", label: "Screening" },
  { to: "/pipeline", label: "Pipeline" },
  { to: "/bias", label: "Bias" },
  { to: "/compare", label: "Compare" },
  { to: "/ethics", label: "Ethics" },
];

export function SiteLayout() {
  const [present, setPresent] = useState(false);
  const { location } = useRouterState();

  useEffect(() => {
    document.documentElement.classList.toggle("presentation-mode", present);
  }, [present]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="nav-hide-on-present border-b border-border bg-card/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <span className="w-7 h-7 rounded-md bg-primary text-primary-foreground grid place-items-center">
              <Brain className="w-4 h-4" />
            </span>
            <span className="font-display">Resume Screener</span>
            <span className="text-xs px-1.5 py-0.5 rounded bg-warning/20 text-warning-foreground border border-warning/40">
              School project
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-1 text-sm">
            {nav.map((n) => {
              const active = location.pathname === n.to;
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    active
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPresent((p) => !p)}
            title="Presentation mode"
          >
            {present ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            <span className="ml-1 hidden sm:inline">{present ? "Exit" : "Present"}</span>
          </Button>
        </div>
        <div className="md:hidden border-t border-border overflow-x-auto">
          <div className="flex gap-1 px-3 py-2 text-sm">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="px-2.5 py-1 rounded text-muted-foreground hover:bg-muted whitespace-nowrap"
                activeProps={{
                  className:
                    "px-2.5 py-1 rounded bg-primary/10 text-primary font-medium whitespace-nowrap",
                }}
              >
                {n.label}
              </Link>
            ))}
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-border bg-muted/40 mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6 text-xs text-muted-foreground flex flex-col md:flex-row gap-2 md:items-center md:justify-between">
          <p>
            Fake simulation only. No real company uses this site.{" "}
            <Link to="/ethics" className="underline hover:text-foreground">
              Ethics page
            </Link>{" "}
            has more on bias.
          </p>
          <p>High school CS project · {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
}
