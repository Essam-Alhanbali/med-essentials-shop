import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () => ({
    meta: [
      { title: "About — MedClub Store" },
      { name: "description", content: "Learn about the medical students' club behind the store." },
    ],
  }),
});

function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">About</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
        Built by med students, for med students.
      </h1>
      <div className="mt-8 space-y-5 text-base leading-relaxed text-muted-foreground">
        <p>
          MedClub Store is run entirely by the medical students' club at our university. We
          negotiate directly with manufacturers and distributors so that essential equipment —
          from your first stethoscope to your white coat — is available at a price every student
          can afford.
        </p>
        <p>
          Every dollar of margin goes back into club activities: free tutoring, anatomy lab
          sessions, mental health programming, and outreach in the local community.
        </p>
        <p>
          Have a product you'd like us to carry? Drop us a note on the{" "}
          <Link to="/contact" className="text-primary hover:underline">contact page</Link>.
        </p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-3">
        {[
          { k: "Founded", v: "2019" },
          { k: "Active members", v: "1,200+" },
          { k: "Reinvested", v: "$48k" },
        ].map((s) => (
          <div key={s.k} className="rounded-lg border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">{s.k}</div>
            <div className="mt-1 text-2xl font-semibold tracking-tight">{s.v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}