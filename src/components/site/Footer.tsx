import { Link } from "@tanstack/react-router";
import { useStore } from "@/context/StoreContext";

export function Footer() {
  const { footer, categoryDocs, site, partners } = useStore();
  const selected = footer.shopCategoryIds.length
    ? categoryDocs.filter((c) => footer.shopCategoryIds.includes(c.id))
    : categoryDocs;
  const year = new Date().getFullYear();
  return (
    <footer className="mt-24 border-t border-border/60">
      {partners.length > 0 && (
        <div className="border-b border-border/60 bg-secondary/30">
          <div className="mx-auto max-w-7xl px-6 py-8">
            <h4 className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Sponsored by
            </h4>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-8 md:gap-14">
              {partners.map((p) => {
                const inner = p.logoUrl ? (
                  <img src={p.logoUrl} alt={p.name} className="h-20 w-auto max-w-[240px] object-contain opacity-90 transition-opacity hover:opacity-100" />
                ) : (
                  <span className="text-base font-semibold text-muted-foreground">{p.name}</span>
                );
                return p.websiteUrl ? (
                  <a key={p.id} href={p.websiteUrl} target="_blank" rel="noopener noreferrer" title={p.name}>{inner}</a>
                ) : (
                  <div key={p.id} title={p.name}>{inner}</div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold tracking-tight">
            {site.logoUrl ? (
              <img src={site.logoUrl} alt="MedClub Store" className="h-6 w-6 rounded-md object-cover" />
            ) : (
              <span className="grid h-6 w-6 place-items-center rounded-md bg-primary text-primary-foreground text-xs font-bold">
                +
              </span>
            )}
            MedClub Store
          </div>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">{footer.tagline}</p>
        </div>
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">Shop</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/shop" className="hover:text-foreground">All products</Link></li>
            {selected.map((c) => (
              <li key={c.id}>
                <Link to="/shop" search={{ category: c.name }} className="hover:text-foreground">
                  <span className="mr-1">{c.emoji ?? "📦"}</span>{c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">Club</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/about" className="hover:text-foreground">About Us</Link></li>
            <li><Link to="/about" hash="contact" className="hover:text-foreground">Contact</Link></li>
            <li><Link to="/about" hash="faq" className="hover:text-foreground">FAQ</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">Get in touch</h4>
          <p className="mt-3 text-sm text-muted-foreground">{footer.email}</p>
          <p className="text-sm text-muted-foreground">{footer.address}</p>
        </div>
      </div>
      <div className="border-t border-border/60">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-6 py-5 text-xs text-muted-foreground sm:flex-row">
          <span>{footer.copyright.replace("{year}", String(year))}</span>
          <span>{footer.bottomRight}</span>
        </div>
      </div>
    </footer>
  );
}