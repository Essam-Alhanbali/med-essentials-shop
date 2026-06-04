import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { db } from "@/lib/firebase";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useStore, type ContactContent, type FAQItem } from "@/context/StoreContext";

export const Route = createFileRoute("/admin/contact")({
  component: ContactAdminPage,
  head: () => ({ meta: [{ title: "Contact & FAQ — MedClub Admin" }] }),
});

function ContactAdminPage() {
  const { contact } = useStore();
  const [draft, setDraft] = useState<ContactContent>(contact);
  useEffect(() => setDraft(contact), [contact]);

  async function save() {
    try {
      await setDoc(doc(db, "content", "contact"), draft);
      toast.success("Contact page saved");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed");
    }
  }

  return (
    <AdminLayout title="Contact & FAQ" description="Edit the contact page details and FAQ entries.">
      <div className="space-y-5 rounded-lg border border-border bg-card p-5">
        <Field label="Heading" value={draft.heading} onChange={(v) => setDraft({ ...draft, heading: v })} />
        <Field label="Intro paragraph" value={draft.intro} onChange={(v) => setDraft({ ...draft, intro: v })} multi />
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Email" value={draft.email} onChange={(v) => setDraft({ ...draft, email: v })} />
          <Field label="Phone" value={draft.phone} onChange={(v) => setDraft({ ...draft, phone: v })} />
          <Field label="Address" value={draft.address} onChange={(v) => setDraft({ ...draft, address: v })} />
          <Field label="Hours" value={draft.hours} onChange={(v) => setDraft({ ...draft, hours: v })} />
        </div>
        <div>
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">FAQ</div>
          <div className="mt-2">
            <FAQEditor faqs={draft.faqs} onChange={(faqs) => setDraft({ ...draft, faqs })} />
          </div>
        </div>
        <button onClick={save} className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          Save changes
        </button>
      </div>
    </AdminLayout>
  );
}

function Field({ label, value, onChange, multi }: { label: string; value: string; onChange: (v: string) => void; multi?: boolean }) {
  return (
    <label className="block">
      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
      {multi ? (
        <textarea rows={3} value={value} onChange={(e) => onChange(e.target.value)} className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} className="mt-1.5 h-10 w-full rounded-md border border-border bg-background px-3 text-sm" />
      )}
    </label>
  );
}

function FAQEditor({ faqs, onChange }: { faqs: FAQItem[]; onChange: (next: FAQItem[]) => void }) {
  const update = (i: number, patch: Partial<FAQItem>) =>
    onChange(faqs.map((f, idx) => (idx === i ? { ...f, ...patch } : f)));
  const remove = (i: number) => onChange(faqs.filter((_, idx) => idx !== i));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= faqs.length) return;
    const next = [...faqs];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  const add = () => onChange([...faqs, { q: "New question?", a: "Answer goes here." }]);

  return (
    <div className="space-y-3">
      {faqs.map((f, i) => (
        <div key={i} className="rounded-md border border-border bg-background p-3">
          <div className="flex items-start gap-2">
            <div className="flex-1 space-y-2">
              <input
                value={f.q}
                onChange={(e) => update(i, { q: e.target.value })}
                placeholder="Question"
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
              />
              <textarea
                value={f.a}
                onChange={(e) => update(i, { a: e.target.value })}
                placeholder="Answer"
                rows={2}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="flex flex-col gap-1">
              <button type="button" onClick={() => move(i, -1)} className="grid h-8 w-8 place-items-center rounded-md border border-border hover:bg-accent" aria-label="Move up">
                <ArrowUp className="h-3.5 w-3.5" />
              </button>
              <button type="button" onClick={() => move(i, 1)} className="grid h-8 w-8 place-items-center rounded-md border border-border hover:bg-accent" aria-label="Move down">
                <ArrowDown className="h-3.5 w-3.5" />
              </button>
              <button type="button" onClick={() => remove(i)} className="grid h-8 w-8 place-items-center rounded-md border border-border text-destructive hover:bg-accent" aria-label="Delete">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      ))}
      <button type="button" onClick={add} className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border px-3 text-xs hover:bg-accent">
        <Plus className="h-3.5 w-3.5" /> Add FAQ
      </button>
    </div>
  );
}