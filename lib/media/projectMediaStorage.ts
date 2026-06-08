import "server-only";

import crypto from "node:crypto";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const PROJECT_MEDIA_BUCKET = "project-media";
export const PROJECT_MEDIA_MAX_SIZE_BYTES = 5 * 1024 * 1024;

const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"] as const;
type ProjectMediaMimeType = (typeof allowedMimeTypes)[number];

export type ProjectMediaContextType = "project" | "region" | "activity";
export type ProjectMediaPurpose = "cover" | "thumbnail" | "gallery" | "activity-cover" | "region-cover";

export type ProjectMediaUploadInput = {
  file: File;
  contextType: ProjectMediaContextType;
  entityId: string;
  purpose: ProjectMediaPurpose;
  adminUserId: string;
};

export type ProjectMediaUploadResult = {
  bucket: string;
  path: string;
  publicUrl: string;
  mimeType: ProjectMediaMimeType;
  sizeBytes: number;
};

function getAdminStorageClient() {
  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    throw new Error("Supabase service role env eksik olduğu için görsel yükleme yapılamadı.");
  }

  return supabase;
}

function isProjectMediaMimeType(value: string): value is ProjectMediaMimeType {
  return allowedMimeTypes.includes(value as ProjectMediaMimeType);
}

function extensionForMimeType(mimeType: ProjectMediaMimeType) {
  if (mimeType === "image/png") return "png";
  if (mimeType === "image/webp") return "webp";
  return "jpg";
}

function safePathSegment(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 96) || "media";
}

function safeFileNameBase(fileName: string) {
  const base = fileName.replace(/\.[^.]+$/, "");
  return safePathSegment(base).slice(0, 48) || "image";
}

function folderForContext(contextType: ProjectMediaContextType) {
  if (contextType === "project") return "projects";
  if (contextType === "region") return "regions";
  return "activities";
}

function folderForPurpose(purpose: ProjectMediaPurpose) {
  if (purpose === "activity-cover" || purpose === "region-cover") return "cover";
  return safePathSegment(purpose);
}

export function getOptionalProjectMediaFile(formData: FormData, name: string): File | null {
  const value = formData.get(name);
  if (!value || typeof value === "string") return null;
  const file = value as File;
  if (!file.size) return null;
  return file;
}

export function validateProjectMediaFile(file: File) {
  if (!isProjectMediaMimeType(file.type)) {
    throw new Error("Lütfen JPG, PNG veya WebP formatında bir görsel seçin.");
  }

  if (file.size > PROJECT_MEDIA_MAX_SIZE_BYTES) {
    throw new Error("Görsel boyutu çok büyük. En fazla 5 MB yükleyebilirsiniz.");
  }
}

export function buildProjectMediaPath(input: {
  contextType: ProjectMediaContextType;
  entityId: string;
  purpose: ProjectMediaPurpose;
  fileName: string;
  mimeType: ProjectMediaMimeType;
}) {
  const uuid = crypto.randomUUID();
  const extension = extensionForMimeType(input.mimeType);
  const contextFolder = folderForContext(input.contextType);
  const entity = safePathSegment(input.entityId);
  const purpose = folderForPurpose(input.purpose);
  const baseName = safeFileNameBase(input.fileName);
  return `${contextFolder}/${entity}/${purpose}/${uuid}-${baseName}.${extension}`;
}

export function getPublicProjectMediaUrl(path: string) {
  const supabase = getAdminStorageClient();
  const { data } = supabase.storage.from(PROJECT_MEDIA_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export function parseProjectMediaPathFromUrl(url?: string | null) {
  if (!url) return null;

  try {
    const parsed = new URL(url);
    const marker = `/storage/v1/object/public/${PROJECT_MEDIA_BUCKET}/`;
    const markerIndex = parsed.pathname.indexOf(marker);
    if (markerIndex < 0) return null;

    const path = parsed.pathname.slice(markerIndex + marker.length);
    return path ? decodeURIComponent(path) : null;
  } catch {
    return null;
  }
}

export async function uploadProjectMediaFile(input: ProjectMediaUploadInput): Promise<ProjectMediaUploadResult> {
  validateProjectMediaFile(input.file);
  const mimeType = input.file.type as ProjectMediaMimeType;
  const path = buildProjectMediaPath({
    contextType: input.contextType,
    entityId: input.entityId,
    purpose: input.purpose,
    fileName: input.file.name,
    mimeType
  });
  const bytes = new Uint8Array(await input.file.arrayBuffer());
  const supabase = getAdminStorageClient();
  const { error } = await supabase.storage.from(PROJECT_MEDIA_BUCKET).upload(path, bytes, {
    contentType: mimeType,
    upsert: false,
    metadata: {
      contextType: input.contextType,
      entityId: input.entityId,
      purpose: input.purpose,
      adminUserId: input.adminUserId
    }
  });

  if (error) {
    const message = /bucket|not found/i.test(error.message)
      ? "project-media storage bucket bulunamadı. 023 migration uygulanmalı."
      : "Görsel project-media storage alanına yüklenemedi.";
    throw new Error(message);
  }

  return {
    bucket: PROJECT_MEDIA_BUCKET,
    path,
    publicUrl: getPublicProjectMediaUrl(path),
    mimeType,
    sizeBytes: input.file.size
  };
}

export async function deleteProjectMediaFile(path: string) {
  if (!path) return;
  const supabase = getAdminStorageClient();
  const { error } = await supabase.storage.from(PROJECT_MEDIA_BUCKET).remove([path]);
  if (error) {
    console.warn("[project-media] delete_failed", {
      path,
      message: error.message
    });
  }
}
