// filepath: src/lib/r2.ts
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;

/**
 * Validates presence of all required Cloudflare R2 environment variables.
 */
export const isR2Configured = (): boolean => {
  return Boolean(
    R2_ACCOUNT_ID &&
    R2_ACCESS_KEY_ID &&
    R2_SECRET_ACCESS_KEY &&
    R2_BUCKET_NAME
  );
};

/**
 * Global singleton pattern for S3Client to prevent connection socket leaks
 * across Next.js 14 fast-refresh cycles during local development.
 */
const globalForR2 = globalThis as unknown as {
  r2Client: S3Client | undefined;
};

export const r2Client: S3Client =
  globalForR2.r2Client ??
  new S3Client({
    region: "auto",
    endpoint: R2_ACCOUNT_ID
      ? `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
      : "https://fallback.r2.cloudflarestorage.com",
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID || "missing-access-key",
      secretAccessKey: R2_SECRET_ACCESS_KEY || "missing-secret-key",
    },
    forcePathStyle: true,
  });

if (process.env.NODE_ENV !== "production") {
  globalForR2.r2Client = r2Client;
}

/**
 * Returns the target R2 bucket name or raises an invariant error.
 */
export function getBucketName(): string {
  if (!R2_BUCKET_NAME) {
    throw new Error("R2_BUCKET_NAME environment variable is not defined.");
  }
  return R2_BUCKET_NAME;
}

/**
 * Sanitizes object keys to URL-safe ASCII strings for deterministic S3 storage paths.
 */
export function sanitizeFileName(fileName: string): string {
  return fileName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9.-]/g, "-")
    .replace(/-+/g, "-");
}

/**
 * Sanitizes file names for HTTP Content-Disposition headers to prevent 
 * header injection (CRLF), quote escaping exploits, and character encoding issues.
 */
export function sanitizeHeaderFilename(fileName: string): string {
  return fileName.replace(/["\r\n\\]/g, "").trim() || "proofdesk-master-file";
}

export interface BuildStorageKeyParams {
  agencyId: string;
  projectId: string;
  deliverableId: string;
  versionNumber: number;
  fileName: string;
  type: "clean" | "preview";
}

/**
 * Constructs a scoped, isolated multi-tenant object path in Cloudflare R2.
 */
export function buildStorageKey({
  agencyId,
  projectId,
  deliverableId,
  versionNumber,
  fileName,
  type,
}: BuildStorageKeyParams): string {
  const sanitized = sanitizeFileName(fileName);
  const nonce = crypto.randomUUID().slice(0, 8);
  return `agencies/${agencyId}/projects/${projectId}/deliverables/${deliverableId}/v${versionNumber}/${type}_${nonce}_${sanitized}`;
}

export interface PresignedUploadParams {
  key: string;
  contentType: string;
  contentLength?: number;
  expiresIn?: number; // Defaults to 300s (5m)
}

/**
 * Generates an authorized PUT pre-signed URL for direct browser-to-R2 ingestion.
 * Bypasses Next.js server payload limits.
 */
export async function generatePresignedUploadUrl({
  key,
  contentType,
  contentLength,
  expiresIn = 300,
}: PresignedUploadParams): Promise<{ uploadUrl: string; key: string }> {
  if (!isR2Configured()) {
    throw new Error("Cloudflare R2 is not configured. Missing environment credentials.");
  }

  const command = new PutObjectCommand({
    Bucket: getBucketName(),
    Key: key,
    ContentType: contentType,
    ...(contentLength ? { ContentLength: contentLength } : {}),
  });

  const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn });
  return { uploadUrl, key };
}

export interface PresignedPreviewParams {
  key: string;
  contentType?: string;
  expiresIn?: number; // Strictly defaults to 60s per security invariants
}

/**
 * Generates a short-lived (60s) preview URL.
 * Sets Content-Disposition to inline to ensure canvas and browser render without triggering download.
 */
export async function generatePresignedPreviewUrl({
  key,
  contentType,
  expiresIn = 60,
}: PresignedPreviewParams): Promise<string> {
  if (!isR2Configured()) {
    throw new Error("Cloudflare R2 is not configured. Missing environment credentials.");
  }

  const command = new GetObjectCommand({
    Bucket: getBucketName(),
    Key: key,
    ResponseContentDisposition: "inline",
    ...(contentType ? { ResponseContentType: contentType } : {}),
  });

  return await getSignedUrl(r2Client, command, { expiresIn });
}

export interface PresignedDownloadParams {
  key: string;
  downloadFileName: string;
  contentType?: string;
  expiresIn?: number; // Defaults to 60s per security invariants
}

/**
 * Generates a short-lived (60s) download URL for unwatermarked master assets.
 * Sets Content-Disposition to attachment to force native browser download.
 */
export async function generatePresignedDownloadUrl({
  key,
  downloadFileName,
  contentType,
  expiresIn = 60,
}: PresignedDownloadParams): Promise<string> {
  if (!isR2Configured()) {
    throw new Error("Cloudflare R2 is not configured. Missing environment credentials.");
  }

  const safeHeaderFileName = sanitizeHeaderFilename(downloadFileName);

  const command = new GetObjectCommand({
    Bucket: getBucketName(),
    Key: key,
    ResponseContentDisposition: `attachment; filename="${safeHeaderFileName}"`,
    ...(contentType ? { ResponseContentType: contentType } : {}),
  });

  return await getSignedUrl(r2Client, command, { expiresIn });
}

/**
 * Deletes an object from Cloudflare R2 by key.
 */
export async function deleteR2Object(key: string): Promise<void> {
  if (!isR2Configured()) return;

  const command = new DeleteObjectCommand({
    Bucket: getBucketName(),
    Key: key,
  });

  await r2Client.send(command);
}

/**
 * Performs a HEAD check on Cloudflare R2 to verify object existence without reading payload.
 */
export async function verifyR2ObjectExists(key: string): Promise<boolean> {
  if (!isR2Configured()) return false;

  try {
    const command = new HeadObjectCommand({
      Bucket: getBucketName(),
      Key: key,
    });
    await r2Client.send(command);
    return true;
  } catch {
    return false;
  }
}

/**
 * Reads an object from Cloudflare R2 into a Node Buffer.
 */
export async function getR2ObjectBuffer(key: string): Promise<{ buffer: Buffer; contentType: string }> {
  if (!isR2Configured()) {
    throw new Error("Cloudflare R2 is not configured.");
  }

  const command = new GetObjectCommand({
    Bucket: getBucketName(),
    Key: key,
  });

  const res = await r2Client.send(command);
  const stream = res.Body;
  if (!stream) {
    throw new Error(`Empty body returned for R2 object: ${key}`);
  }

  const chunks: Uint8Array[] = [];
  for await (const chunk of stream as AsyncIterable<Uint8Array>) {
    chunks.push(chunk instanceof Uint8Array ? chunk : Buffer.from(chunk));
  }

  return {
    buffer: Buffer.concat(chunks),
    contentType: res.ContentType || "application/octet-stream",
  };
}