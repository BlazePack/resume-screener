import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { fetchBiasDemo, type BiasPair } from "@/lib/api";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";

export const Route = createFileRoute("/bias")({
  head: () => ({
    meta: [
      { title: "Bias Lab — Resume Screener Demo" },
      {
        name: "description",
        content: "Swap names and phrases on identical resumes to see how AI scores can shift.",
      },
    ],
  }),
  component: BiasPage,
});

function BiasPage() {
  const [data, setData] = useState<{ name_swap: BiasPair; phrase_swap: BiasPair } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBiasDemo()
      .then((d) => setData({ name_swap: d.name_swap, phrase_swap: d.phrase_swap }))
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load bias demo"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-12">
      <header>
        <h1 className="text-3xl md:text-4xl font-bold">Bias lab</h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">
          Live scores from identical resumes with only a name or activity phrase changed — the same
          superficial signals that caused real-world hiring-AI controversies.
        </p>
      </header>

      {loading && (
        <p className="text-muted-foreground flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Running bias scenarios…
        </p>
      )}
      {error && <p className="text-destructive text-sm">{error}</p>}

      {data && (
        <>
          <Demo
            title="Name swap"
            explainer={
              <>
                Same resume content; only the candidate&apos;s name is changed. In a fair system the
                score wouldn&apos;t budge.{" "}
                <strong>
                  Reuters reported in 2018 that Amazon scrapped an internal resume tool
                </strong>{" "}
                after it was found to penalize resumes mentioning the word &quot;women&apos;s.&quot;
              </>
            }
            data={data.name_swap}
          />

          <Demo
            title="Phrase swap"
            explainer={
              <>
                Toggling a single activity phrase changes the embedding — and the score. Models
                trained on biased historical hiring data can reproduce those patterns.
              </>
            }
            data={data.phrase_swap}
          />
        </>
      )}
    </div>
  );
}

function Demo({
  title,
  explainer,
  data,
}: {
  title: string;
  explainer: React.ReactNode;
  data: BiasPair;
}) {
  const [b, setB] = useState(false);
  const active = b ? data.variant_b : data.variant_a;
  const chart = [
    { label: data.variant_a.label, score: Math.round(data.variant_a.final_score * 100), key: "a" },
    { label: data.variant_b.label, score: Math.round(data.variant_b.final_score * 100), key: "b" },
  ];

  return (
    <section className="rounded-xl border border-border bg-card p-6">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="mt-4 grid md:grid-cols-[1fr_1fr] gap-6 items-start">
        <div>
          <div className="inline-flex rounded-lg border border-border bg-muted p-1 text-sm">
            <button
              onClick={() => setB(false)}
              className={`px-3 py-1.5 rounded-md ${!b ? "bg-card shadow-sm font-medium" : "text-muted-foreground"}`}
            >
              {data.variant_a.label}
            </button>
            <button
              onClick={() => setB(true)}
              className={`px-3 py-1.5 rounded-md ${b ? "bg-card shadow-sm font-medium" : "text-muted-foreground"}`}
            >
              {data.variant_b.label}
            </button>
          </div>
          <div className="mt-4 rounded-lg border border-border p-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Final score
            </div>
            <div className="text-4xl font-bold mt-1">{Math.round(active.final_score * 100)}%</div>
            <div className="mt-3 text-sm">
              Δ vs variant A:{" "}
              <span
                className={
                  data.delta < 0 ? "text-destructive font-semibold" : "text-success font-semibold"
                }
              >
                {data.delta > 0 ? "+" : ""}
                {Math.round(data.delta * 100)}%
              </span>
            </div>
          </div>
          <div className="mt-4 rounded-lg border border-warning/40 bg-warning/10 p-3 flex gap-2 text-sm">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-warning-foreground" />
            <p>{data.note}</p>
          </div>
        </div>
        <div className="h-64 rounded-lg border border-border p-3">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chart}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="label" fontSize={11} stroke="var(--color-muted-foreground)" />
              <YAxis domain={[0, 100]} fontSize={11} stroke="var(--color-muted-foreground)" />
              <Tooltip
                contentStyle={{
                  background: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 8,
                }}
              />
              <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                {chart.map((d) => (
                  <Cell
                    key={d.key}
                    fill={d.key === "a" ? "var(--color-primary)" : "var(--color-chart-3)"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="mt-4 text-sm text-muted-foreground">{explainer}</div>
    </section>
  );
}
