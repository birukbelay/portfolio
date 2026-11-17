"use client";

import { toast } from "sonner";

type Failure = { success: false; error: string };
const isFailure = (r: unknown): r is Failure =>
  typeof r === "object" && r !== null && (r as { success?: unknown }).success === false;

/**
 * Runs a save/delete and shows a loading → success / error toast.
 * Server actions report problems as `{ success: false, error }`; those become an error toast
 * and a thrown Error, so callers only continue on success.
 * When a local-mode write reached only portfolio.db (D1 unreachable), the success toast
 * becomes a warning saying it will sync later.
 */
export async function withToast<T>(
  action: Promise<T>,
  messages: { loading: string; success: string; error: string; description?: string }
): Promise<Exclude<T, Failure>> {
  const id = toast.loading(messages.loading);
  let result: T;
  try {
    result = await action;
  } catch (err) {
    toast.error(messages.error, {
      id,
      description: err instanceof Error ? err.message : "Something went wrong. Please try again.",
    });
    throw err;
  }

  if (isFailure(result)) {
    toast.error(messages.error, { id, description: result.error, duration: 8000 });
    throw new Error(result.error);
  }

  if ((result as { synced?: boolean } | undefined)?.synced === false) {
    toast.warning(messages.success, {
      id,
      description: "Cloudflare D1 is unreachable, so this was saved locally and will sync on the next `pnpm db:sync`.",
    });
  } else {
    toast.success(messages.success, { id, description: messages.description });
  }
  return result as Exclude<T, Failure>;
}

export { toast };
