import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ShieldAlert, Sparkles, Workflow } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Resume Screener | How hiring AI ranks people" },
      {
        name: "description",
        content:
          "A school project that shows how hiring software reads resumes, scores them, and filters people out.",
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
            Fake simulation (not real hiring)
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight max-w-3xl leading-[1.05]">
            How hiring AI <span className="text-primary">ranks resumes</span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
            This site walks through what a lot of companies do: read the resume, pull out skills, compare
            it to the job, score it, and cut people who score too low. We also show how bias can show up.
            Built for a high school CS class.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/screening">
                Run the demo <ArrowRight className="ml-1 w-4 h-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/pipeline">See the steps</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-20 grid md:grid-cols-3 gap-4">
        {[
          {
            icon: Workflow,
            title: "See the steps",
            body: "Upload, parse, find skills, score, filter. Each step explained.",
            to: "/pipeline",
          },
          {
            icon: Sparkles,
            title: "Score 12 resumes",
            body: "Try the sample intern job. Most scores land in the 70s-90s; a few fall lower on purpose.",
            to: "/screening",
          },
          {
            icon: ShieldAlert,
            title: "Bias & training data",
            body: "Flip between small vs large training sets and watch bias shrink.",
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
