import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { useStore } from "@/context/StoreContext";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
  head: () => ({
    meta: [
      { title: "Contact — MedClub Store" },
      { name: "description", content: "Get in touch with the MedClub Store team and read our FAQ." },
    ],
  }),
});

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
  message: z.string().trim().min(5, "Message is too short").max(1000),
});

function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const { contact } = useStore();

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
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="grid gap-10 md:grid-cols-2 md:gap-12">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Contact</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">{contact.heading}</h1>
          <p className="mt-4 text-base text-muted-foreground">{contact.intro}</p>
          <ul className="mt-8 space-y-4 text-sm">
            {contact.email && (
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 text-brand-red" />
                <span className="break-all">{contact.email}</span>
              </li>
            )}
            {contact.phone && (
              <li className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 text-brand-red" />
                <span>{contact.phone}</span>
              </li>
            )}
            {contact.address && (
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 text-brand-red" />
                <span>{contact.address}</span>
              </li>
            )}
            {contact.hours && (
              <li className="flex items-start gap-3">
                <Clock className="mt-0.5 h-4 w-4 text-brand-red" />
                <span>{contact.hours}</span>
              </li>
            )}
          </ul>

          <h2 id="faq" className="mt-12 text-sm font-semibold uppercase tracking-wider">FAQ</h2>
          <dl className="mt-4 space-y-5">
            {contact.faqs.map((f, i) => (
              <div key={i} className="border-l-2 border-brand-red/40 pl-4">
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