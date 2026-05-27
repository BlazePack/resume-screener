import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, XCircle, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/ethics")({
  head: () => ({
    meta: [
      { title: "Ethics | Resume Screener" },
      {
        name: "description",
        content: "Pros, cons, and links about automated hiring tools.",
      },
    ],
  }),
  component: Ethics,
});

const benefits = [
  "Fast: can scan lots of resumes quickly.",
  "Same rules for everyone (in theory).",
  "Helps small teams handle big applicant lists.",
];

const risks = [
  "Bias: trained on old hiring data that wasn't fair.",
  "Hard to know why you got filtered out.",
  "Good people can get rejected because of wording.",
  "Bad patterns can repeat if the data stays biased.",
];

const sources = [
  {
    label: "Reuters: Amazon dropped an AI hiring tool (2018)",
    href: "https://www.reuters.com/article/us-amazon-com-jobs-automation-insight-idUSKCN1MK08G",
  },
  {
    label: "NYC law on automated hiring tools",
    href: "https://www.nyc.gov/site/dca/about/automated-employment-decision-tools.page",
  },
  {
    label: "EEOC: AI and disability in hiring",
    href: "https://www.eeoc.gov/laws/guidance/americans-disabilities-act-and-use-software-algorithms-and-artificial-intelligence",
  },
];

function Ethics() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl md:text-4xl font-bold">Ethics & links</h1>
      <p className="mt-2 text-muted-foreground">
        Hiring software affects real people. Here is the short version for our class.
      </p>

      <section className="mt-8 grid md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-success" /> Pros
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {benefits.map((b) => (
              <li key={b}>• {b}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="font-semibold flex items-center gap-2">
            <XCircle className="w-4 h-4 text-destructive" /> Cons
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {risks.map((r) => (
              <li key={r}>• {r}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">Links for your presentation</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {sources.map((s) => (
            <li key={s.href}>
              <a
                href={s.href}
                target="_blank"
                rel="noreferrer"
                className="text-primary hover:underline inline-flex items-center gap-1"
              >
                {s.label} <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-muted-foreground">Add your own sources for the slide deck if you want.</p>
      </section>

      <section className="mt-10 rounded-xl border border-warning/40 bg-warning/10 p-5 text-sm">
        <strong>Note:</strong> This is a student project. Fake resumes, fake scores, not a real hiring system.
      </section>
    </div>
  );
}
