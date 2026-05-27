import { createFileRoute } from "@tanstack/react-router";
import { Fragment, useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Loader2, Play } from "lucide-react";
import { fetchScreening, type Candidate, type ScreeningResult } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

export const Route = createFileRoute("/screening")({
  head: () => ({
    meta: [
      { title: "Screening Dashboard — AI Resume Screener Demo" },
      {
        name: "description",
        content: "Score and rank sample candidates against a sample job description.",
      },
    ],
  }),
  component: Screening,
});

type SortKey = "rank" | "name" | "semantic_score" | "skill_match" | "final_score";

function pct(n: number) {
  return `${Math.round(n * 100)}%`;
}

function StatusBadge({ d }: { d: string }) {
  if (d === "human_review")
    return (
      <Badge className="bg-success text-success-foreground hover:bg-success/90">Human review</Badge>
    );
  return (
    <Badge variant="secondary" className="text-muted-foreground">
      Rejected
    </Badge>
  );
}

function Screening() {
  const [job, setJob] = useState("se-intern");
  const [result, setResult] = useState<ScreeningResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({
    key: "final_score",
    dir: "desc",
  });

  const runScore = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchScreening(job);
      setResult(data);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Could not reach the screening API. Is the Python server running on port 8000?",
      );
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const candidates = useMemo(() => {
    if (!result) return [];
    const arr = [...result.candidates].sort((a, b) => {
      const k = sort.key;
      if (k === "name")
        return sort.dir === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      const av = (a as Record<string, number>)[k === "rank" ? "final_score" : k];
      const bv = (b as Record<string, number>)[k === "rank" ? "final_score" : k];
      return sort.dir === "asc" ? av - bv : bv - av;
    });
    return arr;
  }, [result, sort]);

  const topFive = useMemo(() => {
    if (!result) return [];
    return [...result.candidates]
      .sort((a, b) => b.final_score - a.final_score)
      .slice(0, 5)
      .map((c) => ({ name: c.name.split(" ")[0], score: Math.round(c.final_score * 100) }));
  }, [result]);

  const toggleSort = (k: SortKey) =>
    setSort((s) => ({ key: k, dir: s.key === k && s.dir === "desc" ? "asc" : "desc" }));

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold">Screening dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          Pick a sample job, load the resumes, then score and rank with the live NLP pipeline.
        </p>
      </header>

      <section className="rounded-xl border border-border bg-card p-5 mb-8">
        <div className="grid md:grid-cols-[1fr_1fr_auto] gap-4 items-end">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Job description</label>
            <Select value={job} onValueChange={setJob}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="se-intern">Software Engineer Intern</SelectItem>
              </SelectContent>
            </Select>
            <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
              {result?.job_description ??
                "Looking for Python, web dev, Git, SQL, and teamwork — scored with embeddings + NER."}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Resumes</label>
            <div className="h-9 px-3 rounded-md border border-input bg-background flex items-center text-sm">
              8 sample resumes from data/resumes/
            </div>
          </div>
          <Button size="lg" onClick={runScore} disabled={loading}>
            {loading ? (
              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
            ) : (
              <Play className="w-4 h-4 mr-1" />
            )}
            Score & Rank
          </Button>
        </div>
        {error && (
          <p className="mt-4 text-sm text-destructive rounded-md border border-destructive/30 bg-destructive/10 p-3">
            {error}
          </p>
        )}
      </section>

      {result && (
        <>
          <section className="rounded-xl border border-border bg-card p-5 mb-8">
            <h2 className="text-lg font-semibold mb-4">Top 5 final scores</h2>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topFive} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    stroke="var(--color-muted-foreground)"
                    fontSize={12}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke="var(--color-muted-foreground)"
                    fontSize={12}
                    width={80}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-card)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 8,
                    }}
                  />
                  <Bar dataKey="score" fill="var(--color-primary)" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <SortableHead
                      onClick={() => toggleSort("rank")}
                      active={sort.key === "rank"}
                      dir={sort.dir}
                    >
                      #
                    </SortableHead>
                    <SortableHead
                      onClick={() => toggleSort("name")}
                      active={sort.key === "name"}
                      dir={sort.dir}
                    >
                      Candidate
                    </SortableHead>
                    <SortableHead
                      onClick={() => toggleSort("semantic_score")}
                      active={sort.key === "semantic_score"}
                      dir={sort.dir}
                    >
                      Semantic
                    </SortableHead>
                    <SortableHead
                      onClick={() => toggleSort("skill_match")}
                      active={sort.key === "skill_match"}
                      dir={sort.dir}
                    >
                      Skill match
                    </SortableHead>
                    <SortableHead
                      onClick={() => toggleSort("final_score")}
                      active={sort.key === "final_score"}
                      dir={sort.dir}
                    >
                      Final
                    </SortableHead>
                    <TableHead>Status</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {candidates.map((c, i) => (
                    <Fragment key={c.id}>
                      <TableRow
                        className="cursor-pointer"
                        onClick={() => setExpanded(expanded === c.id ? null : c.id)}
                      >
                        <TableCell className="font-mono text-muted-foreground">{i + 1}</TableCell>
                        <TableCell className="font-medium">{c.name}</TableCell>
                        <TableCell>{pct(c.semantic_score)}</TableCell>
                        <TableCell>{pct(c.skill_match)}</TableCell>
                        <TableCell className="font-semibold">{pct(c.final_score)}</TableCell>
                        <TableCell>
                          <StatusBadge d={c.decision} />
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {expanded === c.id ? (
                            <ChevronUp className="w-4 h-4 inline" />
                          ) : (
                            <ChevronDown className="w-4 h-4 inline" />
                          )}
                        </TableCell>
                      </TableRow>
                      {expanded === c.id && (
                        <TableRow className="bg-muted/40 hover:bg-muted/40">
                          <TableCell colSpan={7}>
                            <Expanded c={c} />
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="md:hidden divide-y divide-border">
              {candidates.map((c, i) => (
                <div key={c.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-muted-foreground">#{i + 1}</div>
                      <div className="font-medium">{c.name}</div>
                    </div>
                    <StatusBadge d={c.decision} />
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                    <Stat label="Semantic" v={pct(c.semantic_score)} />
                    <Stat label="Skills" v={pct(c.skill_match)} />
                    <Stat label="Final" v={pct(c.final_score)} bold />
                  </div>
                  <button
                    onClick={() => setExpanded(expanded === c.id ? null : c.id)}
                    className="mt-3 text-xs text-primary font-medium"
                  >
                    {expanded === c.id ? "Hide details" : "What the AI saw"}
                  </button>
                  {expanded === c.id && (
                    <div className="mt-3">
                      <Expanded c={c} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function SortableHead({
  children,
  onClick,
  active,
  dir,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active: boolean;
  dir: "asc" | "desc";
}) {
  return (
    <TableHead>
      <button
        onClick={onClick}
        className={`inline-flex items-center gap-1 text-xs font-medium ${active ? "text-foreground" : ""}`}
      >
        {children}
        {active &&
          (dir === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
      </button>
    </TableHead>
  );
}

function Stat({ label, v, bold }: { label: string; v: string; bold?: boolean }) {
  return (
    <div className="rounded-md bg-muted px-2 py-1.5">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={bold ? "font-semibold" : ""}>{v}</div>
    </div>
  );
}

function Expanded({ c }: { c: Candidate }) {
  return (
    <div className="grid md:grid-cols-3 gap-4 py-2 text-sm">
      <Block title="Skills (NER)">
        <div className="flex flex-wrap gap-1.5">
          {c.extracted.skills.map((s) => (
            <Badge key={s} variant="outline">
              {s}
            </Badge>
          ))}
        </div>
      </Block>
      <Block title="Organizations">
        <ul className="text-muted-foreground space-y-0.5">
          {c.extracted.organizations.length ? (
            c.extracted.organizations.map((o) => <li key={o}>• {o}</li>)
          ) : (
            <li className="text-xs">None detected — using date/skill signals only.</li>
          )}
        </ul>
      </Block>
      <Block title="Dates">
        <p className="text-muted-foreground">{c.extracted.dates.join(", ") || "—"}</p>
      </Block>
      <div className="md:col-span-3 rounded-md border border-border bg-card p-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Why this score
        </span>
        <p className="mt-1">{c.explanation}</p>
      </div>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
        {title}
      </div>
      {children}
    </div>
  );
}
