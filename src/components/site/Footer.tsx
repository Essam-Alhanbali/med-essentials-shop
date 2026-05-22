import { Link } from "@tanstack/react-router";

export function Footer() {
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
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            Equipment, books, and apparel — curated by med students, for med students.
          </p>
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
            <li><Link to="/about" className="hover:text-foreground">About</Link></li>
            <li><Link to="/contact" className="hover:text-foreground">Contact</Link></li>
            <li><Link to="/contact" className="hover:text-foreground">FAQ</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">Get in touch</h4>
          <p className="mt-3 text-sm text-muted-foreground">store@medclub.edu</p>
          <p className="text-sm text-muted-foreground">Student Union, Room 204</p>
        </div>
      </div>
      <div className="border-t border-border/60">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-6 py-5 text-xs text-muted-foreground sm:flex-row">
          <span>© {new Date().getFullYear()} MedClub Store. All rights reserved.</span>
          <span>Built for students, by students.</span>
        </div>
      </div>
    </footer>
  );
}