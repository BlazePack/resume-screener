import { createFileRoute } from "@tanstack/react-router";
import { FileText, ScanText, Tags, Brain, Calculator, Filter, ArrowRight, Database } from "lucide-react";

export const Route = createFileRoute("/pipeline")({
  head: () => ({
    meta: [
      { title: "Pipeline | Resume Screener" },
      {
        name: "description",
        content: "Steps: upload, parse, find skills, score, filter.",
      },
    ],
  }),
  component: Pipeline,
});

const steps = [
  {
    icon: FileText,
    title: "Upload",
    body: "Load resume files into the system.",
    module: "ingest",
  },
  {
    icon: ScanText,
    title: "Parse text",
    body: "Clean up the text and split it into sections.",
    module: "parser",
  },
  {
    icon: Tags,
    title: "Find skills & names",
    body: "Pull out skills, schools, companies, and dates (NER).",
    module: "ner_extractor",
  },
  {
    icon: Brain,
    title: "Compare to job",
    body: "Match the resume to the job description (embeddings or TF-IDF).",
    module: "semantic_scorer",
  },
  {
    icon: Calculator,
    title: "Final score",
    body: "Combine match score + skills + other signals into one number.",
    module: "ranker",
  },
  {
    icon: Filter,
    title: "Filter",
    body: "High scores go to human review. Low scores get rejected.",
    module: "ranker",
  },
  {
    icon: Database,
    title: "Training data matters",
    body: "Small skewed datasets amplify bias (names, club wording). Large diverse sets + debiasing reduce it.",
    module: "training_regime",
  },
];

function Pipeline() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl md:text-4xl font-bold">How it works</h1>
      <p className="mt-2 text-muted-foreground max-w-2xl">
        Same steps as the Python code behind this site. Each box matches a file in the backend folder.
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
                <p className="mt-2 text-xs font-mono text-primary">backend/screener/{s.module}.py</p>
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
