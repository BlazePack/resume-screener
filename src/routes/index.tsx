import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ShieldAlert, Sparkles, Workflow } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AI Resume Screener — How algorithms rank candidates" },
      {
        name: "description",
        content:
          "An educational demo of how AI hiring tools parse resumes, score them, and filter applicants. Built as a high school CS project.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-accent/40 via-background to-background" />
        <div className="max-w-6xl mx-auto px-4 pt-20 pb-24 md:pt-28 md:pb-32">
          <div className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1 rounded-full bg-warning/20 text-warning-foreground border border-warning/40 mb-6">
            <ShieldAlert className="w-3.5 h-3.5" />
            Educational simulation — not used in real hiring
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight max-w-3xl leading-[1.05]">
            How AI hiring tools <span className="text-primary">rank resumes</span>.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
            Walk through the same pipeline real screening systems use — parse, extract, embed, score
            — and see where bias can sneak in. Built for a high school CS class.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/screening">
                Run the demo <ArrowRight className="ml-1 w-4 h-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/pipeline">See the pipeline</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-20 grid md:grid-cols-3 gap-4">
        {[
          {
            icon: Workflow,
            title: "See the pipeline",
            body: "Parse → NER → Embeddings → Score → Filter. Each step in plain English.",
            to: "/pipeline",
          },
          {
            icon: Sparkles,
            title: "Score 8 candidates",
            body: "Run a sample Software Engineer Intern role and inspect the rankings.",
            to: "/screening",
          },
          {
            icon: ShieldAlert,
            title: "Probe for bias",
            body: "Swap names and phrases on identical resumes — watch the score move.",
            to: "/bias",
          },
        ].map((c) => (
          <Link
            key={c.title}
            to={c.to}
            className="group rounded-xl border border-border bg-card p-6 hover:border-primary/40 hover:shadow-sm transition"
          >
            <c.icon className="w-6 h-6 text-primary" />
            <h3 className="mt-4 font-semibold text-lg">{c.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{c.body}</p>
            <span className="mt-4 inline-flex items-center text-sm font-medium text-primary">
              Open <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-0.5 transition" />
            </span>
          </Link>
        ))}
      </section>
    </div>
  );
}
