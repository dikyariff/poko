import { cn, formatIDR } from "@/lib/utils";

const ledgerSamples = [
  {
    label: "Gaji & Proyek Sampingan",
    tag: "Pemasukan",
    amount: 8500000,
    sign: "+",
    tone: "text-income",
    badgeBg: "bg-lime",
  },
  {
    label: "Kopi, Transport & Makan",
    tag: "Pengeluaran",
    amount: 1245500,
    sign: "-",
    tone: "text-expense",
    badgeBg: "bg-coral/40",
  },
  {
    label: "Kantong Impian: Laptop Baru",
    tag: "Tabungan",
    amount: 15000000,
    sign: "",
    tone: "text-transfer",
    badgeBg: "bg-cyan/50",
  },
];

const paletteTokens = [
  { name: "Canvas", hex: "#FFFDF5", swatchClass: "bg-canvas" },
  { name: "Ink", hex: "#111111", swatchClass: "bg-ink" },
  { name: "Lime", hex: "#C8FF3D", swatchClass: "bg-lime" },
  { name: "Yellow", hex: "#FFE14D", swatchClass: "bg-yellow" },
  { name: "Coral", hex: "#FF6B8B", swatchClass: "bg-coral" },
  { name: "Cyan", hex: "#5CE1FF", swatchClass: "bg-cyan" },
  { name: "Lavender", hex: "#D6B8FF", swatchClass: "bg-lavender" },
];

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center gap-8 px-5 py-12 sm:px-8">
      <header className="border-ink bg-card shadow-brutal-lg rounded-3xl border-[2.5px] p-6 sm:p-8">
        <div className="mb-4 flex flex-wrap items-center gap-2.5">
          <span className="border-ink bg-lime shadow-brutal-sm inline-flex items-center rounded-full border-2 px-3 py-1 font-mono text-xs font-bold tracking-wide uppercase">
            Phase 1 · Foundation
          </span>
          <span className="border-ink bg-subtle inline-flex items-center rounded-full border-2 px-3 py-1 font-mono text-xs font-semibold">
            Next.js App Router + TypeScript + Tailwind CSS
          </span>
        </div>

        <h1 className="font-display text-ink text-3xl leading-tight font-bold tracking-tight sm:text-5xl">
          Poko — Kantong rapi, impian pasti
        </h1>
        <p className="text-ink-muted mt-3 max-w-2xl text-base leading-relaxed sm:text-lg">
          Fondasi Warm-Paper Neo-Brutalism telah siap. Halaman smoke-test ini memverifikasi tiga
          tipografi utama Poko serta penyelarasan angka tabular Rupiah sebelum fitur inti dibangun.
        </p>
      </header>

      <section className="grid gap-5 md:grid-cols-2" aria-label="Pratinjau Tipografi Poko">
        <article className="border-ink bg-card shadow-brutal-md rounded-2xl border-[2.5px] p-6">
          <div className="mb-3 flex items-center justify-between gap-2">
            <span className="border-ink bg-yellow rounded-lg border-2 px-2.5 py-0.5 font-mono text-xs font-bold">
              --font-space-grotesk
            </span>
            <span className="text-ink-soft font-mono text-xs">Display / Headings</span>
          </div>
          <h2 className="font-display text-2xl font-bold tracking-tight">
            Atur Dompet Tanpa Ribet
          </h2>
          <p className="font-display text-ink-muted mt-2 text-lg font-medium">
            Aa Bb Cc Dd 0123456789 — Bold &amp; Geometris
          </p>
        </article>

        <article className="border-ink bg-card shadow-brutal-md rounded-2xl border-[2.5px] p-6">
          <div className="mb-3 flex items-center justify-between gap-2">
            <span className="border-ink bg-lavender rounded-lg border-2 px-2.5 py-0.5 font-mono text-xs font-bold">
              --font-plus-jakarta-sans
            </span>
            <span className="text-ink-soft font-mono text-xs">Body / UI Copy</span>
          </div>
          <p className="text-base leading-relaxed font-semibold">
            Antarmuka bersih, ramah dibaca, dan tetap tajam di layar desktop maupun ponsel.
          </p>
          <p className="text-ink-muted mt-2 text-sm leading-relaxed">
            Cocok untuk label transaksi, catatan harian, dan panduan target tabungan sehari-hari.
          </p>
        </article>
      </section>

      <section
        className="border-ink bg-card shadow-brutal-md rounded-2xl border-[2.5px] p-6"
        aria-label="Pratinjau Angka Tabular IDR"
      >
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-display text-xl font-bold">Angka Tabular IDR (JetBrains Mono)</h2>
            <p className="text-ink-muted text-sm">
              Menggunakan <code className="font-mono font-semibold">font-mono tabular-nums</code>{" "}
              agar kolom nominal sejajar presisi.
            </p>
          </div>
          <span className="border-ink bg-cyan rounded-lg border-2 px-2.5 py-0.5 font-mono text-xs font-bold">
            --font-jetbrains-mono
          </span>
        </div>

        <ul className="divide-ink/15 border-ink bg-subtle divide-y-2 rounded-xl border-2">
          {ledgerSamples.map((item) => (
            <li
              key={item.label}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5"
            >
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "border-ink rounded-md border-[1.5px] px-2 py-0.5 text-xs font-bold",
                    item.badgeBg
                  )}
                >
                  {item.tag}
                </span>
                <span className="text-sm font-semibold sm:text-base">{item.label}</span>
              </div>
              <span
                className={cn(
                  "font-mono text-base font-bold tracking-tight tabular-nums sm:text-lg",
                  item.tone
                )}
              >
                {item.sign}
                {formatIDR(item.amount)}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <footer className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {paletteTokens.map((token) => (
            <div
              key={token.name}
              className="border-ink bg-card shadow-brutal-sm flex items-center gap-2 rounded-full border-2 px-2.5 py-1 text-xs font-semibold"
            >
              <span
                className={cn(
                  "border-ink inline-block h-3.5 w-3.5 rounded-full border",
                  token.swatchClass
                )}
                aria-hidden="true"
              />
              <span>{token.name}</span>
              <span className="text-ink-soft font-mono">{token.hex}</span>
            </div>
          ))}
        </div>
        <p className="text-ink-soft font-mono text-xs">Poko Planner · Warm-Paper Neo-Brutalism</p>
      </footer>
    </main>
  );
}
