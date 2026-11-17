import React from "react";
import Link from "next/link";
import Image from "next/image";
import { getProjects } from "@/lib/db/queries";
import { LuPlus, LuExternalLink, LuFolderKanban } from "react-icons/lu";
import { Badge, ButtonLink, EmptyState, PageHeader } from "@/components/admin/ui";

export default async function AdminProjectsPage() {
  const projects = await getProjects();

  return (
    <div>
      <PageHeader
        title="Projects"
        description="Shown in this order on your home page. Lower display order comes first."
        actions={<ButtonLink href="/admin/projects/new" icon={<LuPlus size={16} />}>New project</ButtonLink>}
      />

      {projects.length === 0 ? (
        <EmptyState
          icon={<LuFolderKanban size={22} />}
          title="No projects yet"
          description="Projects are the strongest proof of your skills. Add your best work first."
          action={<ButtonLink href="/admin/projects/new" icon={<LuPlus size={16} />}>Add a project</ButtonLink>}
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <div key={p.id} className="group relative flex flex-col overflow-hidden rounded-xl border border-zinc-200/80 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-lg">
              <Link href={`/admin/projects/${p.id}`} className="absolute inset-0 z-10" aria-label={`Edit ${p.name}`} />
              <div className="relative aspect-video bg-zinc-100">
                {p.image && <Image src={p.image} alt="" fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />}
                <span className="absolute left-3 top-3 rounded-md bg-white/90 px-1.5 py-0.5 font-mono text-[10px] font-medium text-zinc-600 shadow-sm backdrop-blur">
                  #{p.order}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-4">
                <h3 className="font-semibold text-zinc-900">{p.name}</h3>
                <p className="mt-0.5 line-clamp-1 text-xs text-zinc-500">{p.tech}</p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {p.technologies.slice(0, 4).map((t) => <Badge key={t}>{t}</Badge>)}
                  {p.technologies.length > 4 && <span className="self-center text-[11px] text-zinc-400">+{p.technologies.length - 4}</span>}
                </div>
                <div className="mt-auto flex items-center justify-between pt-4 text-xs">
                  <span className="font-medium text-zinc-900 group-hover:underline">Edit</span>
                  <Link href={`/${p.id}`} target="_blank" className="relative z-20 inline-flex items-center gap-1 text-zinc-500 hover:text-zinc-900">
                    View live <LuExternalLink size={12} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
