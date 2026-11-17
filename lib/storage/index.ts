import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { isDeployed } from "@/lib/runtime";
import {
  STORAGE_KEY_PREFIX,
  UPLOAD_DIR,
  UPLOAD_URL_PREFIX,
  getStorageConfig,
  publicUrlFor,
  putObject,
} from "./s3.mjs";

const storage = getStorageConfig();
// Local uploads are only read in local mode; keep them out of the deployed server bundle
// (otherwise the whole project, public/ included, gets traced into every function).
const localDir = path.join(/*turbopackIgnore: true*/ process.cwd(), UPLOAD_DIR);

export const storageConfigured = storage !== null;

export class UploadError extends Error {}

export type UploadResult = {
  /** URL to show and save. Saving converts it back to the canonical /assets/uploads/… path. */
  url: string;
  storedIn: ("local" | "storage")[];
  warning?: string;
};

/**
 * Saves an uploaded file.
 * - Deployed: object storage only. Throws if storage isn't configured or the upload fails.
 * - Local: always writes public/assets/uploads/<file> (so the site works without storage),
 *   and also uploads to storage when configured. A storage failure only produces a warning;
 *   `pnpm db:sync` uploads the file later.
 */
export async function saveUpload(buffer: Buffer, fileName: string, contentType: string): Promise<UploadResult> {
  const ext = path.extname(fileName).toLowerCase();
  const base = path.basename(fileName, path.extname(fileName)).replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 60) || "file";
  const file = `${Date.now()}-${base}${ext}`;
  const key = STORAGE_KEY_PREFIX + file;
  const canonical = UPLOAD_URL_PREFIX + file;

  if (isDeployed()) {
    if (!storage) {
      throw new UploadError("Object storage isn't configured on this deployment, so files can't be uploaded.");
    }
    try {
      await putObject(storage, key, buffer, contentType);
    } catch (err) {
      console.error("[storage] Upload failed:", err);
      throw new UploadError("Object storage is unreachable, so the file wasn't uploaded. Please try again.");
    }
    return { url: publicUrlFor(storage, key), storedIn: ["storage"] };
  }

  await fsp.mkdir(localDir, { recursive: true });
  await fsp.writeFile(path.join(localDir, file), buffer);
  const result: UploadResult = { url: canonical, storedIn: ["local"] };

  if (storage) {
    try {
      await putObject(storage, key, buffer, contentType);
      result.storedIn.push("storage");
    } catch (err) {
      console.error("[storage] Upload failed, kept the local copy:", err);
      result.warning = "Saved locally, but object storage is unreachable. It will be uploaded on the next `pnpm db:sync`.";
    }
  } else {
    result.warning = "Saved to public/assets/uploads only (object storage isn't configured).";
  }
  return result;
}

/**
 * Turns a stored asset path into a URL that works in the current environment.
 * `/assets/uploads/x.png` → the local file when it exists, otherwise the storage copy.
 */
export function resolveAssetUrl<T extends string | null | undefined>(url: T): T {
  if (!url || !url.startsWith(UPLOAD_URL_PREFIX)) return url;
  const file = url.slice(UPLOAD_URL_PREFIX.length);
  if (!isDeployed() && fs.existsSync(path.join(/*turbopackIgnore: true*/ localDir, file))) return url;
  return (storage ? publicUrlFor(storage, STORAGE_KEY_PREFIX + file) : url) as T;
}

/** The inverse, used before saving: storage URLs of uploads are stored as `/assets/uploads/…`. */
export function canonicalAssetUrl<T extends string | null | undefined>(url: T): T {
  if (!url || !storage) return url;
  const prefix = publicUrlFor(storage, STORAGE_KEY_PREFIX);
  return (url.startsWith(prefix) ? UPLOAD_URL_PREFIX + url.slice(prefix.length) : url) as T;
}
