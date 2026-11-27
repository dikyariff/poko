import { cn } from "@/lib/utils";

interface MiniBlobPalette {
  body: string;
  cheek: string;
}

const MINI_BLOB_PALETTES: readonly MiniBlobPalette[] = [
  { body: "#C8FF3D", cheek: "#FF6B8B" },
  { body: "#FFE14D", cheek: "#FF6B8B" },
  { body: "#5CE1FF", cheek: "#FF6B8B" },
  { body: "#D6B8FF", cheek: "#FFE14D" },
  { body: "#FFB87A", cheek: "#FF6B8B" },
  { body: "#FF6B8B", cheek: "#FFE14D" },
];

function seedToIndex(seed: string, modulo: number): number {
  let hash = 2166136261 >>> 0;
  const normalized = (seed || "poko").trim().toLowerCase();
  for (let i = 0; i < normalized.length; i += 1) {
    hash ^= normalized.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) % modulo;
}

export interface MiniBlobatarProps {
  seed?: string;
  className?: string;
}

/**
 * Preview ringkas Blobatar untuk App Shell (Phase 2 Task 6).
 * Generator SVG penuh & penyimpanan kustomisasi ke Supabase akan hadir di Task 7.
 */
export function MiniBlobatar({ seed = "nielpoko", className }: MiniBlobatarProps) {
  const palette = MINI_BLOB_PALETTES[seedToIndex(seed, MINI_BLOB_PALETTES.length)];
  const accessory = seedToIndex(`${seed}:acc`, 3);

  return (
    <svg
      viewBox="0 0 100 100"
      className={cn("size-10 shrink-0 overflow-visible", className)}
      aria-hidden="true"
    >
      {/* Organic Neo-Brutalist blob body */}
      <path
        d="M50 18 C67 17, 83 28, 84 48 C85 69, 73 85, 50 85 C27 85, 15 70, 16 49 C17 29, 32 19, 50 18 Z"
        fill={palette.body}
        stroke="#111111"
        strokeWidth="4.5"
        strokeLinejoin="round"
      />

      {/* Specular highlight */}
      <ellipse
        cx="35"
        cy="34"
        rx="7"
        ry="4"
        transform="rotate(-24 35 34)"
        fill="#FFFFFF"
        opacity="0.6"
      />

      {/* Simple deterministic accent on top */}
      {accessory === 0 ? (
        <>
          <path
            d="M50 20 Q50 10 58 8 Q56 17 50 19"
            fill="#C8FF3D"
            stroke="#111111"
            strokeWidth="3.2"
            strokeLinejoin="round"
          />
          <path
            d="M50 20 Q48 11 40 11 Q43 18 50 19"
            fill="#7CFFB2"
            stroke="#111111"
            strokeWidth="3.2"
            strokeLinejoin="round"
          />
        </>
      ) : accessory === 1 ? (
        <path
          d="M36 22 L40 10 L50 16 L60 10 L64 22 Z"
          fill="#FFE14D"
          stroke="#111111"
          strokeWidth="3.2"
          strokeLinejoin="round"
        />
      ) : (
        <path
          d="M70 18 L73 24 L80 25 L75 29 L76 36 L70 33 L64 36 L65 29 L60 25 L67 24 Z"
          fill="#FFE14D"
          stroke="#111111"
          strokeWidth="2.8"
          strokeLinejoin="round"
        />
      )}

      {/* Cheeks */}
      <circle cx="29" cy="59" r="5" fill={palette.cheek} opacity="0.72" />
      <circle cx="71" cy="59" r="5" fill={palette.cheek} opacity="0.72" />

      {/* Happy eyes + smile */}
      <circle cx="38" cy="50" r="4.3" fill="#111111" />
      <circle cx="36.5" cy="48.5" r="1.4" fill="#FFFFFF" />
      <circle cx="62" cy="50" r="4.3" fill="#111111" />
      <circle cx="60.5" cy="48.5" r="1.4" fill="#FFFFFF" />
      <path
        d="M42 61 Q50 69 58 61"
        fill="none"
        stroke="#111111"
        strokeWidth="3.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
