"use client";

import React, { useState } from "react";
import { LuFileText, LuGithub, LuLinkedin, LuPenLine, LuX } from "react-icons/lu";
import { saveResumeInfo } from "@/lib/actions/admin";
import { Button, Card, CardSection, Field, Input } from "./ui";
import RichTextEditor from "./RichTextEditor";
import { htmlToText, summaryToHtml } from "@/lib/richtext";
import { withToast } from "./toast";

interface ResumeFormProps {
  initialData: {
    fullName: string;
    about: string;
    titles: string[];
    resumeLink?: string | null;
    linkedinUrl?: string | null;
    githubUrl?: string | null;
    mediumUrl?: string | null;
  } | null;
}

export default function ResumeForm({ initialData }: ResumeFormProps) {
  const initial = {
    fullName: initialData?.fullName || "",
    titles: initialData?.titles || [],
    about: summaryToHtml(initialData?.about || ""),
    resumeLink: initialData?.resumeLink || "",
    linkedinUrl: initialData?.linkedinUrl || "",
    githubUrl: initialData?.githubUrl || "",
    mediumUrl: initialData?.mediumUrl || "",
  };
  const [form, setForm] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [titleDraft, setTitleDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));
  const dirty = JSON.stringify(form) !== JSON.stringify(saved);

  const addTitle = () => {
    const t = titleDraft.trim();
    if (t && !form.titles.includes(t)) set("titles", [...form.titles, t]);
    setTitleDraft("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName.trim() || !htmlToText(form.about)) return;
    setSaving(true);
    try {
      await withToast(
        saveResumeInfo({
          fullName: form.fullName.trim(),
          about: form.about.trim(),
          titles: form.titles,
          resumeLink: form.resumeLink.trim() || undefined,
          linkedinUrl: form.linkedinUrl.trim() || undefined,
          githubUrl: form.githubUrl.trim() || undefined,
          mediumUrl: form.mediumUrl.trim() || undefined,
        }),
        {
          loading: "Saving profile…",
          success: "Profile saved",
          description: "Your home page and resume are updated.",
          error: "Couldn't save your profile",
        }
      );
      setSaved(form);
    } catch {
      /* toast shown */
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardSection title="Identity" description="Your name and headline titles, shown in the hero and on the resume.">
          <Field label="Full name" required>
            <Input value={form.fullName} onChange={(e) => set("fullName", e.target.value)} required />
          </Field>
          <Field label="Titles" hint="The first title is your main headline. Press Enter to add.">
            <div className="flex min-h-10 flex-wrap items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-2 py-1.5 shadow-sm focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/10">
              {form.titles.map((t, i) => (
                <span key={t} className={`inline-flex items-center gap-1 rounded-md py-0.5 pl-2 pr-1 text-xs font-medium ${i === 0 ? "bg-brand-50 text-brand-700" : "bg-zinc-100 text-zinc-700"}`}>
                  {t}
                  <button type="button" onClick={() => set("titles", form.titles.filter((x) => x !== t))} className="rounded p-0.5 opacity-60 hover:opacity-100" aria-label={`Remove ${t}`}>
                    <LuX size={12} />
                  </button>
                </span>
              ))}
              <input
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTitle();
                  }
                }}
                onBlur={addTitle}
                placeholder={form.titles.length ? "" : "Software Engineer"}
                className="min-w-[140px] flex-1 border-0 bg-transparent px-1 text-sm focus:outline-none"
              />
            </div>
          </Field>
        </CardSection>

        <CardSection title="Summary" description="2–4 sentences. Lead with what you do and the impact you have.">
          <Field
            label="Professional summary"
            required
            hint="Use bold or underline sparingly to make key skills and results stand out."
            aside={<span className="font-mono text-[11px] text-zinc-400">{htmlToText(form.about).length} chars</span>}
          >
            <RichTextEditor value={form.about} onChange={(html) => set("about", html)} placeholder="Professional summary" />
          </Field>
        </CardSection>

        <CardSection title="Links" description="Shown in the hero, footer, and resume header.">
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Resume document" hint="Google Docs or PDF link for recruiters.">
              <Input type="url" leading={<LuFileText size={15} />} value={form.resumeLink} onChange={(e) => set("resumeLink", e.target.value)} placeholder="https://docs.google.com/…" />
            </Field>
            <Field label="LinkedIn">
              <Input type="url" leading={<LuLinkedin size={15} />} value={form.linkedinUrl} onChange={(e) => set("linkedinUrl", e.target.value)} placeholder="https://linkedin.com/in/…" />
            </Field>
            <Field label="GitHub">
              <Input type="url" leading={<LuGithub size={15} />} value={form.githubUrl} onChange={(e) => set("githubUrl", e.target.value)} placeholder="https://github.com/…" />
            </Field>
            <Field label="Articles (Medium)">
              <Input type="url" leading={<LuPenLine size={15} />} value={form.mediumUrl} onChange={(e) => set("mediumUrl", e.target.value)} placeholder="https://medium.com/@…" />
            </Field>
          </div>
        </CardSection>
      </Card>

      <div className="sticky bottom-0 z-10 -mx-4 mt-6 border-t border-zinc-200 bg-zinc-50/90 px-4 py-3 backdrop-blur sm:-mx-8 sm:px-8">
        <div className="flex items-center justify-end gap-3">
          {dirty && <span className="mr-auto text-xs text-amber-600">Unsaved changes</span>}
          <Button type="button" variant="secondary" disabled={!dirty || saving} onClick={() => setForm(saved)}>
            Discard
          </Button>
          <Button type="submit" loading={saving} disabled={!dirty}>
            Save profile
          </Button>
        </div>
      </div>
    </form>
  );
}
