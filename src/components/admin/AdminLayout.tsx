import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  FolderTree,
  Home,
  Info,
  Image as ImageIcon,
  PanelBottom,
  Handshake,
  LogOut,
  Menu,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

type NavItem = {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
};

const NAV: NavItem[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/categories", label: "Categories", icon: FolderTree },
  { to: "/admin/homepage", label: "Homepage", icon: Home },
  { to: "/admin/about", label: "About Us", icon: Info },
  { to: "/admin/images", label: "Images", icon: ImageIcon },
  { to: "/admin/footer", label: "Footer", icon: PanelBottom },
  { to: "/admin/partners", label: "Partners", icon: Handshake },
];

export function AdminLayout({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  const { user, loading, signOutUser } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/admin/login" });
  }, [user, loading, navigate]);

  if (loading || !user) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-16 text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-[1400px] gap-6 px-4 py-6 md:px-6 md:py-8">
      {/* Sidebar */}
      <aside className="hidden w-56 shrink-0 md:block">
        <div className="sticky top-20 rounded-lg border border-border bg-card p-3">
          <div className="px-2 pb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Admin
          </div>
          <nav className="flex flex-col gap-0.5">
            {NAV.map((item) => {
              const Icon = item.icon;
              const active = item.exact
                ? pathname === item.to
                : pathname === item.to || pathname.startsWith(item.to + "/");
              return (
                <Link
                  key={item.to}
                  to={item.to as any}
                  className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-3 border-t border-border pt-3">
            <button
              onClick={() => signOutUser()}
              className="inline-flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="min-w-0 flex-1">
        {/* Mobile nav */}
        <details className="mb-4 rounded-lg border border-border bg-card md:hidden">
          <summary className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm">
            <Menu className="h-4 w-4" /> Admin menu
          </summary>
          <nav className="flex flex-col gap-0.5 border-t border-border p-2">
            {NAV.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to as any}
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
            <button
              onClick={() => signOutUser()}
              className="mt-1 inline-flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </nav>
        </details>

        <header className="mb-6 border-b border-border pb-4">
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{title}</h1>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
        </header>

        {children}
      </main>
    </div>
  );
}