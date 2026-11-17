"use client";

import React, { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  LuPlus,
  LuPencil,
  LuTrash2,
  LuArrowUp,
  LuArrowDown,
  LuBriefcaseBusiness,
  LuCalendar,
  LuMapPin,
  LuLightbulb,
  LuEye,
  LuChevronDown,
} from "react-icons/lu";
import { saveExperience, deleteExperience, reorderExperiences } from "@/lib/actions/admin";
import { Button, Field, Input, Select, PageHeader, Modal, ConfirmDialog, EmptyState, Badge } from "./ui";
import { withToast } from "./toast";
import ExperienceEntry from "@/components/site/ExperienceEntry";
import {
  MONTHS,
  WORK_MODES,
  type WorkMode,
  displayTimeFrame,
  formatLocation,
  formatTimeFrame,
  isCurrent,
  joinTitle,
  parseLocation,
  parseTimeFrame,
  splitTitle,
} from "@/lib/experience";

interface Experience {
  id: string;
  title: string;
  location: string;
  timeFrame: string;
  keyTasks: string[];
  order: number | null;
}

const byOrder = (a: Experience, b: Experience) => (a.order ?? 0) - (b.order ?? 0);

export default function ExperiencesManager({ initialExperiences }: { initialExperiences: Experience[] }) {
  const [experiences, setExperiences] = useState<Experience[]>(() => [...initialExperiences].sort(byOrder));
  const [editing, setEditing] = useState<Experience | "new" | null>(null);
  const [toDelete, setToDelete] = useState<Experience | null>(null);
  const [deleting, setDeleting] = useState(false);

  const move = async (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= experiences.length) return;
    const next = [...experiences];
    [next[index], next[target]] = [next[target], next[index]];
    const reordered = next.map((e, i) => ({ ...e, order: i }));
    const previous = experiences;
    setExperiences(reordered);
    try {
      await withToast(reorderExperiences(reordered.map((e) => e.id)), {
        loading: "Updating order…",
        success: "Order updated",
        error: "Couldn't update the order",
      });
    } catch {
      setExperiences(previous);
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await withToast(deleteExperience(toDelete.id), {
        loading: "Deleting…",
        success: "Experience deleted",
        description: splitTitle(toDelete.title).role,
        error: "Couldn't delete this experience",
      });
      setExperiences((prev) => prev.filter((e) => e.id !== toDelete.id));
      setToDelete(null);
    } catch {
      // toast already shown
    } finally {
      setDeleting(false);
    }
  };

  const onSaved = (saved: Experience, isNew: boolean) => {
    setExperiences((prev) => (isNew ? [saved, ...prev] : prev.map((e) => (e.id === saved.id ? saved : e))).sort(byOrder));
    setEditing(null);
  };

  return (
    <div>
      <PageHeader
        title="Experience"
        description="Your work history as it appears on the home page and resume. The top entry shows first."
        actions={
          <Button icon={<LuPlus size={16} />} onClick={() => setEditing("new")}>
            Add experience
          </Button>
        }
      />

      {experiences.length === 0 ? (
        <EmptyState
          icon={<LuBriefcaseBusiness size={22} />}
          title="No experience yet"
          description="Add your roles so recruiters can see where you've worked and what you achieved."
          action={<Button icon={<LuPlus size={16} />} onClick={() => setEditing("new")}>Add your first role</Button>}
        />
      ) : (
        <ol className="relative space-y-3 before:absolute before:bottom-6 before:left-[27px] before:top-6 before:w-px before:bg-zinc-200">
          {experiences.map((exp, i) => (
            <ExperienceRow
              key={exp.id}
              exp={exp}
              first={i === 0}
              last={i === experiences.length - 1}
              onEdit={() => setEditing(exp)}
              onDelete={() => setToDelete(exp)}
              onMoveUp={() => move(i, -1)}
              onMoveDown={() => move(i, 1)}
            />
          ))}
        </ol>
      )}

      <ExperienceEditor
        key={editing === "new" ? "new" : editing?.id ?? "closed"}
        open={editing !== null}
        initial={editing === "new" ? null : editing}
        newOrder={experiences.length ? Math.min(...experiences.map((e) => e.order ?? 0)) - 1 : 0}
        onClose={() => setEditing(null)}
        onSaved={onSaved}
      />

      <ConfirmDialog
        open={toDelete !== null}
        title="Delete this experience?"
        description={
          toDelete ? (
            <>
              <span className="font-medium text-zinc-700">{splitTitle(toDelete.title).role}</span> will be removed from your
              home page and resume. This can&apos;t be undone.
            </>
          ) : null
        }
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}

// ---------------------------------------------------------------- List row
function ExperienceRow({
  exp,
  first,
  last,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
}: {
  exp: Experience;
  first: boolean;
  last: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const { role, company } = splitTitle(exp.title);
  const current = isCurrent(exp.timeFrame);
  const { place, mode } = parseLocation(exp.location);
  const shown = expanded ? exp.keyTasks : exp.keyTasks.slice(0, 2);

  return (
    <li className="group relative flex gap-4 rounded-xl border border-zinc-200/80 bg-white p-4 shadow-sm transition hover:border-zinc-300 hover:shadow-md sm:p-5">
      <div className="relative z-10 flex h-[22px] w-[22px] shrink-0 items-center justify-center">
        <span className={`h-3 w-3 rounded-full ring-4 ring-white ${current ? "bg-brand-500" : "bg-zinc-300"}`} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <button onClick={onEdit} className="text-left text-[15px] font-semibold text-zinc-900 hover:underline">
            {role || "Untitled role"}
          </button>
          {company && <span className="text-[15px] text-zinc-500">· {company}</span>}
          {current && <Badge tone="green">Current</Badge>}
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500">
          <span className="inline-flex items-center gap-1.5"><LuCalendar size={13} />{displayTimeFrame(exp.timeFrame)}</span>
          {(place || mode !== "On-site") && (
            <span className="inline-flex items-center gap-1.5"><LuMapPin size={13} />{formatLocation(place, mode)}</span>
          )}
          <span>{exp.keyTasks.length} highlight{exp.keyTasks.length === 1 ? "" : "s"}</span>
        </div>

        {shown.length > 0 && (
          <ul className="mt-3 space-y-1.5 text-[13px] leading-relaxed text-zinc-600">
            {shown.map((t, i) => (
              <li key={i} className={`relative pl-4 ${expanded ? "" : "line-clamp-2"}`}>
                <span className="absolute left-0 top-[0.6em] h-1 w-1 rounded-full bg-zinc-400" />
                {t.replace(/\s+/g, " ")}
              </li>
            ))}
          </ul>
        )}
        {exp.keyTasks.length > 2 && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-zinc-500 hover:text-zinc-900"
          >
            {expanded ? "Show less" : `Show ${exp.keyTasks.length - 2} more`}
            <LuChevronDown size={14} className={`transition ${expanded ? "rotate-180" : ""}`} />
          </button>
        )}
      </div>

      <div className="flex shrink-0 flex-col items-end justify-between gap-2">
        <div className="flex items-center gap-0.5">
          <IconButton label="Edit" onClick={onEdit}><LuPencil size={15} /></IconButton>
          <IconButton label="Delete" onClick={onDelete} danger><LuTrash2 size={15} /></IconButton>
        </div>
        <div className="flex items-center gap-0.5 opacity-60 transition group-hover:opacity-100">
          <IconButton label="Move up" onClick={onMoveUp} disabled={first}><LuArrowUp size={15} /></IconButton>
          <IconButton label="Move down" onClick={onMoveDown} disabled={last}><LuArrowDown size={15} /></IconButton>
        </div>
      </div>
    </li>
  );
}

function IconButton({
  label,
  onClick,
  children,
  disabled,
  danger,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={`rounded-md p-1.5 text-zinc-400 transition disabled:pointer-events-none disabled:opacity-30 ${
        danger ? "hover:bg-red-50 hover:text-red-600" : "hover:bg-zinc-100 hover:text-zinc-800"
      }`}
    >
      {children}
    </button>
  );
}

// ---------------------------------------------------------------- Editor
type FormState = {
  role: string;
  company: string;
  place: string;
  mode: WorkMode;
  startMonth: string; // "" = year only
  startYear: string;
  endMonth: string;
  endYear: string;
  current: boolean;
  customTimeFrame: string | null; // used when the stored text can't be parsed
  tasks: string[];
};

function toForm(exp: Experience | null): FormState {
  const { role, company } = splitTitle(exp?.title ?? "");
  const { place, mode } = parseLocation(exp?.location ?? "");
  const period = exp ? parseTimeFrame(exp.timeFrame) : null;
  return {
    role,
    company,
    place,
    mode: exp ? mode : "Remote",
    startMonth: period?.start.month != null ? String(period.start.month) : "",
    startYear: period?.start.year ?? String(new Date().getFullYear()),
    endMonth: period?.end.month != null ? String(period.end.month) : "",
    endYear: period?.end.year ?? "",
    current: exp ? period?.current ?? false : true,
    customTimeFrame: exp && !period ? exp.timeFrame : null,
    tasks: exp?.keyTasks.length ? exp.keyTasks.map((t) => t.replace(/\s+/g, " ").trim()) : [""],
  };
}

function composeTimeFrame(f: FormState) {
  if (f.customTimeFrame !== null) return f.customTimeFrame.trim();
  return formatTimeFrame({
    start: { month: f.startMonth === "" ? null : Number(f.startMonth), year: f.startYear.trim() },
    end: { month: f.endMonth === "" ? null : Number(f.endMonth), year: f.endYear.trim() },
    current: f.current,
  });
}

const YEAR_RE = /^\d{4}$/;
const TASK_SOFT_LIMIT = 240;

type FormErrors = Partial<Record<"role" | "start" | "end" | "custom", string>>;

function validate(f: FormState): FormErrors {
  const e: FormErrors = {};
  if (!f.role.trim()) e.role = "Add your job title.";
  if (f.customTimeFrame !== null) {
    if (!f.customTimeFrame.trim()) e.custom = "Add the dates.";
    return e;
  }
  if (!YEAR_RE.test(f.startYear.trim())) e.start = "Enter a 4-digit year.";
  if (!f.current && !YEAR_RE.test(f.endYear.trim())) e.end = "Enter a 4-digit year, or tick “I currently work here”.";
  else if (!f.current && YEAR_RE.test(f.startYear) && Number(f.endYear) < Number(f.startYear)) e.end = "End date is before the start date.";
  return e;
}

function ExperienceEditor({
  open,
  initial,
  newOrder,
  onClose,
  onSaved,
}: {
  open: boolean;
  initial: Experience | null;
  newOrder: number;
  onClose: () => void;
  onSaved: (exp: Experience, isNew: boolean) => void;
}) {
  const [f, setF] = useState<FormState>(() => toForm(initial));
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setF((prev) => ({ ...prev, [key]: value }));

  const errors = validate(f);

  const preview = {
    title: joinTitle(f.role || "Your role", f.company),
    location: formatLocation(f.place, f.mode),
    timeFrame: composeTimeFrame(f),
    keyTasks: f.tasks.map((t) => t.trim()).filter(Boolean),
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setSubmitted(true);
    if (Object.keys(errors).length) return;

    setSaving(true);
    const payload = {
      id: initial?.id,
      title: joinTitle(f.role, f.company),
      location: formatLocation(f.place, f.mode),
      timeFrame: composeTimeFrame(f),
      keyTasks: preview.keyTasks,
      order: initial?.order ?? newOrder,
    };
    try {
      const res = await withToast(saveExperience(payload), {
        loading: initial ? "Saving changes…" : "Adding experience…",
        success: initial ? "Experience updated" : "Experience added",
        description: `${f.role}${f.company ? ` at ${f.company}` : ""} is live on your resume.`,
        error: "Couldn't save this experience",
      });
      onSaved({ ...payload, id: res.id, order: payload.order }, !initial);
    } catch {
      // toast already shown
    } finally {
      setSaving(false);
    }
  };

  // Cmd/Ctrl+S saves
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        handleSubmit();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const showErr = (k: keyof typeof errors) => (submitted ? errors[k] : undefined);
  const years = Array.from({ length: 30 }, (_, i) => String(new Date().getFullYear() - i));

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="xl"
      title={initial ? "Edit experience" : "Add experience"}
      description="Changes appear on your home page and resume as soon as you save."
      footer={
        <>
          <span className="mr-auto hidden text-xs text-zinc-400 sm:block">
            <kbd className="rounded border border-zinc-200 bg-white px-1.5 py-0.5 font-mono text-[10px]">Ctrl</kbd>{" "}
            <kbd className="rounded border border-zinc-200 bg-white px-1.5 py-0.5 font-mono text-[10px]">S</kbd> to save
          </span>
          <Button variant="ghost" size="sm" className="lg:hidden" icon={<LuEye size={14} />} onClick={() => setShowPreview((v) => !v)}>
            {showPreview ? "Hide preview" : "Preview"}
          </Button>
          <Button variant="secondary" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={() => handleSubmit()} loading={saving}>
            {initial ? "Save changes" : "Add experience"}
          </Button>
        </>
      }
    >
      <div className="grid lg:grid-cols-[1fr_380px]">
        <form onSubmit={handleSubmit} className="space-y-8 p-6" noValidate>
          {/* Role */}
          <fieldset className="space-y-4">
            <Legend n={1} title="Role" />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Job title" required error={showErr("role")} htmlFor="exp-role">
                <Input id="exp-role" autoFocus value={f.role} onChange={(e) => set("role", e.target.value)} placeholder="Senior Backend Engineer" />
              </Field>
              <Field label="Company" htmlFor="exp-company">
                <Input id="exp-company" value={f.company} onChange={(e) => set("company", e.target.value)} placeholder="Qawqal.com" />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
              <Field label="Location" htmlFor="exp-place" hint="City, country — leave empty for fully remote roles.">
                <Input id="exp-place" leading={<LuMapPin size={15} />} value={f.place} onChange={(e) => set("place", e.target.value)} placeholder="Nairobi, Kenya" />
              </Field>
              <Field label="Work type">
                <div className="inline-flex h-10 rounded-lg border border-zinc-200 bg-zinc-50 p-1 shadow-sm">
                  {WORK_MODES.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => set("mode", m)}
                      className={`rounded-md px-3 text-xs font-medium transition ${
                        f.mode === m ? "bg-white text-zinc-900 shadow-sm ring-1 ring-zinc-200" : "text-zinc-500 hover:text-zinc-800"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </Field>
            </div>
          </fieldset>

          {/* Dates */}
          <fieldset className="space-y-4">
            <Legend n={2} title="Dates" />
            {f.customTimeFrame !== null ? (
              <Field
                label="Dates (free text)"
                error={showErr("custom")}
                hint="This entry's dates couldn't be read automatically."
                aside={
                  <button type="button" className="text-xs font-medium text-brand-600 hover:underline" onClick={() => set("customTimeFrame", null)}>
                    Use date pickers
                  </button>
                }
              >
                <Input value={f.customTimeFrame} onChange={(e) => set("customTimeFrame", e.target.value)} />
              </Field>
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Start" required error={showErr("start")}>
                    <div className="grid grid-cols-[1fr_96px] gap-2">
                      <MonthSelect value={f.startMonth} onChange={(v) => set("startMonth", v)} />
                      <YearInput value={f.startYear} onChange={(v) => set("startYear", v)} years={years} />
                    </div>
                  </Field>
                  <Field label="End" required={!f.current} error={showErr("end")}>
                    {f.current ? (
                      <div className="flex h-10 items-center rounded-lg border border-dashed border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-500">Present</div>
                    ) : (
                      <div className="grid grid-cols-[1fr_96px] gap-2">
                        <MonthSelect value={f.endMonth} onChange={(v) => set("endMonth", v)} />
                        <YearInput value={f.endYear} onChange={(v) => set("endYear", v)} years={years} />
                      </div>
                    )}
                  </Field>
                </div>
                <label className="inline-flex cursor-pointer items-center gap-2.5 text-sm text-zinc-700">
                  <input
                    type="checkbox"
                    checked={f.current}
                    onChange={(e) => set("current", e.target.checked)}
                    className="h-4 w-4 rounded border-zinc-300 accent-brand-500"
                  />
                  I currently work here
                </label>
              </>
            )}
          </fieldset>

          {/* Highlights */}
          <fieldset className="space-y-4">
            <Legend n={3} title="Highlights" />
            <div className="flex gap-3 rounded-lg border border-amber-200/70 bg-amber-50/60 p-3 text-xs leading-relaxed text-amber-900">
              <LuLightbulb size={16} className="mt-0.5 shrink-0 text-amber-500" />
              <p>
                Recruiters skim. Start each point with a strong verb and show impact with numbers — e.g.{" "}
                <em>“Cut API response times by 40% by adding Redis caching.”</em> Aim for 3–5 points.
              </p>
            </div>
            <TaskList tasks={f.tasks} onChange={(tasks) => set("tasks", tasks)} />
          </fieldset>
          <button type="submit" hidden />
        </form>

        {/* Live preview */}
        <aside className={`${showPreview ? "block" : "hidden"} border-t border-zinc-100 bg-zinc-50/70 p-6 lg:block lg:border-l lg:border-t-0`}>
          <div className="sticky top-0">
            <p className="mb-4 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-zinc-400">
              <LuEye size={14} /> Live preview
            </p>
            <div className="theme-light rounded-xl border border-zinc-200 bg-[rgb(var(--c-paper))] p-5 font-sans">
              <ExperienceEntry data={preview} compact />
            </div>
            <p className="mt-3 text-xs text-zinc-400">Shown as: <span className="font-mono">{displayTimeFrame(preview.timeFrame) || "—"}</span></p>
          </div>
        </aside>
      </div>
    </Modal>
  );
}

function Legend({ n, title }: { n: number; title: string }) {
  return (
    <legend className="flex items-center gap-2.5 text-sm font-semibold text-zinc-900">
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900 font-mono text-[10px] text-white">{n}</span>
      {title}
    </legend>
  );
}

function MonthSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <Select value={value} onChange={(e) => onChange(e.target.value)} aria-label="Month">
      <option value="">Month (optional)</option>
      {MONTHS.map((m, i) => (
        <option key={m} value={String(i)}>{m}</option>
      ))}
    </Select>
  );
}

function YearInput({ value, onChange, years }: { value: string; onChange: (v: string) => void; years: string[] }) {
  const id = `years-${useId()}`;
  return (
    <>
      <Input value={value} onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 4))} inputMode="numeric" placeholder="Year" list={id} aria-label="Year" />
      <datalist id={id}>{years.map((y) => <option key={y} value={y} />)}</datalist>
    </>
  );
}

// ---------------------------------------------------------------- Highlights editor
function TaskList({ tasks, onChange }: { tasks: string[]; onChange: (t: string[]) => void }) {
  const refs = useRef<(HTMLTextAreaElement | null)[]>([]);
  // Index to focus after the next render (set by add / remove / move / paste)
  const pendingFocus = useRef<number | null>(null);
  const setFocusIndex = (i: number) => {
    pendingFocus.current = i;
  };

  useEffect(() => {
    if (pendingFocus.current !== null) {
      refs.current[pendingFocus.current]?.focus();
      pendingFocus.current = null;
    }
  });

  const update = (i: number, value: string) => onChange(tasks.map((t, j) => (j === i ? value : t)));
  const insertAfter = (i: number, values: string[] = [""]) => {
    const next = [...tasks];
    next.splice(i + 1, 0, ...values);
    onChange(next);
    setFocusIndex(i + values.length);
  };
  const remove = (i: number) => {
    const next = tasks.filter((_, j) => j !== i);
    onChange(next.length ? next : [""]);
    setFocusIndex(Math.max(0, i - 1));
  };
  const moveTask = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= tasks.length) return;
    const next = [...tasks];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
    setFocusIndex(j);
  };

  const onPaste = (i: number, e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const text = e.clipboardData.getData("text");
    const lines = text.split(/\r?\n/).map((l) => l.replace(/^\s*(?:[-*•–]|\d+[.)])\s*/, "").trim()).filter(Boolean);
    if (lines.length < 2) return;
    // A pasted list becomes one highlight per line.
    e.preventDefault();
    const next = [...tasks];
    const merged = tasks[i].trim() ? [tasks[i].trim(), ...lines] : lines;
    next.splice(i, 1, ...merged);
    onChange(next);
    setFocusIndex(i + merged.length - 1);
  };

  return (
    <div className="space-y-2">
      {tasks.map((task, i) => (
        <div key={i} className="group flex items-start gap-2">
          <span className="mt-2.5 w-5 shrink-0 text-right font-mono text-xs text-zinc-400">{i + 1}.</span>
          <div className="relative flex-1">
            <AutoTextarea
              ref={(el) => { refs.current[i] = el; }}
              value={task}
              onChange={(v) => update(i, v)}
              onPaste={(e) => onPaste(i, e)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  insertAfter(i);
                } else if (e.key === "Backspace" && task === "" && tasks.length > 1) {
                  e.preventDefault();
                  remove(i);
                } else if (e.altKey && e.key === "ArrowUp") {
                  e.preventDefault();
                  moveTask(i, -1);
                } else if (e.altKey && e.key === "ArrowDown") {
                  e.preventDefault();
                  moveTask(i, 1);
                }
              }}
              placeholder={i === 0 ? "Built a real-time chat service with Socket.io serving 50k+ users…" : "Another achievement…"}
            />
            {task.length > TASK_SOFT_LIMIT * 0.8 && (
              <span className={`pointer-events-none absolute bottom-1.5 right-2 font-mono text-[10px] ${task.length > TASK_SOFT_LIMIT ? "text-amber-600" : "text-zinc-400"}`}>
                {task.length}/{TASK_SOFT_LIMIT}
              </span>
            )}
          </div>
          <div className="mt-1 flex shrink-0 items-center opacity-40 transition group-focus-within:opacity-100 group-hover:opacity-100">
            <IconButton label="Move up (Alt+↑)" onClick={() => moveTask(i, -1)} disabled={i === 0}><LuArrowUp size={14} /></IconButton>
            <IconButton label="Move down (Alt+↓)" onClick={() => moveTask(i, 1)} disabled={i === tasks.length - 1}><LuArrowDown size={14} /></IconButton>
            <IconButton label="Remove" onClick={() => remove(i)} danger disabled={tasks.length === 1 && !task}><LuTrash2 size={14} /></IconButton>
          </div>
        </div>
      ))}
      <div className="flex flex-wrap items-center justify-between gap-2 pl-7 pt-1">
        <Button type="button" variant="secondary" size="sm" icon={<LuPlus size={14} />} onClick={() => insertAfter(tasks.length - 1)}>
          Add highlight
        </Button>
        <p className="text-[11px] text-zinc-400">Enter adds a new point · paste a list to split it into points</p>
      </div>
    </div>
  );
}

const AutoTextarea = React.forwardRef<
  HTMLTextAreaElement,
  {
    value: string;
    onChange: (v: string) => void;
    onKeyDown?: React.KeyboardEventHandler<HTMLTextAreaElement>;
    onPaste?: React.ClipboardEventHandler<HTMLTextAreaElement>;
    placeholder?: string;
  }
>(function AutoTextarea({ value, onChange, onKeyDown, onPaste, placeholder }, forwardedRef) {
  const inner = useRef<HTMLTextAreaElement | null>(null);
  const setRef = useCallback(
    (el: HTMLTextAreaElement | null) => {
      inner.current = el;
      if (typeof forwardedRef === "function") forwardedRef(el);
      else if (forwardedRef) forwardedRef.current = el;
    },
    [forwardedRef]
  );

  useEffect(() => {
    const el = inner.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  return (
    <textarea
      ref={setRef}
      rows={1}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={onKeyDown}
      onPaste={onPaste}
      placeholder={placeholder}
      className="block w-full resize-none overflow-hidden rounded-lg border border-zinc-200 bg-white px-3 py-2 pr-14 text-sm leading-relaxed text-zinc-900 shadow-sm transition placeholder:text-zinc-400 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
    />
  );
});
