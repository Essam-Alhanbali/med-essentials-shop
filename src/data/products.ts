export type Category = string;

export interface Product {
  id: string;
  name: string;
  category: Category;
  price: number;
  blurb: string;
  description: string;
  badge?: string;
}

// Seed products removed — all products come from Firestore.
export const products: Product[] = [];

// Default categories used to seed Firestore on first admin visit.
export const categories: string[] = [
  "Diagnostics",
  "Anatomy",
  "Apparel",
  "Stationery",
  "Surgical",
];