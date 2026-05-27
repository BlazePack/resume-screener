import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, XCircle, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/ethics")({
  head: () => ({
    meta: [
      { title: "Ethics & sources — AI Resume Screener Demo" },
      {
        name: "description",
        content: "Benefits, risks, and further reading on automated hiring tools.",
      },
    ],
  }),
  component: Ethics,
});

const benefits = [
  "Speed: thousands of resumes scanned in minutes.",
  "Consistency: the same rubric applied to every applicant.",
  "Scale: small HR teams can handle large applicant pools.",
];

const risks = [
  "Bias: models trained on past hiring can reproduce historical discrimination.",
  "Opacity: candidates rarely know they were filtered or why.",
  "False negatives: qualified people can be screened out by phrasing or formatting.",
  "Feedback loops: rejected groups stay underrepresented in future training data.",
];

const sources = [
  {
    label: "Reuters: Amazon scraps secret AI recruiting tool (2018)",
    href: "https://www.reuters.com/article/us-amazon-com-jobs-automation-insight-idUSKCN1MK08G",
  },
  {
    label: "NYC Local Law 144 — Automated Employment Decision Tools",
    href: "https://www.nyc.gov/site/dca/about/automated-employment-decision-tools.page",
  },
  {
    label: "EEOC: AI and the ADA in employment",
    href: "https://www.eeoc.gov/laws/guidance/americans-disabilities-act-and-use-software-algorithms-and-artificial-intelligence",
  },
];

function Ethics() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl md:text-4xl font-bold">Ethics & sources</h1>
      <p className="mt-2 text-muted-foreground">
        Automated screening tools are powerful — and high-stakes. Here's the short version.
      </p>

      <section className="mt-8 grid md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-success" /> Benefits
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {benefits.map((b) => (
              <li key={b}>• {b}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="font-semibold flex items-center gap-2">
            <XCircle className="w-4 h-4 text-destructive" /> Risks
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {risks.map((r) => (
              <li key={r}>• {r}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">Further reading</h2>
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
        <p className="mt-3 text-xs text-muted-foreground">
          Add your own citations for the class presentation here.
        </p>
      </section>

      <section className="mt-10 rounded-xl border border-warning/40 bg-warning/10 p-5 text-sm">
        <strong>Disclaimer:</strong> This site is a student-built educational simulation. It does
        not store real personal data, it is not used by any real employer, and the sample resumes
        and scores are fictional.
      </section>
    </div>
  );
}
