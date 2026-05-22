import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Mail, MapPin, Clock } from "lucide-react";

export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () => ({
    meta: [
      { title: "About Us — MedClub Store" },
      { name: "description", content: "About the medical students' club behind the store, plus how to reach us." },
    ],
  }),
});

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
  message: z.string().trim().min(5, "Message is too short").max(1000),
});

const faqs = [
  {
    q: "Who can buy from the store?",
    a: "Anyone is welcome, but club members get extra discounts on apparel and books.",
  },
  {
    q: "How does pickup work?",
    a: "Orders are ready the next weekday at the Student Union, Room 204. You'll get an email when yours is ready.",
  },
  {
    q: "What's your return policy?",
    a: "Unused items can be returned within 30 days for a full refund or store credit.",
  },
];

function AboutPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    toast.success("Thanks — we'll get back to you within 24h.");
    setForm({ name: "", email: "", message: "" });
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      {/* Intro */}
      <div className="max-w-3xl">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">About Us</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
          Built by med students, for med students.
        </h1>
        <div className="mt-8 space-y-5 text-base leading-relaxed text-muted-foreground">
          <p>
            MedClub Store is run entirely by the medical students' club at our university. We
            negotiate directly with manufacturers and distributors so that essential equipment —
            from your first stethoscope to your white coat — is available at a price every
            student can afford.
          </p>
          <p>
            Every dollar of margin goes back into club activities: free tutoring, anatomy lab
            sessions, mental health programming, and outreach in the local community.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {[
            { k: "Founded", v: "2019" },
            { k: "Active members", v: "1,200+" },
            { k: "Reinvested", v: "$48k" },
          ].map((s) => (
            <div key={s.k} className="rounded-lg border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">{s.k}</div>
              <div className="mt-1 text-2xl font-semibold tracking-tight">{s.v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Contact + FAQ */}
      <div id="contact" className="mt-24 grid gap-12 md:grid-cols-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Contact</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">We're here to help.</h2>
          <p className="mt-4 text-base text-muted-foreground">
            Questions about a product, an order, or club membership? Send us a message.
          </p>
          <ul className="mt-8 space-y-4 text-sm">
            <li className="flex items-start gap-3">
              <Mail className="mt-0.5 h-4 w-4 text-primary" />
              <span>store@medclub.edu</span>
            </li>
            <li className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 text-primary" />
              <span>Student Union, Room 204</span>
            </li>
            <li className="flex items-start gap-3">
              <Clock className="mt-0.5 h-4 w-4 text-primary" />
              <span>Mon–Fri · 11am – 4pm</span>
            </li>
          </ul>

          <h3 id="faq" className="mt-12 text-sm font-semibold uppercase tracking-wider">FAQ</h3>
          <dl className="mt-4 space-y-5">
            {faqs.map((f) => (
              <div key={f.q}>
                <dt className="text-sm font-medium text-foreground">{f.q}</dt>
                <dd className="mt-1 text-sm text-muted-foreground">{f.a}</dd>
              </div>
            ))}
          </dl>
        </div>

        <form onSubmit={submit} className="rounded-lg border border-border bg-card p-6 h-fit">
          <div className="grid gap-4">
            <label className="block">
              <span className="text-sm font-medium">Name</span>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="mt-1.5 h-10 w-full rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                maxLength={100}
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Email</span>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="mt-1.5 h-10 w-full rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                maxLength={255}
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Message</span>
              <textarea
                rows={5}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                maxLength={1000}
              />
            </label>
            <button
              type="submit"
              className="mt-2 inline-flex h-11 items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Send message
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}