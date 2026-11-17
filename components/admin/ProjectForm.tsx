"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { LuGithub, LuGlobe, LuTrash2, LuVideo, LuX } from "react-icons/lu";
import ImageUpload from "./ImageUpload";
import { saveProject, deleteProject } from "@/lib/actions/admin";
import { Button, Card, CardSection, ConfirmDialog, Field, Input, Textarea } from "./ui";
import { withToast } from "./toast";

interface ProjectFormProps {
  initialData?: {
    id: string;
    name: string;
    tech: string;
    image: string;
    technologies: string[];
    desc: string;
    code?: string | null;
    demo?: string | null;
    video?: string | null;
    order?: number | null;
  };
}

export default function ProjectForm({ initialData }: ProjectFormProps) {
  const router = useRouter();
  const isEditing = !!initialData?.id;

  const [name, setName] = useState(initialData?.name || "");
  const [tech, setTech] = useState(initialData?.tech || "");
  const [image, setImage] = useState(initialData?.image || "");
  const [technologies, setTechnologies] = useState<string[]>(initialData?.technologies || []);
  const [desc, setDesc] = useState(initialData?.desc || "");
  const [code, setCode] = useState(initialData?.code || "");
  const [demo, setDemo] = useState(initialData?.demo || "");
  const [video, setVideo] = useState(initialData?.video || "");
  const [order, setOrder] = useState<number>(initialData?.order ?? 0);

  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const errors = {
    name: !name.trim() ? "Give the project a name." : null,
    tech: !tech.trim() ? "Add a one-line stack summary." : null,
    image: !image ? "Add a cover image." : null,
    desc: !desc.trim() ? "Describe what the project does." : null,
  };
  const hasErrors = Object.values(errors).some(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (hasErrors) return;
    setSaving(true);
    try {
      await withToast(
        saveProject({
          id: initialData?.id,
          name: name.trim(),
          tech: tech.trim(),
          image,
          technologies,
          desc,
          code: code.trim() || undefined,
          demo: demo.trim() || undefined,
          video: video.trim() || undefined,
          order: Number(order),
        }),
        {
          loading: isEditing ? "Saving project…" : "Creating project…",
          success: isEditing ? "Project updated" : "Project created",
          description: `“${name.trim()}” is live on your portfolio.`,
          error: "Couldn't save the project",
        }
      );
      router.push("/admin/projects");
      router.refresh();
    } catch {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!initialData?.id) return;
    setDeleting(true);
    try {
      await withToast(deleteProject(initialData.id), {
        loading: "Deleting project…",
        success: "Project deleted",
        description: `“${name}” was removed from your portfolio.`,
        error: "Couldn't delete the project",
      });
      router.push("/admin/projects");
      router.refresh();
    } catch {
      setDeleting(false);
    }
  };

  const err = (k: keyof typeof errors) => (submitted ? errors[k] : null);

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Card>
        <CardSection title="Basics" description="How the project appears on your project cards.">
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Project name" required error={err("name")}>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Property Finderz" />
            </Field>
            <Field label="Stack summary" required error={err("tech")} hint="One line, shown under the title.">
              <Input value={tech} onChange={(e) => setTech(e.target.value)} placeholder="Next.js · NestJS · PostgreSQL" />
            </Field>
          </div>
          <Field label="Technologies" hint="Press Enter or comma to add a tag. Shown as chips on the project page.">
            <TagInput value={technologies} onChange={setTechnologies} placeholder="React, Tailwind CSS…" />
          </Field>
        </CardSection>

        <CardSection title="Cover image" description="Use a 16:9 screenshot. It's the first thing recruiters see.">
          <ImageUpload value={image} onChange={setImage} label="Cover" required />
          {err("image") && <p className="text-xs text-red-600">{err("image")}</p>}
        </CardSection>

        <CardSection title="Story" description="What problem it solves, your role, and the result.">
          <Field label="Description" required error={err("desc")} aside={<span className="font-mono text-[11px] text-zinc-400">{desc.length} chars</span>}>
            <Textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={8} placeholder="A marketplace that connects… I built the backend and… which led to…" />
          </Field>
        </CardSection>

        <CardSection title="Links" description="Optional. Each one becomes a button on the project page.">
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Source code">
              <Input type="url" leading={<LuGithub size={15} />} value={code} onChange={(e) => setCode(e.target.value)} placeholder="https://github.com/…" />
            </Field>
            <Field label="Live demo">
              <Input type="url" leading={<LuGlobe size={15} />} value={demo} onChange={(e) => setDemo(e.target.value)} placeholder="https://…" />
            </Field>
          </div>
          <div className="grid gap-5 md:grid-cols-[1fr_140px]">
            <Field label="Video preview" hint="MP4 URL or /assets/video/… path.">
              <Input leading={<LuVideo size={15} />} value={video} onChange={(e) => setVideo(e.target.value)} placeholder="/assets/video/demo.mp4" />
            </Field>
            <Field label="Display order" hint="Lower shows first.">
              <Input type="number" value={order} onChange={(e) => setOrder(Number(e.target.value))} />
            </Field>
          </div>
        </CardSection>
      </Card>

      {/* Sticky action bar */}
      <div className="sticky bottom-0 z-10 -mx-4 mt-6 border-t border-zinc-200 bg-zinc-50/90 px-4 py-3 backdrop-blur sm:-mx-8 sm:px-8">
        <div className="flex items-center justify-between gap-3">
          {isEditing ? (
            <Button type="button" variant="danger-ghost" icon={<LuTrash2 size={16} />} onClick={() => setConfirmOpen(true)} disabled={saving}>
              Delete
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={() => router.push("/admin/projects")} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              {isEditing ? "Save changes" : "Create project"}
            </Button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete this project?"
        description={<>“{name}” will be removed from your portfolio. This can&apos;t be undone.</>}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </form>
  );
}

function TagInput({ value, onChange, placeholder }: { value: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  const [draft, setDraft] = useState("");
  const add = (raw: string) => {
    const tags = raw.split(",").map((t) => t.trim()).filter(Boolean).filter((t) => !value.some((v) => v.toLowerCase() === t.toLowerCase()));
    if (tags.length) onChange([...value, ...tags]);
    setDraft("");
  };
  return (
    <div className="flex min-h-10 flex-wrap items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-2 py-1.5 shadow-sm transition focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/10">
      {value.map((tag) => (
        <span key={tag} className="inline-flex items-center gap-1 rounded-md bg-zinc-100 py-0.5 pl-2 pr-1 text-xs font-medium text-zinc-700">
          {tag}
          <button type="button" onClick={() => onChange(value.filter((t) => t !== tag))} className="rounded p-0.5 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-700" aria-label={`Remove ${tag}`}>
            <LuX size={12} />
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => (e.target.value.includes(",") ? add(e.target.value) : setDraft(e.target.value))}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            add(draft);
          } else if (e.key === "Backspace" && !draft && value.length) {
            onChange(value.slice(0, -1));
          }
        }}
        onBlur={() => draft && add(draft)}
        placeholder={value.length ? "" : placeholder}
        className="min-w-[120px] flex-1 border-0 bg-transparent px-1 py-0.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
      />
    </div>
  );
}
