import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@/context/StoreContext";
import { PartnersSection } from "@/components/site/PartnersSection";

export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () => ({
    meta: [
      { title: "About Us — MedClub Store" },
      { name: "description", content: "About the medical students' club behind the store." },
    ],
  }),
});

function AboutPage() {
  const { about } = useStore();

  return (
    <div>
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="max-w-3xl">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">About Us</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
          {about.heading}
        </h1>
        <div className="mt-8 space-y-5 text-base leading-relaxed text-muted-foreground">
          <p>{about.intro}</p>
          <p>{about.body}</p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {about.stats.map((s, i) => (
            <div key={i} className="rounded-lg border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</div>
              <div className="mt-1 text-2xl font-semibold tracking-tight">{s.value}</div>
            </div>
          ))}
        </div>
        {about.imageUrl && (
          <img src={about.imageUrl} alt="" className="mt-10 w-full rounded-lg border border-border object-cover" />
        )}
        </div>
      </div>
      <PartnersSection title="Our partners" />
    </div>
  );
}