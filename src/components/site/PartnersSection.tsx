import { useStore } from "@/context/StoreContext";

export function PartnersSection({ title }: { title: string }) {
  const { partners } = useStore();
  if (!partners.length) return null;
  return (
    <section className="border-t border-border/60 bg-secondary/30">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <h2 className="text-center text-2xl font-semibold tracking-tight md:text-3xl">
          {title}
        </h2>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-8 md:gap-12">
          {partners.map((p) => {
            const inner = p.logoUrl ? (
              <img
                src={p.logoUrl}
                alt={p.name}
                className="h-16 w-auto max-w-[180px] object-contain opacity-80 transition-opacity hover:opacity-100"
              />
            ) : (
              <span className="text-base font-semibold text-muted-foreground">
                {p.name}
              </span>
            );
            return p.websiteUrl ? (
              <a
                key={p.id}
                href={p.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                title={p.name}
              >
                {inner}
              </a>
            ) : (
              <div key={p.id} title={p.name}>
                {inner}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}