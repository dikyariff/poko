import { cn } from "@/lib/utils";

type BlobExpression = "happy" | "chill" | "hyped" | "thinking" | "love" | "broke";

interface BlobPaletteItem {
  body: string;
  cheek: string;
}

const BLOB_PALETTE: readonly BlobPaletteItem[] = [
  { body: "#C8FF3D", cheek: "#FF6B8B" },
  { body: "#FFE14D", cheek: "#FF6B8B" },
  { body: "#FF6B8B", cheek: "#FFE14D" },
  { body: "#5CE1FF", cheek: "#FF6B8B" },
  { body: "#D6B8FF", cheek: "#FFE14D" },
  { body: "#FFB87A", cheek: "#FF6B8B" },
  { body: "#7CFFB2", cheek: "#FF6B8B" },
];

function hashSeed(str: string): number {
  let h = 2166136261 >>> 0;
  const clean = (str || "poko").toLowerCase().trim();
  for (let i = 0; i < clean.length; i++) {
    h ^= clean.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(initialSeed: number) {
  let a = initialSeed;
  return function next() {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildOrganicBlobPath(
  rng: () => number,
  cx: number,
  cy: number,
  baseR: number,
  pointsCount: number
): string {
  const pts: Array<{ x: number; y: number }> = [];
  const squashX = 0.92 + rng() * 0.16;
  const squashY = 0.9 + rng() * 0.16;
  for (let i = 0; i < pointsCount; i++) {
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
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    if (i === 0) d += `M ${p1.x.toFixed(1)} ${p1.y.toFixed(1)} `;
    d += `C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)} `;
  }
  return `${d}Z`;
}

function BlobatarSvg({
  seed,
  expression,
  paletteIndex,
}: {
  seed: string;
  expression: BlobExpression;
  paletteIndex?: number;
}) {
  const rng = mulberry32(hashSeed(seed));
  const palette =
    BLOB_PALETTE[
      paletteIndex !== undefined
        ? paletteIndex % BLOB_PALETTE.length
        : Math.floor(rng() * BLOB_PALETTE.length)
    ];
  const lobes = 7 + Math.floor(rng() * 3);
  const blobPath = buildOrganicBlobPath(rng, 50, 54, 34, lobes);
  const accessoryType = Math.floor(rng() * 5);

  const accessoryNode = (() => {
    if (accessoryType === 0) {
      return (
        <>
          <path
            d="M50 22 Q50 11 58 9 Q56 18 50 20"
            fill="#C8FF3D"
            stroke="#111111"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path
            d="M50 22 Q48 12 40 12 Q43 19 50 20"
            fill="#7CFFB2"
            stroke="#111111"
            strokeWidth="3"
            strokeLinejoin="round"
          />
        </>
      );
    }
    if (accessoryType === 1) {
      return (
        <path
          d="M36 23 L40 11 L50 17 L60 11 L64 23 Z"
          fill="#FFE14D"
          stroke="#111111"
          strokeWidth="3"
          strokeLinejoin="round"
        />
      );
    }
    if (accessoryType === 2) {
      return (
        <path
          d="M68 20 L71 26 L78 27 L73 31 L74 38 L68 35 L62 38 L63 31 L58 27 L65 26 Z"
          fill="#FFE14D"
          stroke="#111111"
          strokeWidth="2.6"
          strokeLinejoin="round"
        />
      );
    }
    if (accessoryType === 3) {
      return (
        <>
          <circle cx="28" cy="28" r="8" fill={palette.body} stroke="#111111" strokeWidth="3.5" />
          <circle cx="72" cy="28" r="8" fill={palette.body} stroke="#111111" strokeWidth="3.5" />
        </>
      );
    }
    return (
      <>
        <path
          d="M27 36 Q50 26 73 36"
          fill="none"
          stroke="#111111"
          strokeWidth="4.5"
          strokeLinecap="round"
        />
        <circle cx="50" cy="30" r="4.5" fill="#FFE14D" stroke="#111111" strokeWidth="2.5" />
      </>
    );
  })();

  const faceNode = (() => {
    if (expression === "happy") {
      return (
        <>
          <circle cx="38" cy="50" r="4.2" fill="#111111" />
          <circle cx="36.5" cy="48.5" r="1.4" fill="#FFFFFF" />
          <circle cx="62" cy="50" r="4.2" fill="#111111" />
          <circle cx="60.5" cy="48.5" r="1.4" fill="#FFFFFF" />
          <path
            d="M42 61 Q50 69 58 61"
            fill="none"
            stroke="#111111"
            strokeWidth="3.4"
            strokeLinecap="round"
          />
        </>
      );
    }
    if (expression === "chill") {
      return (
        <>
          <path
            d="M33 50 Q38 46 43 50"
            fill="none"
            stroke="#111111"
            strokeWidth="3.4"
            strokeLinecap="round"
          />
          <path
            d="M57 50 Q62 46 67 50"
            fill="none"
            stroke="#111111"
            strokeWidth="3.4"
            strokeLinecap="round"
          />
          <path
            d="M44 62 Q50 66 56 62"
            fill="none"
            stroke="#111111"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
        </>
      );
    }
    if (expression === "hyped") {
      return (
        <>
          <path d="M38 44 L40 49 L45 50 L40 52 L38 56 L36 52 L31 50 L36 49 Z" fill="#111111" />
          <path d="M62 44 L64 49 L69 50 L64 52 L62 56 L60 52 L55 50 L60 49 Z" fill="#111111" />
          <path
            d="M41 60 Q50 72 59 60 Z"
            fill="#111111"
            stroke="#111111"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M81 26 L83 30 L87 31 L83 33 L81 37 L79 33 L75 31 L79 30 Z"
            fill="#FFE14D"
            stroke="#111111"
            strokeWidth="1.8"
          />
        </>
      );
    }
    if (expression === "thinking") {
      return (
        <>
          <circle cx="38" cy="50" r="4" fill="#111111" />
          <circle cx="62" cy="48" r="4.4" fill="#111111" />
          <path d="M56 41 L67 39" stroke="#111111" strokeWidth="3" strokeLinecap="round" />
          <path
            d="M44 63 Q50 60 57 63"
            fill="none"
            stroke="#111111"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
        </>
      );
    }
    if (expression === "love") {
      return (
        <>
          <path
            d="M38 54 C38 54 31 49 32 45 C33 42 37 43 38 46 C39 43 43 42 44 45 C45 49 38 54 38 54 Z"
            fill="#C51D44"
            stroke="#111111"
            strokeWidth="1.6"
          />
          <path
            d="M62 54 C62 54 55 49 56 45 C57 42 61 43 62 46 C63 43 67 42 68 45 C69 49 62 54 62 54 Z"
            fill="#C51D44"
            stroke="#111111"
            strokeWidth="1.6"
          />
          <path
            d="M43 61 Q50 68 57 61"
            fill="none"
            stroke="#111111"
            strokeWidth="3.4"
            strokeLinecap="round"
          />
        </>
      );
    }
    return (
      <>
        <path
          d="M33 47 L42 52 M42 47 L33 52"
          stroke="#111111"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <path
          d="M58 47 L67 52 M67 47 L58 52"
          stroke="#111111"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <path
          d="M43 64 Q46.5 60 50 64 Q53.5 68 57 64"
          fill="none"
          stroke="#111111"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <path
          d="M74 36 Q79 44 74 47 Q69 44 74 36 Z"
          fill="#5CE1FF"
          stroke="#111111"
          strokeWidth="2.2"
        />
      </>
    );
  })();

  return (
    <svg viewBox="0 0 100 100" className="h-full w-full overflow-visible" aria-hidden="true">
      {accessoryType === 3 ? accessoryNode : null}
      <path
        d={blobPath}
        fill={palette.body}
        stroke="#111111"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <ellipse
        cx="35"
        cy="34"
        rx="7"
        ry="4"
        transform="rotate(-24 35 34)"
        fill="#FFFFFF"
        opacity="0.55"
      />
      {accessoryType !== 3 ? accessoryNode : null}
      <circle cx="29" cy="58" r="5" fill={palette.cheek} opacity="0.72" />
      <circle cx="71" cy="58" r="5" fill={palette.cheek} opacity="0.72" />
      {faceNode}
    </svg>
  );
}

interface ScatteredBlobItem {
  id: string;
  seed: string;
  expression: BlobExpression;
  paletteIndex: number;
  className: string;
  rotate: number;
  floatDelay: string;
}

const SCATTERED_BLOBATARS: readonly ScatteredBlobItem[] = [
  // Top row
  {
    id: "tl-far",
    seed: "poko-lime-01",
    expression: "happy",
    paletteIndex: 0,
    className: "top-[-2%] left-[-2%] size-36 sm:size-44 blur-[4px] opacity-55",
    rotate: -14,
    floatDelay: "0s",
  },
  {
    id: "tc-left",
    seed: "poko-yellow-02",
    expression: "hyped",
    paletteIndex: 1,
    className: "top-[6%] left-[16%] hidden size-28 md:block blur-[3.5px] opacity-55",
    rotate: 11,
    floatDelay: "-1.2s",
  },
  {
    id: "tc-right",
    seed: "poko-cyan-03",
    expression: "chill",
    paletteIndex: 3,
    className: "top-[4%] right-[17%] hidden size-28 md:block blur-[4px] opacity-55",
    rotate: -9,
    floatDelay: "-2.4s",
  },
  {
    id: "tr-far",
    seed: "poko-coral-04",
    expression: "love",
    paletteIndex: 2,
    className: "top-[-1%] right-[-3%] size-36 sm:size-44 blur-[4px] opacity-55",
    rotate: 16,
    floatDelay: "-0.7s",
  },

  // Upper-mid flanks
  {
    id: "ml-upper",
    seed: "poko-lavender-05",
    expression: "thinking",
    paletteIndex: 4,
    className: "top-[29%] left-[4%] size-28 sm:size-36 blur-[3px] opacity-60",
    rotate: 8,
    floatDelay: "-1.9s",
  },
  {
    id: "ml-inner",
    seed: "poko-mint-06",
    expression: "happy",
    paletteIndex: 6,
    className: "top-[44%] left-[20%] hidden size-24 lg:block blur-[5px] opacity-45",
    rotate: -12,
    floatDelay: "-3.1s",
  },
  {
    id: "mr-upper",
    seed: "poko-peach-07",
    expression: "happy",
    paletteIndex: 5,
    className: "top-[27%] right-[4%] size-28 sm:size-36 blur-[3px] opacity-60",
    rotate: -11,
    floatDelay: "-0.4s",
  },
  {
    id: "mr-inner",
    seed: "poko-yellow-08",
    expression: "chill",
    paletteIndex: 1,
    className: "top-[47%] right-[19%] hidden size-24 lg:block blur-[5px] opacity-45",
    rotate: 14,
    floatDelay: "-2.7s",
  },

  // Lower-mid flanks
  {
    id: "ml-lower",
    seed: "poko-cyan-09",
    expression: "hyped",
    paletteIndex: 3,
    className: "bottom-[22%] left-[9%] hidden size-32 sm:block blur-[3.5px] opacity-55",
    rotate: -16,
    floatDelay: "-1.5s",
  },
  {
    id: "mr-lower",
    seed: "poko-lavender-10",
    expression: "love",
    paletteIndex: 4,
    className: "bottom-[20%] right-[8%] hidden size-32 sm:block blur-[3.5px] opacity-55",
    rotate: 13,
    floatDelay: "-2.1s",
  },

  // Bottom row
  {
    id: "bl-far",
    seed: "poko-peach-11",
    expression: "chill",
    paletteIndex: 5,
    className: "bottom-[-3%] left-[-2%] size-36 sm:size-44 blur-[4.5px] opacity-55",
    rotate: 15,
    floatDelay: "-0.9s",
  },
  {
    id: "bc-left",
    seed: "poko-coral-12",
    expression: "broke",
    paletteIndex: 2,
    className: "bottom-[4%] left-[23%] hidden size-24 md:block blur-[4px] opacity-50",
    rotate: -7,
    floatDelay: "-3.5s",
  },
  {
    id: "bc-right",
    seed: "poko-lime-13",
    expression: "happy",
    paletteIndex: 0,
    className: "bottom-[3%] right-[22%] hidden size-28 md:block blur-[4px] opacity-55",
    rotate: 10,
    floatDelay: "-1.7s",
  },
  {
    id: "br-far",
    seed: "poko-mint-14",
    expression: "thinking",
    paletteIndex: 6,
    className: "bottom-[-3%] right-[-2%] size-36 sm:size-44 blur-[4.5px] opacity-55",
    rotate: -13,
    floatDelay: "-2.9s",
  },
];

/**
 * Latar belakang dekoratif berisi Blobatar Poko yang tersebar acak (deterministik)
 * dengan efek blur lembut agar tetap hangat & berkarakter tanpa mengganggu fokus form auth.
 */
export function BlobatarBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none"
    >
      {SCATTERED_BLOBATARS.map((item) => (
        <div
          key={item.id}
          className={cn("poko-blob-float absolute will-change-transform", item.className)}
          style={{ animationDelay: item.floatDelay }}
        >
          <div className="h-full w-full" style={{ transform: `rotate(${item.rotate}deg)` }}>
            <BlobatarSvg
              seed={item.seed}
              expression={item.expression}
              paletteIndex={item.paletteIndex}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
