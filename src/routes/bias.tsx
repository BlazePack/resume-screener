import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { fetchBiasDemoFull, type BiasPair, type FullBiasResult } from "@/lib/api";
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
      { title: "Bias tests | Resume Screener" },
      {
        name: "description",
        content: "Compare small vs large training data and see how bias changes.",
      },
    ],
  }),
  component: BiasPage,
});

type TrainingPick = "low_data" | "heavy_data";

function BiasPage() {
  const [data, setData] = useState<FullBiasResult | null>(null);
  const [mode, setMode] = useState<TrainingPick>("low_data");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBiasDemoFull()
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : "Could not load bias demo"))
      .finally(() => setLoading(false));
  }, []);

  const active = data?.[mode];

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-10">
      <header>
        <h1 className="text-3xl md:text-4xl font-bold">Bias & training data</h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">
          Real hiring models learn from past resumes and hires. A small or one-sided training set
          often picks up shortcuts (names, club names). A large, diverse set plus debiasing can
          reduce that.
        </p>
      </header>

      <section className="rounded-xl border border-border bg-card p-5">
        <p className="text-sm font-medium mb-3">Training data size</p>
        <div className="inline-flex rounded-lg border border-border bg-muted p-1 text-sm">
          <ModeButton
            active={mode === "low_data"}
            onClick={() => setMode("low_data")}
            label="Small dataset"
          />
          <ModeButton
            active={mode === "heavy_data"}
            onClick={() => setMode("heavy_data")}
            label="Large diverse dataset"
          />
        </div>
        {active && <p className="mt-3 text-sm text-muted-foreground">{active.description}</p>}
      </section>

      {loading && (
        <p className="text-muted-foreground flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading…
        </p>
      )}
      {error && <p className="text-destructive text-sm">{error}</p>}

      {active && data && (
        <>
          <Demo
            title="Name swap (same resume)"
            explainer="Only the name changes. If scores move a lot, the model is using the name as a signal."
            data={active.name_swap}
          />
          <Demo
            title="Phrase swap (same resume)"
            explainer={'Changing "Coding Club" to "Women\'s Coding Club" should not change the score in a fair system.'}
            data={active.phrase_swap}
          />
        </>
      )}
    </div>
  );
}

function ModeButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-md ${active ? "bg-card shadow-sm font-medium" : "text-muted-foreground"}`}
    >
      {label}
    </button>
  );
}

function Demo({ title, explainer, data }: { title: string; explainer: string; data: BiasPair }) {
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
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Final score</div>
            <div className="text-4xl font-bold mt-1">{Math.round(active.final_score * 100)}%</div>
            <div className="mt-3 text-sm">
              Gap:{" "}
              <span
                className={
                  Math.abs(data.delta) >= 0.05 ? "text-destructive font-semibold" : "text-success font-semibold"
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
      <p className="mt-4 text-sm text-muted-foreground">{explainer}</p>
    </section>
  );
}
