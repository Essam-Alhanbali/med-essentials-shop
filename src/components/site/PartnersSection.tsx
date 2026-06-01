import { useStore } from "@/context/StoreContext";

export function PartnersSection({ title }: { title: string }) {
  const { partners } = useStore();
  if (!partners.length) return null;
  return (
    <section className="border-t border-border/60 bg-secondary/30">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="max-w-3xl">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Partners</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">{title}</h2>
          <p className="mt-4 text-base text-muted-foreground">
            We're proud to collaborate with organizations that support our mission and our students.
          </p>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {partners.map((p) => {
            const logo = p.logoUrl ? (
              <img
                src={p.logoUrl}
                alt={p.name}
                className="h-20 w-auto max-w-[200px] object-contain"
              />
            ) : null;
            const content = (
              <>
                <div className="flex h-24 items-center">{logo}</div>
                <div className="mt-2 text-base font-semibold tracking-tight text-foreground">{p.name}</div>
                {p.description && (
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.description}</p>
                )}
              </>
            );
            return (
              <div
                key={p.id}
                className="rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/40"
              >
                {p.websiteUrl ? (
                  <a
                    href={p.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    {content}
                  </a>
                ) : (
                  content
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}