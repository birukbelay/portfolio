import React from "react";
import { Toaster } from "sonner";
import { auth, signOut } from "@/auth";
import AdminNav from "@/components/admin/AdminNav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  async function signOutAction() {
    "use server";
    await signOut({ redirectTo: "/admin/login" });
  }

  return (
    // The admin panel is always light, regardless of the OS theme used by the public site.
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 [color-scheme:light] md:flex">
      {session?.user ? (
        <>
          <AdminNav email={session.user.email ?? ""} signOutAction={signOutAction} />
          <main className="min-w-0 flex-1">
            <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8 sm:py-10">{children}</div>
          </main>
        </>
      ) : (
        <main className="min-w-0 flex-1">{children}</main>
      )}
      <Toaster position="bottom-right" richColors closeButton theme="light" toastOptions={{ className: "font-sans" }} />
    </div>
  );
}
