export const BLOBATAR_FRAMES = ["rounded", "circle", "squircle"] as const;

export type BlobatarFrame = (typeof BLOBATAR_FRAMES)[number];

export const DEFAULT_DISPLAY_NAME = "Niel";
export const DEFAULT_HANDLE = "@nielpoko";
export const DEFAULT_BLOBATAR_SEED = "nielpoko";
export const DEFAULT_BLOBATAR_MOOD = "happy" as const;
export const DEFAULT_BLOBATAR_FRAME: BlobatarFrame = "rounded";

export const PROFILE_LIMITS = {
  displayNameMax: 40,
  handleMax: 30,
  seedMax: 40,
} as const;

export interface BlobatarFrameOption {
  id: BlobatarFrame;
  label: string;
  description: string;
}

export const BLOBATAR_FRAME_OPTIONS: readonly BlobatarFrameOption[] = [
  { id: "rounded", label: "Kotak", description: "Sudut Neo-Brutalist tegas" },
  { id: "circle", label: "Bulat", description: "Lingkaran penuh klasik" },
  { id: "squircle", label: "Squircle", description: "Lengkung organik lembut" },
] as const;

export interface BlobatarPalette {
  name: string;
  body: string;
  cheek: string;
  stageBg: string;
}

export const BLOBATAR_PALETTE: readonly BlobatarPalette[] = [
  { name: "lime", body: "#C8FF3D", cheek: "#FF6B8B", stageBg: "#FFFDF5" },
  { name: "yellow", body: "#FFE14D", cheek: "#FF6B8B", stageBg: "#FFFDF5" },
  { name: "coral", body: "#FF6B8B", cheek: "#FFE14D", stageBg: "#FFFDF5" },
  { name: "cyan", body: "#5CE1FF", cheek: "#FF6B8B", stageBg: "#FFFDF5" },
  { name: "lavender", body: "#D6B8FF", cheek: "#FFE14D", stageBg: "#FFFDF5" },
  { name: "peach", body: "#FFB87A", cheek: "#FF6B8B", stageBg: "#FFFDF5" },
  { name: "mint", body: "#7CFFB2", cheek: "#FF6B8B", stageBg: "#FFFDF5" },
] as const;

export type BlobatarAccessoryType = 0 | 1 | 2 | 3 | 4;

export interface BlobatarSpec {
  normalizedSeed: string;
  hash: number;
  palette: BlobatarPalette;
  lobes: number;
  blobPath: string;
  accessoryType: BlobatarAccessoryType;
  breatheDelaySeconds: number;
  blinkDelaySeconds: number;
}

export interface ClerkSeedSource {
  id?: string | null;
  username?: string | null;
  email?: string | null;
}

export function isBlobatarFrame(value: unknown): value is BlobatarFrame {
  return typeof value === "string" && (BLOBATAR_FRAMES as readonly string[]).includes(value);
}

export function normalizeBlobatarFrame(value: unknown): BlobatarFrame {
  if (isBlobatarFrame(value)) {
    return value;
  }

  if (typeof value === "string") {
    const lower = value.trim().toLowerCase();
    if (lower === "default" || lower === "badge" || lower === "square") {
      return "rounded";
    }
  }

  return DEFAULT_BLOBATAR_FRAME;
}

export function normalizeDisplayName(raw: string | null | undefined): string {
  const cleaned = (raw ?? "").trim().replace(/\s+/g, " ");
  if (!cleaned) {
    return DEFAULT_DISPLAY_NAME;
  }
  return cleaned.slice(0, PROFILE_LIMITS.displayNameMax);
}

export function normalizeHandle(raw: string | null | undefined): string {
  const cleaned = (raw ?? "")
    .trim()
    .replace(/^@+/, "")
    .replace(/[^a-zA-Z0-9._-]/g, "")
    .toLowerCase();

  if (!cleaned) {
    return DEFAULT_HANDLE;
  }

  return `@${cleaned.slice(0, PROFILE_LIMITS.handleMax - 1)}`;
}

export function normalizeSeed(raw: string | null | undefined): string {
  const cleaned = (raw ?? "").trim();
  if (!cleaned) {
    return DEFAULT_BLOBATAR_SEED;
  }
  return cleaned.slice(0, PROFILE_LIMITS.seedMax);
}

/**
 * Menurunkan satu seed Blobatar unik dan deterministik langsung dari profil Clerk user.
 */
export function deriveClerkBlobatarSeed(source: ClerkSeedSource): string {
  const candidate =
    source.id?.trim() || source.username?.trim() || source.email?.trim() || DEFAULT_BLOBATAR_SEED;
  return normalizeSeed(candidate);
}

export function extractFirstName(displayName: string): string {
  const trimmed = displayName.trim();
  if (!trimmed) {
    return DEFAULT_DISPLAY_NAME;
  }
  return trimmed.split(/\s+/)[0] || DEFAULT_DISPLAY_NAME;
}

/**
 * FNV-1a 32-bit string hash — deterministik dan konsisten di server maupun client.
 */
export function hashSeed(seed: string): number {
  let hash = 2166136261 >>> 0;
  const clean = (seed || DEFAULT_BLOBATAR_SEED).toLowerCase().trim();
  for (let i = 0; i < clean.length; i += 1) {
    hash ^= clean.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/**
 * Mulberry32 PRNG deterministik dari integer seed.
 */
export function mulberry32(initialSeed: number): () => number {
  let a = initialSeed >>> 0;
  return function next() {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Membangun path kurva organik tertutup (Catmull-Rom -> cubic Bezier) seperti prototipe poko.html.
 */
export function buildOrganicBlobPath(
  rng: () => number,
  cx: number,
  cy: number,
  baseR: number,
  pointsCount: number
): string {
  const pts: Array<{ x: number; y: number }> = [];
  const squashX = 0.92 + rng() * 0.16;
  const squashY = 0.9 + rng() * 0.16;

  for (let i = 0; i < pointsCount; i += 1) {
    const angle = (Math.PI * 2 * i) / pointsCount;
    const jitter = 0.84 + rng() * 0.28;
    const r = baseR * jitter;
    pts.push({
      x: cx + Math.cos(angle) * r * squashX,
      y: cy + Math.sin(angle) * r * squashY,
    });
  }

  let d = "";
  const n = pts.length;
  for (let i = 0; i < n; i += 1) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    if (i === 0) {
      d += `M ${p1.x.toFixed(1)} ${p1.y.toFixed(1)} `;
    }
    d += `C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)} `;
  }

  return `${d}Z`;
}

/**
 * Menghasilkan spesifikasi visual SVG Blobatar deterministik dari identitas Clerk user.
 */
export function generateBlobatarSpec(seed: string): BlobatarSpec {
  const normalizedSeed = normalizeSeed(seed);
  const hash = hashSeed(normalizedSeed);
  const rng = mulberry32(hash);

  const palette = BLOBATAR_PALETTE[Math.floor(rng() * BLOBATAR_PALETTE.length)];
  const lobes = 7 + Math.floor(rng() * 3); // 7..9 organic lobes
  const blobPath = buildOrganicBlobPath(rng, 50, 54, 34, lobes);
  const accessoryType = Math.floor(rng() * 5) as BlobatarAccessoryType;

  const breatheDelaySeconds = -Number((((hash >>> 4) % 32) / 10).toFixed(1));
  const blinkDelaySeconds = -Number((((hash >>> 9) % 40) / 10).toFixed(1));

  return {
    normalizedSeed,
    hash,
    palette,
    lobes,
    blobPath,
    accessoryType,
    breatheDelaySeconds,
    blinkDelaySeconds,
  };
}

export interface BlobatarProfileInput {
  display_name: string;
  handle: string;
  blobatar_frame: BlobatarFrame;
}

export interface BlobatarProfileRecord extends BlobatarProfileInput {
  id: string;
  blobatar_seed: string;
  privacy_mode: boolean;
}

export type BlobatarProfileField = keyof BlobatarProfileInput;

export type BlobatarValidationResult =
  | { ok: true; data: BlobatarProfileInput }
  | {
      ok: false;
      error: string;
      fieldErrors: Partial<Record<BlobatarProfileField, string>>;
    };

const HANDLE_BODY_REGEX = /^[a-zA-Z0-9._-]+$/;

/**
 * Validasi ketat input profil yang dapat diubah user (nama tampilan, handle, dan bingkai avatar).
 * Seed Blobatar selalu diturunkan otomatis dari profil Clerk di server.
 */
export function validateBlobatarProfileInput(raw: unknown): BlobatarValidationResult {
  if (!raw || typeof raw !== "object") {
    return {
      ok: false,
      error: "Data profil Blobatar tidak valid.",
      fieldErrors: {},
    };
  }

  const candidate = raw as Record<string, unknown>;
  const fieldErrors: Partial<Record<BlobatarProfileField, string>> = {};

  const displayName =
    typeof candidate.display_name === "string"
      ? candidate.display_name.trim().replace(/\s+/g, " ")
      : "";

  if (!displayName) {
    fieldErrors.display_name = "Nama tampilan wajib diisi.";
  } else if (displayName.length > PROFILE_LIMITS.displayNameMax) {
    fieldErrors.display_name = `Nama tampilan maksimal ${PROFILE_LIMITS.displayNameMax} karakter.`;
  }

  const rawHandle = typeof candidate.handle === "string" ? candidate.handle.trim() : "";
  const strippedHandle = rawHandle.replace(/^@+/, "");
  const formattedHandle = strippedHandle ? `@${strippedHandle}` : "";

  if (!strippedHandle) {
    fieldErrors.handle = "Handle wajib diisi (contoh: @nielpoko).";
  } else if (formattedHandle.length > PROFILE_LIMITS.handleMax) {
    fieldErrors.handle = `Handle maksimal ${PROFILE_LIMITS.handleMax} karakter termasuk @.`;
  } else if (!HANDLE_BODY_REGEX.test(strippedHandle)) {
    fieldErrors.handle = "Handle hanya boleh huruf, angka, titik, garis bawah, atau strip.";
  }

  const frame = candidate.blobatar_frame;
  if (!isBlobatarFrame(frame)) {
    fieldErrors.blobatar_frame = "Pilih salah satu dari 3 bingkai Blobatar yang tersedia.";
  }

  const firstError = Object.values(fieldErrors)[0];
  if (firstError) {
    return {
      ok: false,
      error: firstError,
      fieldErrors,
    };
  }

  return {
    ok: true,
    data: {
      display_name: displayName,
      handle: formattedHandle,
      blobatar_frame: frame as BlobatarFrame,
    },
  };
}
