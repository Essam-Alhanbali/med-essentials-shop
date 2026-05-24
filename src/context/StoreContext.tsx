import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { collection, doc, onSnapshot, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { products as seedProducts, categories as seedCategories, type Product, type Category } from "@/data/products";

export interface StoreProduct extends Omit<Product, "category"> {
  category: string;
  subcategory?: string;
  imageUrl?: string;
  source: "seed" | "firestore";
}

export interface CategoryDoc {
  id: string;
  name: string;
  subcategories: string[];
  imageUrl?: string;
}

export interface AboutContent {
  heading: string;
  intro: string;
  body: string;
  email: string;
  address: string;
  hours: string;
}

export interface FooterContent {
  tagline: string;
  email: string;
  address: string;
  copyright: string;
  bottomRight: string;
}

const DEFAULT_ABOUT: AboutContent = {
  heading: "Built by med students, for med students.",
  intro:
    "MedClub Store is run entirely by the medical students' club at our university. We negotiate directly with manufacturers and distributors so that essential equipment — from your first stethoscope to your white coat — is available at a price every student can afford.",
  body:
    "Every dollar of margin goes back into club activities: free tutoring, anatomy lab sessions, mental health programming, and outreach in the local community.",
  email: "store@medclub.edu",
  address: "Student Union, Room 204",
  hours: "Mon–Fri · 11am – 4pm",
};

const DEFAULT_FOOTER: FooterContent = {
  tagline: "Equipment, books, and apparel — curated by med students, for med students.",
  email: "store@medclub.edu",
  address: "Student Union, Room 204",
  copyright: `© ${new Date().getFullYear()} MedClub Store. All rights reserved.`,
  bottomRight: "Built for students, by students.",
};

interface StoreContextValue {
  products: StoreProduct[];
  categories: string[];
  categoryDocs: CategoryDoc[];
  getProduct: (id: string) => StoreProduct | undefined;
  about: AboutContent;
  footer: FooterContent;
  loading: boolean;
}

const StoreContext = createContext<StoreContextValue | undefined>(undefined);

const seedAsStore: StoreProduct[] = seedProducts.map((p) => ({ ...p, source: "seed" as const }));

export function StoreProvider({ children }: { children: ReactNode }) {
  const [extraProducts, setExtraProducts] = useState<StoreProduct[]>([]);
  const [categoryDocs, setCategoryDocs] = useState<CategoryDoc[]>([]);
  const [hasCategoryDocs, setHasCategoryDocs] = useState(false);
  const [about, setAbout] = useState<AboutContent>(DEFAULT_ABOUT);
  const [footer, setFooter] = useState<FooterContent>(DEFAULT_FOOTER);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubP = onSnapshot(
      collection(db, "products"),
      (snap) => {
        const list: StoreProduct[] = snap.docs.map((d) => {
          const data = d.data() as Partial<StoreProduct>;
          return {
            id: d.id,
            name: data.name ?? "Untitled",
            category: data.category ?? "Other",
            subcategory: data.subcategory,
            price: Number(data.price ?? 0),
            blurb: data.blurb ?? "",
            description: data.description ?? "",
            badge: data.badge,
            imageUrl: data.imageUrl,
            source: "firestore",
          };
        });
        setExtraProducts(list);
      },
      () => {}
    );
    const unsubC = onSnapshot(
      collection(db, "categories"),
      (snap) => {
        setHasCategoryDocs(!snap.empty);
        setCategoryDocs(
          snap.docs.map((d) => {
            const data = d.data() as Partial<CategoryDoc>;
            return {
              id: d.id,
              name: (data.name as string) ?? d.id,
              subcategories: Array.isArray(data.subcategories) ? data.subcategories : [],
              imageUrl: data.imageUrl,
            };
          })
        );
      },
      () => {}
    );
    getDoc(doc(db, "content", "about"))
      .then((s) => {
        if (s.exists()) setAbout({ ...DEFAULT_ABOUT, ...(s.data() as Partial<AboutContent>) });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
    const unsubAbout = onSnapshot(
      doc(db, "content", "about"),
      (s) => {
        if (s.exists()) setAbout({ ...DEFAULT_ABOUT, ...(s.data() as Partial<AboutContent>) });
      },
      () => {}
    );
    const unsubFooter = onSnapshot(
      doc(db, "content", "footer"),
      (s) => {
        if (s.exists()) setFooter({ ...DEFAULT_FOOTER, ...(s.data() as Partial<FooterContent>) });
      },
      () => {}
    );
    return () => {
      unsubP();
      unsubC();
      unsubAbout();
      unsubFooter();
    };
  }, []);

  const value = useMemo<StoreContextValue>(() => {
    const all = [...seedAsStore, ...extraProducts];
    // Until any category doc exists in Firestore, fall back to seed categories
    // so the storefront is not empty before the admin first opens the panel.
    const effectiveCategoryDocs: CategoryDoc[] = hasCategoryDocs
      ? categoryDocs
      : (seedCategories as string[]).map((name) => ({
          id: name,
          name,
          subcategories: [],
        }));
    const cats = effectiveCategoryDocs.map((c) => c.name);
    return {
      products: all,
      categories: cats,
      categoryDocs: effectiveCategoryDocs,
      getProduct: (id) => all.find((p) => p.id === id),
      about,
      footer,
      loading,
    };
  }, [extraProducts, categoryDocs, hasCategoryDocs, about, footer, loading]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

export type { Category };