"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import { LuPlus, LuPencil, LuTrash2, LuSearch, LuSparkles } from "react-icons/lu";
import ImageUpload from "./ImageUpload";
import { saveSkill, deleteSkill } from "@/lib/actions/admin";
import { Button, ConfirmDialog, EmptyState, Field, Input, Modal, PageHeader, Select } from "./ui";
import { withToast } from "./toast";

interface Skill {
  id: string;
  name: string;
  category: string;
  image: string;
  order: number | null;
}

const CATEGORIES = ["Back-End", "Front-End", "Databases", "Tools / Cloud", "Other"];

export default function SkillsManager({ initialSkills }: { initialSkills: Skill[] }) {
  const [skills, setSkills] = useState<Skill[]>(initialSkills);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Skill | "new" | null>(null);
  const [toDelete, setToDelete] = useState<Skill | null>(null);
  const [deleting, setDeleting] = useState(false);

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q ? skills.filter((s) => s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q)) : skills;
    const cats = [...CATEGORIES, ...Array.from(new Set(list.map((s) => s.category))).filter((c) => !CATEGORIES.includes(c))];
    return cats
      .map((cat) => ({ cat, items: list.filter((s) => s.category === cat).sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) }))
      .filter((g) => g.items.length);
  }, [skills, query]);

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await withToast(deleteSkill(toDelete.id), {
        loading: "Deleting…",
        success: "Skill deleted",
        description: toDelete.name,
        error: "Couldn't delete this skill",
      });
      setSkills((prev) => prev.filter((s) => s.id !== toDelete.id));
      setToDelete(null);
    } catch {
      /* toast shown */
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Skills"
        description={`${skills.length} skills across ${new Set(skills.map((s) => s.category)).size} categories.`}
        actions={<Button icon={<LuPlus size={16} />} onClick={() => setEditing("new")}>Add skill</Button>}
      />

      <div className="mb-6 max-w-xs">
        <Input leading={<LuSearch size={15} />} placeholder="Search skills…" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      {grouped.length === 0 ? (
        <EmptyState
          icon={<LuSparkles size={22} />}
          title={query ? "No matching skills" : "No skills yet"}
          description={query ? "Try a different search." : "Add the technologies you work with."}
          action={!query && <Button icon={<LuPlus size={16} />} onClick={() => setEditing("new")}>Add skill</Button>}
        />
      ) : (
        <div className="space-y-8">
          {grouped.map(({ cat, items }) => (
            <section key={cat}>
              <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                {cat} <span className="rounded bg-zinc-200/70 px-1.5 py-0.5 font-mono text-[10px] text-zinc-600">{items.length}</span>
              </h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                {items.map((skill) => (
                  <div
                    key={skill.id}
                    className="group relative flex items-center gap-3 rounded-xl border border-zinc-200/80 bg-white p-3 shadow-sm transition hover:border-zinc-300 hover:shadow-md"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-50 ring-1 ring-zinc-100">
                      {skill.image ? (
                        <Image src={skill.image} alt="" width={26} height={26} className="object-contain" />
                      ) : (
                        <span className="text-xs font-bold text-zinc-500">{skill.name.slice(0, 2).toUpperCase()}</span>
                      )}
                    </div>
                    <button onClick={() => setEditing(skill)} className="min-w-0 flex-1 break-words pr-6 text-left text-sm font-medium capitalize leading-snug text-zinc-800">
                      {skill.name}
                    </button>
                    <div className="absolute right-1.5 top-1.5 flex gap-0.5 rounded-md bg-white opacity-0 shadow-sm ring-1 ring-zinc-200 transition group-hover:opacity-100 focus-within:opacity-100">
                      <button onClick={() => setEditing(skill)} className="rounded p-1 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900" aria-label={`Edit ${skill.name}`}>
                        <LuPencil size={13} />
                      </button>
                      <button onClick={() => setToDelete(skill)} className="rounded p-1 text-zinc-500 hover:bg-red-50 hover:text-red-600" aria-label={`Delete ${skill.name}`}>
                        <LuTrash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <SkillEditor
        key={editing === "new" ? "new" : editing?.id ?? "closed"}
        open={editing !== null}
        initial={editing === "new" ? null : editing}
        nextOrder={skills.length}
        onClose={() => setEditing(null)}
        onSaved={(saved, isNew) => {
          setSkills((prev) => (isNew ? [...prev, saved] : prev.map((s) => (s.id === saved.id ? saved : s))));
          setEditing(null);
        }}
      />

      <ConfirmDialog
        open={toDelete !== null}
        title={`Delete ${toDelete?.name ?? "skill"}?`}
        description="It will be removed from your home page and resume."
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}

function SkillEditor({
  open,
  initial,
  nextOrder,
  onClose,
  onSaved,
}: {
  open: boolean;
  initial: Skill | null;
  nextOrder: number;
  onClose: () => void;
  onSaved: (s: Skill, isNew: boolean) => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [category, setCategory] = useState(initial?.category ?? "Back-End");
  const [image, setImage] = useState(initial?.image ?? "");
  const [order, setOrder] = useState<number>(initial?.order ?? nextOrder);
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setSubmitted(true);
    if (!name.trim()) return;
    setSaving(true);
    try {
      const res = await withToast(saveSkill({ id: initial?.id, name: name.trim(), category, image, order: Number(order) }), {
        loading: initial ? "Saving skill…" : "Adding skill…",
        success: initial ? "Skill updated" : "Skill added",
        description: name.trim(),
        error: "Couldn't save the skill",
      });
      onSaved({ id: res.id, name: name.trim(), category, image, order }, !initial);
    } catch {
      /* toast shown */
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      title={initial ? "Edit skill" : "Add skill"}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={() => submit()} loading={saving}>{initial ? "Save changes" : "Add skill"}</Button>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-5 p-6" noValidate>
        <div className="flex items-start gap-4">
          <ImageUpload value={image} onChange={setImage} label="Icon" aspect="square" />
          <div className="flex-1 space-y-4">
            <Field label="Name" required error={submitted && !name.trim() ? "Add a name." : null}>
              <Input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="TypeScript" />
            </Field>
            <Field label="Category">
              <Select value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </Select>
            </Field>
          </div>
        </div>
        <Field label="Display order" hint="Lower numbers show first within the category.">
          <Input type="number" value={order} onChange={(e) => setOrder(Number(e.target.value))} />
        </Field>
        <button type="submit" hidden />
      </form>
    </Modal>
  );
}
