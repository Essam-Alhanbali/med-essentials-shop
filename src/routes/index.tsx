import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import heroImg from "@/assets/hero.jpg";
import { useStore } from "@/context/StoreContext";
import { ProductCard } from "@/components/site/ProductCard";
import { PartnersSection } from "@/components/site/PartnersSection";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "MedClub Store — Essentials for Med School" },
      { name: "description", content: "Stethoscopes, atlases, white coats, and more — curated by your medical students' club." },
    ],
  }),
});

function Index() {
  const { products, categoryDocs, home, site, getCategoryEmoji } = useStore();
  const featured = products.slice(0, 6);
  const heroSrc = site.heroImageUrl || home.heroImageUrl || heroImg;
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 md:grid-cols-2 md:py-28">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Curated by your med school club
            </span>
            <h1 className="mt-5 text-4xl font-semibold leading-[1.05] tracking-tight text-foreground md:text-6xl">
              {home.heroHeadline}
            </h1>
            <p className="mt-5 max-w-md text-base text-muted-foreground md:text-lg">
              {home.heroSubheadline}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/shop"
                className="inline-flex h-11 items-center gap-2 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Shop the catalog
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/about"
                className="inline-flex h-11 items-center rounded-md border border-border bg-background px-5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
              >
                About the club
              </Link>
            </div>
            <dl className="mt-10 grid max-w-md grid-cols-3 gap-6">
              {home.stats.map((s, i) => (
                <div key={i}>
                  <dt className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</dt>
                  <dd className="mt-1 text-2xl font-semibold tracking-tight text-foreground">{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="relative">
            <div className="absolute -inset-6 -z-10 rounded-3xl bg-gradient-to-br from-primary/10 via-transparent to-transparent blur-2xl" />
            <div className="overflow-hidden rounded-2xl border border-border bg-card">
              <img
                src={heroSrc}
                alt="Medical equipment essentials"
                width={1536}
                height={1024}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Value props */}
      <section className="border-y border-border/60 bg-secondary/40">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 sm:grid-cols-3">
          {home.features.map((f, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-md bg-background text-primary">
                <span className="text-lg">{f.icon || "✓"}</span>
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">{f.title}</div>
                <div className="text-sm text-muted-foreground">{f.description}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Shop by category</h2>
            <p className="mt-2 text-sm text-muted-foreground">Find exactly what your rotation calls for.</p>
          </div>
          <Link to="/shop" className="text-sm font-medium text-primary hover:underline">
            View all →
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-5">
          {categoryDocs.map((c) => (
            <Link
              key={c.id}
              to="/shop"
              search={{ category: c.name }}
              className="group rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/40 hover:bg-accent"
            >
              <div className="text-2xl">{c.emoji || getCategoryEmoji(c.name)}</div>
              <div className="mt-3 text-sm font-medium text-foreground">{c.name}</div>
              <div className="text-xs text-muted-foreground group-hover:text-primary">Browse →</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Featured this semester</h2>
          <Link to="/shop" className="text-sm font-medium text-primary hover:underline">
            All products →
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
      <PartnersSection title="Sponsored by" />
    </div>
  );
}
