import type { ReactNode } from "react";

export type Category = "Diagnostics" | "Anatomy" | "Apparel" | "Stationery" | "Surgical";

export interface Product {
  id: string;
  name: string;
  category: Category;
  price: number;
  blurb: string;
  description: string;
  badge?: string;
}

export const products: Product[] = [
  {
    id: "littmann-classic-iii",
    name: "Littmann Classic III Stethoscope",
    category: "Diagnostics",
    price: 129,
    blurb: "The dependable everyday stethoscope for clinical rotations.",
    description:
      "A dual-sided chestpiece with tunable diaphragm — the trusted instrument used by med students worldwide. Includes spare eartips and a 5-year warranty.",
    badge: "Bestseller",
  },
  {
    id: "reflex-hammer",
    name: "Tromner Reflex Hammer",
    category: "Diagnostics",
    price: 18,
    blurb: "Balanced weight, precise tap. A neuro exam essential.",
    description: "Stainless steel handle with soft rubber head for accurate reflex testing.",
  },
  {
    id: "penlight",
    name: "LED Diagnostic Penlight",
    category: "Diagnostics",
    price: 9,
    blurb: "Pupillary scale printed on the side. Pocket-clip included.",
    description: "Two AAA batteries included. Long-lasting LED bulb with cool white temperature.",
  },
  {
    id: "anatomy-atlas",
    name: "Netter's Atlas of Human Anatomy",
    category: "Anatomy",
    price: 79,
    blurb: "The gold standard illustrated atlas. 8th edition.",
    description: "Over 550 exquisite plates that bring anatomy to life. Includes digital companion.",
    badge: "New edition",
  },
  {
    id: "bone-set",
    name: "Articulated Hand Bone Model",
    category: "Anatomy",
    price: 42,
    blurb: "Life-size carpals, metacarpals, phalanges. Wire-mounted.",
    description: "Cast from a real specimen. Numbered for self-quizzing.",
  },
  {
    id: "white-coat",
    name: "Embroidered White Coat",
    category: "Apparel",
    price: 58,
    blurb: "Custom embroidery with your name and class year.",
    description: "Wrinkle-resistant poplin. Three pockets, side vents, classic notched collar.",
    badge: "Club exclusive",
  },
  {
    id: "scrub-set",
    name: "Performance Scrub Set",
    category: "Apparel",
    price: 64,
    blurb: "Four-way stretch, antimicrobial finish, deep pockets.",
    description: "Top and bottom included. Available in navy, black, and ceil blue.",
  },
  {
    id: "moleskine",
    name: "Clinical Pocket Notebook",
    category: "Stationery",
    price: 14,
    blurb: "Lab-coat sized. Quadrille grid for sketches and notes.",
    description: "192 pages of acid-free paper, elastic closure, ribbon marker.",
  },
  {
    id: "suture-kit",
    name: "Practice Suture Kit",
    category: "Surgical",
    price: 36,
    blurb: "Silicone pad, instruments, and assorted suture material.",
    description: "Includes needle holder, forceps, scissors, scalpel handle, and ten practice sutures.",
  },
];

export const categories: Category[] = ["Diagnostics", "Anatomy", "Apparel", "Stationery", "Surgical"];

// helper type to avoid unused import warning
export type _R = ReactNode;