import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { fetchBiasDemo, type MethodCompareRow } from "@/lib/api";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

export const Route = createFileRoute("/compare")({
  head: () => ({
    meta: [
      { title: "Compare methods — Semantic AI vs TF-IDF" },
      {
        name: "description",
        content:
          "Toggle between embedding-based and keyword-based scoring to see how rankings differ.",
      },
    ],
  }),
  component: Compare,
});

function Compare() {
  const [mode, setMode] = useState<"both" | "semantic" | "tfidf">("both");
  const [data, setData] = useState<MethodCompareRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBiasDemo()
      .then((d) => setData(d.method_compare))
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load comparison data"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl md:text-4xl font-bold">Compare methods</h1>
      <p className="mt-2 text-muted-foreground max-w-2xl">
        The same candidates can rank very differently depending on the algorithm. Embeddings capture
        meaning; TF-IDF counts keyword overlap.
      </p>

      <div className="mt-6 inline-flex rounded-lg border border-border bg-muted p-1 text-sm">
        {(["both", "semantic", "tfidf"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-3 py-1.5 rounded-md capitalize ${mode === m ? "bg-card shadow-sm font-medium" : "text-muted-foreground"}`}
          >
            {m === "both" ? "Both" : m === "tfidf" ? "TF-IDF" : "Semantic"}
          </button>
        ))}
      </div>

      {loading && (
        <p className="mt-6 text-muted-foreground flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading scores…
        </p>
      )}
      {error && <p className="mt-4 text-destructive text-sm">{error}</p>}

      {data.length > 0 && (
        <div className="mt-6 rounded-xl border border-border bg-card p-5 h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="name" stroke="var(--color-muted-foreground)" fontSize={11} />
              <YAxis domain={[0, 100]} stroke="var(--color-muted-foreground)" fontSize={11} />
              <Tooltip
                contentStyle={{
                  background: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 8,
                }}
              />
              <Legend />
              {(mode === "both" || mode === "semantic") && (
                <Bar
                  name="Semantic"
                  dataKey="semantic"
                  fill="var(--color-primary)"
                  radius={[6, 6, 0, 0]}
                />
              )}
              {(mode === "both" || mode === "tfidf") && (
                <Bar
                  name="TF-IDF"
                  dataKey="tfidf"
                  fill="var(--color-chart-3)"
                  radius={[6, 6, 0, 0]}
                />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="mt-6 rounded-xl border border-border bg-accent/30 p-5 text-sm">
        <p className="font-medium">Teaching moment</p>
        <p className="mt-1 text-muted-foreground">
          Rankings can diverge when one method rewards exact keywords and another rewards similar
          meaning. Neither approach is automatically fair — both need human oversight and bias
          testing.
        </p>
      </div>
    </div>
  );
}
