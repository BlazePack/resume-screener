import { createFileRoute } from "@tanstack/react-router";
import { FileText, ScanText, Tags, Brain, Calculator, Filter, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/pipeline")({
  head: () => ({
    meta: [
      { title: "Pipeline — How the AI Resume Screener works" },
      {
        name: "description",
        content: "Step-by-step: upload, parse, NER, embeddings, weighted score, filter.",
      },
    ],
  }),
  component: Pipeline,
});

const steps = [
  {
    icon: FileText,
    title: "Upload",
    body: "Resume PDFs or text files are loaded into the system.",
    module: "uploader",
  },
  {
    icon: ScanText,
    title: "Parse text",
    body: "Raw text is extracted and cleaned of formatting noise.",
    module: "parser",
  },
  {
    icon: Tags,
    title: "NER extraction",
    body: "Named-entity recognition pulls out skills, organizations, schools, and dates.",
    module: "ner_extractor",
  },
  {
    icon: Brain,
    title: "Embeddings",
    body: "The resume and job description are turned into vectors so we can compare meaning, not just keywords.",
    module: "semantic_scorer",
  },
  {
    icon: Calculator,
    title: "Weighted score",
    body: "Semantic similarity and explicit skill matches combine into a final score (0–100%).",
    module: "scorer",
  },
  {
    icon: Filter,
    title: "Filter",
    body: "Candidates above a threshold are flagged for human review; the rest are rejected.",
    module: "filter",
  },
];

function Pipeline() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl md:text-4xl font-bold">The pipeline</h1>
      <p className="mt-2 text-muted-foreground max-w-2xl">
        This mirrors the Python CLI behind the demo. Each step has a real module you can read.
      </p>

      <ol className="mt-10 space-y-4">
        {steps.map((s, i) => (
          <li key={s.title} className="relative">
            <div className="rounded-xl border border-border bg-card p-5 flex gap-4 items-start">
              <div className="shrink-0 w-11 h-11 rounded-lg bg-primary/10 text-primary grid place-items-center">
                <s.icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-muted-foreground">0{i + 1}</span>
                  <h3 className="font-semibold">{s.title}</h3>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
                <p className="mt-2 text-xs font-mono text-primary">
                  See the code module: {s.module}.py
                </p>
              </div>
            </div>
            {i < steps.length - 1 && (
              <div className="flex justify-center py-1 text-muted-foreground">
                <ArrowRight className="w-4 h-4 rotate-90" />
              </div>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
