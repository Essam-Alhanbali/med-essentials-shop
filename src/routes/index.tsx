import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import heroImg from "@/assets/hero.jpg";
import { useStore } from "@/context/StoreContext";
import { ProductCard } from "@/components/site/ProductCard";
import { getImageUrl, getImageSrcSet } from "@/lib/getImageUrl";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "MedClub Store — Essentials for Med School" },
      {
        name: "description",
        content:
          "Stethoscopes, atlases, white coats, and more — curated by your medical students' club.",
      },
    ],
  }),
});

function Index() {
  const { products, categoryDocs, home, site, getCategoryEmoji } = useStore();
  const [studentYear, setStudentYear] = useState<string | null>(null);
  const [showYearPrompt, setShowYearPrompt] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const sy = localStorage.getItem("medclub.studentYear");
    if (sy) setStudentYear(sy);
    else setShowYearPrompt(true);
  }, []);

  function pickYear(y: string) {
    localStorage.setItem("medclub.studentYear", y);
    setStudentYear(y);
    setShowYearPrompt(false);
  }

  const featuredIds = home.featuredProductIds ?? [];
  const featured = featuredIds.length
    ? featuredIds
        .map((id) => products.find((p) => p.id === id))
        .filter((p): p is (typeof products)[number] => Boolean(p))
    : products.slice(0, 6);
  const heroSrc = site.heroImageUrl || home.heroImageUrl || heroImg;
  return (
    <div>
      {/* Hero */}
      <section className="mb-25 shadow-sec">
        <div className="w-screen">
          <div className="relative h-full w-full">
            <img
              src={getImageUrl(heroSrc, { w: 1200 }) || heroSrc}
              srcSet={getImageSrcSet(heroSrc, [640, 960, 1200, 1536])}
              sizes="(min-width: 768px) 50vw, 100vw"
              alt="Medical equipment essentials"
              width={1536}
              height={1024}
              loading="eager"
              fetchPriority="high"
              decoding="async"
              className="h-full w-full object-cover"
            />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex-col justify-center items-center p-10 rounded-4xl bg-[#FFFFFFEE] text-nowrap">
              <h1
                className="mt-5 text-4xl font-semibold leading-[1.05] tracking-tight text-foreground md:text-6xl mb-10"
                dangerouslySetInnerHTML={{ __html: home.heroHeadline }}
              ></h1>
              <div className="mt-8 flex flex-wrap justify-center items-center gap-3">
                <Link
                  to="/about"
                  className="inline-flex h-11 items-center rounded-md border border-border bg-background px-5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                >
                  About the club
                </Link>
                <Link
                  to="/shop"
                  className="inline-flex h-11 items-center gap-2 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Shop the catalog
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value props */}
      {/* <section className="border-y border-border/60 bg-secondary/40">
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
      </section> */}
      {/* Categories */}

      <section className="mx-auto max-w-7xl px-6 py-16 mb-10 shadow-sec mb-25">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Shop by category</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Find exactly what your rotation calls for.
            </p>
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
      <section className="mx-auto max-w-7xl px-6 pb-20 shadow-sec px-6 py-16 mb-25">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Featured this semester
          </h2>
          <Link to="/shop" className="text-sm font-medium text-primary hover:underline">
            All products →
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p, i) => (
            <ProductCard key={p.id} product={p} priority={i < 3} />
          ))}
        </div>
      </section>

      {/* Year prompt */}
      {showYearPrompt && (
        <section className="border-y border-brand-red/20 bg-brand-red/5 shadow-sec mb-10">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-5">
            <div>
              <div className="text-sm font-semibold">Shopping for which year?</div>
              <div className="text-xs text-muted-foreground">
                We'll pre-filter the shop to items recommended for you.
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {["Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6"].map((y) => (
                <button
                  key={y}
                  onClick={() => pickYear(y)}
                  className="rounded-full border border-brand-red/30 bg-background px-3 py-1 text-xs font-medium hover:bg-brand-red hover:text-white"
                >
                  {y}
                </button>
              ))}
              <button
                onClick={() => setShowYearPrompt(false)}
                className="rounded-full px-3 py-1 text-xs text-muted-foreground hover:text-foreground"
              >
                Not now
              </button>
            </div>
          </div>
        </section>
      )}
      {studentYear && (
        <section className="border-y border-border bg-secondary/40 mb-10 shadow-sec mb-10">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3 text-xs">
            <span>
              Recommendations tuned for <strong>{studentYear}</strong>.
            </span>
            <Link
              to="/shop"
              search={{ year: studentYear }}
              className="font-medium text-brand-red hover:underline"
            >
              Browse your shop →
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
