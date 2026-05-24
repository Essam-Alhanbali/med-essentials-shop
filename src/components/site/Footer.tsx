import { Link } from "@tanstack/react-router";
import { useStore } from "@/context/StoreContext";

export function Footer() {
  const { footer } = useStore();
  return (
    <footer className="mt-24 border-t border-border/60">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold tracking-tight">
            <span className="grid h-6 w-6 place-items-center rounded-md bg-primary text-primary-foreground text-xs font-bold">
              +
            </span>
            MedClub Store
          </div>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">{footer.tagline}</p>
        </div>
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">Shop</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/shop" className="hover:text-foreground">All products</Link></li>
            <li><Link to="/shop" className="hover:text-foreground">Diagnostics</Link></li>
            <li><Link to="/shop" className="hover:text-foreground">Apparel</Link></li>
            <li><Link to="/shop" className="hover:text-foreground">Anatomy</Link></li>
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
          <span>{footer.copyright}</span>
          <span>{footer.bottomRight}</span>
        </div>
      </div>
    </footer>
  );
}