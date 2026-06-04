import { Link } from "@tanstack/react-router";
import { ShoppingBag, Menu, Heart, Shield } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import { useStore } from "@/context/StoreContext";
import { useState } from "react";

const nav = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/about", label: "About Us" },
  { to: "/contact", label: "Contact" },
] as const;

export function Navbar() {
  const { totalItems } = useCart();
  const { count: wishCount } = useWishlist();
  const { user } = useAuth();
  const { site } = useStore();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex min-w-0 items-center gap-2 text-base font-semibold tracking-tight">
          {site.logoUrl ? (
            <img src={site.logoUrl} alt="MedClub Store" className="h-7 w-7 rounded-md object-cover" />
          ) : (
            <span className="grid h-7 w-7 place-items-center rounded-md bg-primary text-primary-foreground">
              <span className="text-sm font-bold">+</span>
            </span>
          )}
          <span className="truncate">MedClub Store</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              activeProps={{ className: "text-foreground" }}
              inactiveProps={{ className: "text-muted-foreground hover:text-foreground" }}
              className="text-sm transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <Link
            to={user ? "/admin" : "/admin/login"}
            className="inline-flex h-9 items-center gap-1.5 rounded-md px-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground sm:px-3"
            aria-label="Admin"
          >
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Admin</span>
          </Link>
          <Link
            to="/wishlist"
            className="relative inline-flex h-9 items-center gap-1.5 rounded-md px-2 text-sm text-foreground hover:bg-accent sm:px-3 sm:gap-2"
            aria-label="Wishlist"
          >
            <Heart className={`h-4 w-4 ${wishCount > 0 ? "fill-brand-red text-brand-red" : ""}`} />
            {wishCount > 0 && (
              <span className="grid h-5 min-w-5 place-items-center rounded-full bg-brand-red px-1.5 text-[11px] font-medium text-white">
                {wishCount}
              </span>
            )}
          </Link>
          <Link
            to="/cart"
            className="relative inline-flex h-9 items-center gap-1.5 rounded-md px-2 text-sm text-foreground hover:bg-accent sm:px-3 sm:gap-2"
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">Cart</span>
            {totalItems > 0 && (
              <span className="ml-1 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1.5 text-[11px] font-medium text-primary-foreground">
                {totalItems}
              </span>
            )}
          </Link>
          <button
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent md:hidden"
            aria-label="Toggle menu"
          >
            <Menu className="h-4 w-4" />
          </button>
        </div>
      </div>
      {open && (
        <div className="border-t border-border/60 px-6 py-3 md:hidden">
          <nav className="flex flex-col gap-3">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}