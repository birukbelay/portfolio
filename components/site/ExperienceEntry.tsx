import { LuMapPin } from "react-icons/lu";
import { displayTimeFrame, isCurrent, splitTitle } from "@/lib/experience";

export interface ExperienceData {
  title: string;
  location: string;
  timeFrame: string;
  keyTasks: string[];
}

/** One role on the timeline. Uses the public-site color tokens. */
export default function ExperienceEntry({
  data,
  maxTasks,
  compact,
}: {
  data: ExperienceData;
  maxTasks?: number;
  compact?: boolean;
}) {
  const { role, company } = splitTitle(data.title);
  const current = isCurrent(data.timeFrame);
  const tasks = maxTasks ? data.keyTasks.slice(0, maxTasks) : data.keyTasks;

  return (
    <article className="relative pl-8">
      {/* Timeline marker */}
      <span
        aria-hidden
        className={`absolute left-0 top-1.5 h-3 w-3 rounded-full border-2 ${
          current ? "border-accent bg-accent" : "border-ink/30 bg-paper"
        }`}
      />
      <div className={`flex flex-col gap-1 ${compact ? "" : "sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"}`}>
        <h3 className="text-lg font-semibold leading-snug tracking-tight text-ink">
          {role}
          {company && (
            <>
              <span className="font-normal text-muted"> at </span>
              <span className="text-accent">{company}</span>
            </>
          )}
        </h3>
        <p className="shrink-0 font-mono text-xs uppercase tracking-wider text-muted">{displayTimeFrame(data.timeFrame)}</p>
      </div>

      <div className="mt-1.5 flex flex-wrap items-center gap-2 text-sm text-muted">
        {data.location && (
          <span className="inline-flex items-center gap-1">
            <LuMapPin size={14} />
            {data.location.replace(/:\s*(remote|hybrid|on-?site)\s*$/i, (_, m: string) => ` · ${m[0].toUpperCase()}${m.slice(1)}`)}
          </span>
        )}
        {current && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Current
          </span>
        )}
      </div>

      {tasks.length > 0 && (
        <ul className={`mt-3 space-y-2 ${compact ? "text-sm" : "text-[15px]"} leading-relaxed text-ink/80`}>
          {tasks.map((task, i) => (
            <li key={i} className="relative pl-5">
              <span aria-hidden className="absolute left-0 top-[0.7em] h-px w-2.5 bg-accent" />
              {task.replace(/\s+/g, " ").trim()}
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
