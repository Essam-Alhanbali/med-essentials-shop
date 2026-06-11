import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { collection, doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { categories as seedCategories, type Product, type Category } from "@/data/products";
import { DEFAULT_CATEGORY_EMOJI } from "@/lib/orderStatus";

export interface StoreProduct extends Omit<Product, "category"> {
  category: string;
  subcategory?: string;
  imageUrl?: string;
  images?: string[];
  features?: string[];
  sizes?: ProductSize[];
  years?: string[];
  variants?: ProductVariant[];
}

export interface ProductSize {
  label: string;
  stock: number;
  priceDelta?: number;
}

export interface ProductVariant {
  name: string;
  hex: string;
  price?: number;
  displayName?: string;
  images?: string[];
}

export const YEAR_OPTIONS = [
  "Year 1",
  "Year 2",
  "Year 3",
  "Year 4",
  "Year 5",
  "Year 6",
  "All Years",
] as const;

export interface CategoryDoc {
  id: string;
  name: string;
  subcategories: string[];
  imageUrl?: string;
  emoji?: string;
}

export interface StatItem {
  label: string;
  value: string;
}

export interface FeatureItem {
  icon?: string;
  title: string;
  description: string;
}

export interface AboutContent {
  heading: string;
  intro: string;
  body: string;
  email: string;
  phone: string;
  imageUrl?: string;
  stats: StatItem[];
}

export interface HomeContent {
  heroHeadline: string;
  heroSubheadline: string;
  heroImageUrl?: string;
  stats: StatItem[];
  features: FeatureItem[];
  featuredProductIds?: string[];
}

export interface SiteImages {
  logoUrl?: string;
  heroImageUrl?: string;
  poweredByLogoUrl?: string;
}

export interface Partner {
  id: string;
  name: string;
  logoUrl?: string;
  websiteUrl?: string;
  description?: string;
}

export interface FooterContent {
  tagline: string;
  email: string;
  address: string;
  copyright: string;
  bottomRight: string;
  shopCategoryIds: string[];
}

export interface FAQItem {
  q: string;
  a: string;
}

export interface ContactContent {
  heading: string;
  intro: string;
  email: string;
  phone: string;
  address: string;
  hours: string;
  faqs: FAQItem[];
}

const DEFAULT_ABOUT: AboutContent = {
  heading: "Built by med students, for med students.",
  intro:
    "MedClub Store is run entirely by the medical students' club at our university. We negotiate directly with manufacturers and distributors so that essential equipment — from your first stethoscope to your white coat — is available at a price every student can afford.",
  body:
    "Every dollar of margin goes back into club activities: free tutoring, anatomy lab sessions, mental health programming, and outreach in the local community.",
  email: "store@medclub.edu",
  phone: "+962 7 0000 0000",
  imageUrl: "",
  stats: [
    { label: "Founded", value: "2019" },
    { label: "Active members", value: "1,200+" },
    { label: "Reinvested", value: "JOD 48k" },
  ],
};

const DEFAULT_HOME: HomeContent = {
  heroHeadline: "Everything you need for medical school.",
  heroSubheadline:
    "Stethoscopes, anatomy atlases, white coats and more — at student-friendly prices, shipped from campus.",
  heroImageUrl: "",
  stats: [
    { label: "Members", value: "1,200+" },
    { label: "Products", value: "80+" },
    { label: "Avg. saving", value: "22%" },
  ],
  features: [
    { icon: "🚚", title: "Free campus pickup", description: "Order online, pick up at the Student Union." },
    { icon: "🛡️", title: "Authentic & warrantied", description: "Sourced directly from manufacturers." },
    { icon: "🎓", title: "Student pricing", description: "No markup — club covers the overhead." },
  ],
  featuredProductIds: [],
};

const DEFAULT_SITE: SiteImages = { logoUrl: "", heroImageUrl: "", poweredByLogoUrl: "" };

const DEFAULT_FOOTER: FooterContent = {
  tagline: "Equipment, books, and apparel — curated by med students, for med students.",
  email: "store@medclub.edu",
  address: "Student Union, Room 204",
  copyright: "© {year} MedClub Store. All rights reserved.",
  bottomRight: "Built for students, by students.",
  shopCategoryIds: [],
};

const DEFAULT_CONTACT: ContactContent = {
  heading: "We're here to help.",
  intro: "Questions about a product, an order, or club membership? Send us a message.",
  email: "store@medclub.edu",
  phone: "+962 7 0000 0000",
  address: "Student Union, Room 204",
  hours: "Mon–Fri · 10:00–16:00",
  faqs: [
    { q: "Who can buy from the store?", a: "Anyone is welcome, but club members get extra discounts on apparel and books." },
    { q: "How does pickup work?", a: "Orders are ready the next weekday at the Student Union, Room 204. You'll get an email when yours is ready." },
    { q: "What's your return policy?", a: "Unused items can be returned within 30 days for a full refund or store credit." },
  ],
};

interface StoreContextValue {
  products: StoreProduct[];
  categories: string[];
  categoryDocs: CategoryDoc[];
  getProduct: (id: string) => StoreProduct | undefined;
  getCategoryEmoji: (name: string) => string;
  about: AboutContent;
  home: HomeContent;
  footer: FooterContent;
  contact: ContactContent;
  site: SiteImages;
  partners: Partner[];
  loading: boolean;
}

const StoreContext = createContext<StoreContextValue | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [categoryDocs, setCategoryDocs] = useState<CategoryDoc[]>([]);
  const [hasCategoryDocs, setHasCategoryDocs] = useState(false);
  const [about, setAbout] = useState<AboutContent>(DEFAULT_ABOUT);
  const [home, setHome] = useState<HomeContent>(DEFAULT_HOME);
  const [footer, setFooter] = useState<FooterContent>(DEFAULT_FOOTER);
  const [contact, setContact] = useState<ContactContent>(DEFAULT_CONTACT);
  const [site, setSite] = useState<SiteImages>(DEFAULT_SITE);
  const [partners, setPartners] = useState<Partner[]>([]);
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
            features: Array.isArray(data.features) ? data.features : undefined,
            sizes: Array.isArray((data as any).sizes) ? (data as any).sizes : undefined,
            years: Array.isArray((data as any).years) ? (data as any).years : undefined,
            images: Array.isArray((data as any).images) ? (data as any).images : undefined,
            variants: Array.isArray((data as any).variants) ? (data as any).variants : undefined,
          };
        });
        setProducts(list);
        setLoading(false);
      },
      () => setLoading(false)
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
              emoji: data.emoji,
            };
          })
        );
      },
      () => {}
    );
    const unsubAbout = onSnapshot(
      doc(db, "content", "about"),
      (s) => {
        if (s.exists()) setAbout({ ...DEFAULT_ABOUT, ...(s.data() as Partial<AboutContent>) });
      },
      () => {}
    );
    const unsubHome = onSnapshot(
      doc(db, "content", "home"),
      (s) => {
        if (s.exists()) setHome({ ...DEFAULT_HOME, ...(s.data() as Partial<HomeContent>) });
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
    const unsubContact = onSnapshot(
      doc(db, "content", "contact"),
      (s) => {
        if (s.exists()) setContact({ ...DEFAULT_CONTACT, ...(s.data() as Partial<ContactContent>) });
      },
      () => {}
    );
    const unsubSite = onSnapshot(
      doc(db, "content", "site"),
      (s) => {
        if (s.exists()) setSite({ ...DEFAULT_SITE, ...(s.data() as Partial<SiteImages>) });
      },
      () => {}
    );
    const unsubPartners = onSnapshot(
      collection(db, "partners"),
      (snap) => {
        setPartners(
          snap.docs.map((d) => {
            const data = d.data() as Partial<Partner>;
            return {
              id: d.id,
              name: data.name ?? "Partner",
              logoUrl: data.logoUrl,
              websiteUrl: data.websiteUrl,
              description: data.description,
            };
          })
        );
      },
      () => {}
    );
    return () => {
      unsubP();
      unsubC();
      unsubAbout();
      unsubHome();
      unsubFooter();
      unsubContact();
      unsubSite();
      unsubPartners();
    };
  }, []);

  const value = useMemo<StoreContextValue>(() => {
    const effectiveCategoryDocs: CategoryDoc[] = hasCategoryDocs
      ? categoryDocs
      : (seedCategories as string[]).map((name) => ({
          id: name,
          name,
          subcategories: [],
        }));
    const cats = effectiveCategoryDocs.map((c) => c.name);
    const emojiByName = new Map(effectiveCategoryDocs.map((c) => [c.name, c.emoji]));
    return {
      products,
      categories: cats,
      categoryDocs: effectiveCategoryDocs,
      getProduct: (id) => products.find((p) => p.id === id),
      getCategoryEmoji: (name) => emojiByName.get(name) || DEFAULT_CATEGORY_EMOJI,
      about,
      home,
      footer,
      contact,
      site,
      partners,
      loading,
    };
  }, [products, categoryDocs, hasCategoryDocs, about, home, footer, contact, site, partners, loading]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

export type { Category };