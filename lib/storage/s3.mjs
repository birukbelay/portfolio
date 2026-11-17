// S3-compatible object storage (Supabase Storage, Cloudflare R2, AWS S3…).
// Shared by the app (lib/storage/index.ts) and the sync script (scripts/sync-db.mjs).
import { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";

/** Uploaded files live under this folder locally and under this key prefix in the bucket. */
export const UPLOAD_DIR = "public/assets/uploads";
export const UPLOAD_URL_PREFIX = "/assets/uploads/";
export const STORAGE_KEY_PREFIX = "uploads/";

/**
 * @typedef {{ client: S3Client, bucket: string, publicBaseUrl: string }} StorageConfig
 * @returns {StorageConfig | null}
 */
export function getStorageConfig() {
  const env = process.env;
  const endpoint =
    env.STORAGE_ENDPOINT || (env.R2_ACCOUNT_ID ? `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com` : undefined);
  const accessKeyId = env.STORAGE_ACCESS_KEY_ID || env.R2_ACCESS_KEY_ID;
  const secretAccessKey = env.STORAGE_SECRET_ACCESS_KEY || env.R2_SECRET_ACCESS_KEY;
  const bucket = env.STORAGE_BUCKET || env.R2_BUCKET_NAME;
  const publicUrl = env.STORAGE_PUBLIC_URL || env.R2_PUBLIC_URL;
  if (!endpoint || !accessKeyId || !secretAccessKey || !bucket) return null;

  const client = new S3Client({
    region: env.STORAGE_REGION || "auto",
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
    forcePathStyle: true,
  });
  const publicBaseUrl = (publicUrl || `${endpoint.replace(/\/$/, "")}/${bucket}`).replace(/\/$/, "");
  return { client, bucket, publicBaseUrl };
}

/** Public URL of an object, e.g. https://…/uploads/123-logo.png */
export function publicUrlFor(config, key) {
  return `${config.publicBaseUrl}/${key}`;
}

export async function putObject(config, key, body, contentType) {
  await config.client.send(
    new PutObjectCommand({ Bucket: config.bucket, Key: key, Body: body, ContentType: contentType || undefined })
  );
}

/** @returns {Promise<Buffer>} */
export async function getObject(config, key) {
  const res = await config.client.send(new GetObjectCommand({ Bucket: config.bucket, Key: key }));
  return Buffer.from(await res.Body.transformToByteArray());
}

/** @returns {Promise<string[]>} every key under `prefix` */
export async function listKeys(config, prefix) {
  const keys = [];
  let token;
  do {
    const res = await config.client.send(
      new ListObjectsV2Command({ Bucket: config.bucket, Prefix: prefix, ContinuationToken: token })
    );
    for (const obj of res.Contents ?? []) if (obj.Key && !obj.Key.endsWith("/")) keys.push(obj.Key);
    token = res.IsTruncated ? res.NextContinuationToken : undefined;
  } while (token);
  return keys;
}

const TYPES = {
  ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp",
  ".gif": "image/gif", ".svg": "image/svg+xml", ".avif": "image/avif", ".mp4": "video/mp4", ".webm": "video/webm",
};
export function contentTypeFor(fileName) {
  const ext = fileName.slice(fileName.lastIndexOf(".")).toLowerCase();
  return TYPES[ext] || "application/octet-stream";
}
