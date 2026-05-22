import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { collection, doc, onSnapshot, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { products as seedProducts, categories as seedCategories, type Product, type Category } from "@/data/products";

export interface StoreProduct extends Omit<Product, "category"> {
  category: string;
  imageUrl?: string;
  source: "seed" | "firestore";
}

export interface AboutContent {
  heading: string;
  intro: string;
  body: string;
  email: string;
  address: string;
  hours: string;
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

interface StoreContextValue {
  products: StoreProduct[];
  categories: string[];
  getProduct: (id: string) => StoreProduct | undefined;
  about: AboutContent;
  loading: boolean;
}

const StoreContext = createContext<StoreContextValue | undefined>(undefined);

const seedAsStore: StoreProduct[] = seedProducts.map((p) => ({ ...p, source: "seed" as const }));

export function StoreProvider({ children }: { children: ReactNode }) {
  const [extraProducts, setExtraProducts] = useState<StoreProduct[]>([]);
  const [extraCategories, setExtraCategories] = useState<string[]>([]);
  const [about, setAbout] = useState<AboutContent>(DEFAULT_ABOUT);
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
      (snap) => setExtraCategories(snap.docs.map((d) => (d.data().name as string) ?? d.id).filter(Boolean)),
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
    return () => {
      unsubP();
      unsubC();
      unsubAbout();
    };
  }, []);

  const value = useMemo<StoreContextValue>(() => {
    const all = [...seedAsStore, ...extraProducts];
    const cats = Array.from(new Set([...(seedCategories as string[]), ...extraCategories]));
    return {
      products: all,
      categories: cats,
      getProduct: (id) => all.find((p) => p.id === id),
      about,
      loading,
    };
  }, [extraProducts, extraCategories, about, loading]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

export type { Category };