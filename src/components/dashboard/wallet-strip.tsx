"use client";

import * as React from "react";
import {
  Banknote,
  Check,
  ChevronLeft,
  ChevronRight,
  Landmark,
  Layers,
  Loader2,
  PiggyBank,
  Plus,
  Smartphone,
  Sparkles,
  Wallet as WalletIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { createWallet } from "@/actions/wallets";
import { PrivateAmount } from "@/components/providers/privacy-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NominalInput } from "@/components/ui/nominal-input";
import {
  ResponsiveModal,
  ResponsiveModalClose,
  ResponsiveModalContent,
  ResponsiveModalDescription,
  ResponsiveModalFooter,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalTrigger,
} from "@/components/ui/responsive-modal";
import { cn, parseNominalInput } from "@/lib/utils";
import { createWalletSchema, POKO_WALLET_TYPES, type WalletType } from "@/lib/validations/finance";
import type { Wallet } from "@/types/database";

export interface WalletStripProps {
  wallets: Wallet[];
  dataSource?: "supabase" | "fallback";
}

const WALLET_COLOR_SWATCHES = [
  { hex: "#5CE1FF", label: "Cyan" },
  { hex: "#C8FF3D", label: "Lime" },
  { hex: "#FFE14D", label: "Kuning" },
  { hex: "#7CFFB2", label: "Mint" },
  { hex: "#D6B8FF", label: "Lavender" },
  { hex: "#FFB87A", label: "Peach" },
  { hex: "#FF6B8B", label: "Coral" },
] as const;

const WALLET_TYPE_META: Record<
  WalletType,
  {
    label: string;
    Icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  }
> = {
  bank: { label: "Bank", Icon: Landmark },
  ewallet: { label: "E-Wallet", Icon: Smartphone },
  cash: { label: "Tunai", Icon: Banknote },
  savings: { label: "Tabungan", Icon: PiggyBank },
};

const MAX_VISIBLE_DECK_CARDS = 4;
const SWIPE_THRESHOLD_PX = 48;

function resolveWalletType(rawType: string): WalletType {
  if (rawType === "bank" || rawType === "ewallet" || rawType === "cash" || rawType === "savings") {
    return rawType;
  }
  return "cash";
}

function getSafeAccentColor(color: string | null | undefined, walletType: WalletType): string {
  if (color && /^#[0-9A-Fa-f]{6}$/.test(color.trim())) {
    return color.trim();
  }
  return POKO_WALLET_TYPES.find((item) => item.value === walletType)?.defaultColor ?? "#FFE14D";
}

interface AddWalletFormProps {
  nextSortOrder: number;
  onCreated: (wallet: Wallet) => void;
  onClose: () => void;
}

function AddWalletForm({ nextSortOrder, onCreated, onClose }: AddWalletFormProps) {
  const router = useRouter();
  const [name, setName] = React.useState("");
  const [walletType, setWalletType] = React.useState<WalletType>("ewallet");
  const [balanceInput, setBalanceInput] = React.useState("0");
  const [color, setColor] = React.useState<string>("#C8FF3D");
  const [hasCustomColor, setHasCustomColor] = React.useState(false);
  const [isPrimarySavings, setIsPrimarySavings] = React.useState(false);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});
  const [formError, setFormError] = React.useState<string | null>(null);
  const [isPending, setIsPending] = React.useState(false);

  function clearError(field: string) {
    setFormError(null);
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  function handleSelectType(nextType: WalletType) {
    setWalletType(nextType);
    clearError("wallet_type");
    clearError("is_primary_savings");

    if (nextType !== "savings") {
      setIsPrimarySavings(false);
    }

    if (!hasCustomColor) {
      const preset = POKO_WALLET_TYPES.find((item) => item.value === nextType);
      if (preset) {
        setColor(preset.defaultColor);
      }
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isPending) return;

    const parsedBalance = parseNominalInput(balanceInput) ?? 0;
    const selectedTypeMeta =
      POKO_WALLET_TYPES.find((item) => item.value === walletType) ?? POKO_WALLET_TYPES[0];

    const payload = {
      name: name.trim(),
      wallet_type: walletType,
      balance: Number.isNaN(parsedBalance) ? -1 : parsedBalance,
      color,
      icon: selectedTypeMeta.icon,
      is_primary_savings: walletType === "savings" ? isPrimarySavings : false,
      sort_order: nextSortOrder,
    };

    const clientCheck = createWalletSchema.safeParse(payload);
    if (!clientCheck.success) {
      const nextErrors: Record<string, string> = {};
      for (const issue of clientCheck.error.issues) {
        const key = String(issue.path[0] ?? "form");
        if (!nextErrors[key]) {
          nextErrors[key] = issue.message;
        }
      }
      setFieldErrors(nextErrors);
      setFormError(clientCheck.error.issues[0]?.message ?? "Periksa kembali data dompet baru.");
      return;
    }

    setFieldErrors({});
    setFormError(null);
    setIsPending(true);

    try {
      const result = await createWallet(clientCheck.data);

      if (!result.ok) {
        if (result.fieldErrors) {
          const mapped: Record<string, string> = {};
          for (const [key, messages] of Object.entries(result.fieldErrors)) {
            if (messages?.[0]) {
              mapped[key] = messages[0];
            }
          }
          setFieldErrors(mapped);
        }
        setFormError(result.error);
        toast.error("Gagal menambah dompet", {
          id: "poko-wallet-error",
          description: result.error,
        });
        return;
      }

      onCreated(result.data);
      toast.success(`Dompet "${result.data.name}" ditambahkan!`, {
        id: "poko-wallet-created",
        description: result.data.is_primary_savings
          ? "Disetel sebagai Tabungan Utama & tersinkron ke Impian."
          : "Saldo dompet langsung terhubung ke Total Saldo Bersih.",
      });
      onClose();
      router.refresh();
    } catch {
      const fallbackError = "Terjadi kendala koneksi saat menyimpan dompet baru.";
      setFormError(fallbackError);
      toast.error("Gagal menambah dompet", {
        id: "poko-wallet-error",
        description: fallbackError,
      });
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      {/* Nama Dompet */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="new-wallet-name"
          className="text-ink flex items-center justify-between text-xs font-extrabold uppercase"
        >
          <span>Nama Dompet</span>
          <span className="text-ink-soft font-mono text-[10px] font-bold">
            {name.trim().length}/60
          </span>
        </label>
        <Input
          id="new-wallet-name"
          name="name"
          type="text"
          maxLength={60}
          autoComplete="off"
          placeholder="cth: OVO, Bank Jago, Dana Darurat"
          value={name}
          aria-invalid={Boolean(fieldErrors.name)}
          onChange={(event) => {
            setName(event.target.value);
            clearError("name");
          }}
        />
        {fieldErrors.name ? (
          <p className="text-expense text-xs font-bold">{fieldErrors.name}</p>
        ) : null}
      </div>

      {/* Tipe Dompet */}
      <fieldset className="space-y-1.5">
        <legend className="text-ink text-xs font-extrabold uppercase">Tipe Dompet</legend>
        <div className="grid grid-cols-2 gap-2">
          {POKO_WALLET_TYPES.map((option) => {
            const selected = walletType === option.value;
            const TypeIcon = WALLET_TYPE_META[option.value].Icon;
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={selected}
                onClick={() => handleSelectType(option.value)}
                className={cn(
                  "border-ink flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border-2 px-3 py-2 text-left text-xs font-extrabold transition-[transform,box-shadow,background-color] duration-150",
                  selected
                    ? "bg-lime text-ink shadow-brutal-sm -translate-x-0.5 -translate-y-0.5"
                    : "bg-card text-ink hover:bg-subtle"
                )}
              >
                <TypeIcon className="size-4 shrink-0" aria-hidden />
                <span className="truncate">{option.label}</span>
              </button>
            );
          })}
        </div>
        {fieldErrors.wallet_type ? (
          <p className="text-expense text-xs font-bold">{fieldErrors.wallet_type}</p>
        ) : null}
      </fieldset>

      {/* Saldo Awal */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="new-wallet-balance" className="text-ink text-xs font-extrabold uppercase">
          Saldo Awal (Rp)
        </label>
        <NominalInput
          id="new-wallet-balance"
          name="balance"
          showPrefix
          placeholder="0"
          value={balanceInput}
          aria-invalid={Boolean(fieldErrors.balance)}
          onValueChange={(_numeric, formatted) => {
            setBalanceInput(formatted);
            clearError("balance");
          }}
        />
        {fieldErrors.balance ? (
          <p className="text-expense text-xs font-bold">{fieldErrors.balance}</p>
        ) : null}
      </div>

      {/* Warna Aksen Neo-Brutalist */}
      <fieldset className="space-y-1.5">
        <legend className="text-ink text-xs font-extrabold uppercase">Warna Aksen Kartu</legend>
        <div className="flex flex-wrap items-center gap-2">
          {WALLET_COLOR_SWATCHES.map((swatch) => {
            const active = color.toUpperCase() === swatch.hex.toUpperCase();
            return (
              <button
                key={swatch.hex}
                type="button"
                aria-label={`Pilih warna ${swatch.label}`}
                aria-pressed={active}
                onClick={() => {
                  setColor(swatch.hex);
                  setHasCustomColor(true);
                  clearError("color");
                }}
                style={{ backgroundColor: swatch.hex }}
                className={cn(
                  "border-ink flex size-9 cursor-pointer items-center justify-center rounded-xl border-2 transition-transform duration-150",
                  active
                    ? "shadow-brutal-sm ring-ink -translate-y-0.5 scale-105 ring-2 ring-offset-2"
                    : "hover:-translate-y-0.5"
                )}
              >
                {active ? (
                  <Check className="text-ink size-4 stroke-[3]" aria-hidden="true" />
                ) : null}
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* Opsi Tabungan Utama khusus tipe savings */}
      {walletType === "savings" ? (
        <label
          htmlFor="new-wallet-primary-savings"
          className="border-ink bg-subtle flex cursor-pointer items-start gap-3 rounded-xl border-2 p-3"
        >
          <input
            id="new-wallet-primary-savings"
            type="checkbox"
            checked={isPrimarySavings}
            onChange={(event) => {
              setIsPrimarySavings(event.target.checked);
              clearError("is_primary_savings");
            }}
            className="border-ink accent-ink mt-0.5 size-4 shrink-0 cursor-pointer rounded"
          />
          <span className="min-w-0 space-y-0.5 text-xs">
            <span className="text-ink block font-extrabold">Jadikan Tabungan Utama</span>
            <span className="text-ink-muted block leading-snug font-medium">
              Target Impian tanpa dompet khusus akan otomatis tersinkron ke saldo dompet ini.
            </span>
          </span>
        </label>
      ) : null}

      {formError ? (
        <p
          role="alert"
          className="border-ink bg-coral/20 text-expense rounded-xl border-2 px-3 py-2 text-xs font-bold"
        >
          {formError}
        </p>
      ) : null}

      <ResponsiveModalFooter className="pt-1">
        <ResponsiveModalClose asChild>
          <Button variant="outline" size="sm" className="min-h-10">
            Batal
          </Button>
        </ResponsiveModalClose>
        <Button type="submit" disabled={isPending} className="min-h-10 sm:min-w-[164px]">
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              <span>Menyimpan...</span>
            </>
          ) : (
            <>
              <Plus className="size-4 stroke-[2.75]" aria-hidden="true" />
              <span>Simpan Dompet</span>
            </>
          )}
        </Button>
      </ResponsiveModalFooter>
    </form>
  );
}

interface DeckTransitionState {
  /** ID kartu yang sedang ditarik keluar ke atas sebelum dipindah ke posisi depan/belakang. */
  liftingId: string;
  direction: "pull-up" | "send-back";
}

export function WalletStrip({ wallets, dataSource = "supabase" }: WalletStripProps) {
  const [modalOpen, setModalOpen] = React.useState(false);
  const [createdWallets, setCreatedWallets] = React.useState<Wallet[]>([]);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [deckTransition, setDeckTransition] = React.useState<DeckTransitionState | null>(null);
  const [dragOffset, setDragOffset] = React.useState<{ x: number; y: number } | null>(null);

  const transitionTimerRef = React.useRef<number | null>(null);
  const pointerStartRef = React.useRef<{ x: number; y: number; pointerId: number } | null>(null);
  const didSwipeRef = React.useRef(false);

  const displayedWallets = React.useMemo(() => {
    const existingIds = new Set(wallets.map((item) => item.id));
    const pendingCreated = createdWallets.filter((item) => !existingIds.has(item.id));
    if (pendingCreated.length === 0) {
      return wallets;
    }

    const hasNewPrimary = pendingCreated.some((item) => item.is_primary_savings);
    const base = hasNewPrimary
      ? wallets.map((item) => ({ ...item, is_primary_savings: false }))
      : wallets;

    return [...base, ...pendingCreated];
  }, [wallets, createdWallets]);

  const totalWallets = displayedWallets.length;
  const safeActiveIndex = totalWallets > 0 ? activeIndex % totalWallets : 0;

  React.useEffect(() => {
    return () => {
      if (transitionTimerRef.current !== null) {
        window.clearTimeout(transitionTimerRef.current);
      }
    };
  }, []);

  const nextSortOrder = React.useMemo(() => {
    if (displayedWallets.length === 0) return 1;
    return Math.max(...displayedWallets.map((item) => item.sort_order ?? 0)) + 1;
  }, [displayedWallets]);

  function commitDeckChange(
    targetIndex: number,
    liftingId: string,
    direction: "pull-up" | "send-back"
  ) {
    if (totalWallets <= 1) return;
    const normalizedTarget = ((targetIndex % totalWallets) + totalWallets) % totalWallets;
    if (normalizedTarget === safeActiveIndex) return;

    if (transitionTimerRef.current !== null) {
      window.clearTimeout(transitionTimerRef.current);
    }

    setDeckTransition({ liftingId, direction });

    transitionTimerRef.current = window.setTimeout(() => {
      setActiveIndex(normalizedTarget);
      setDeckTransition(null);
      transitionTimerRef.current = null;
    }, 175);
  }

  function handleNextCard() {
    if (totalWallets <= 1 || deckTransition) return;
    const nextIdx = (safeActiveIndex + 1) % totalWallets;
    const nextWallet = displayedWallets[nextIdx];
    if (!nextWallet) return;
    commitDeckChange(nextIdx, nextWallet.id, "pull-up");
  }

  function handlePrevCard() {
    if (totalWallets <= 1 || deckTransition) return;
    const prevIdx = (safeActiveIndex - 1 + totalWallets) % totalWallets;
    const currentWallet = displayedWallets[safeActiveIndex];
    if (!currentWallet) return;
    commitDeckChange(prevIdx, currentWallet.id, "send-back");
  }

  function handleSelectWallet(targetIndex: number) {
    if (totalWallets <= 1 || deckTransition || targetIndex === safeActiveIndex) return;
    const targetWallet = displayedWallets[targetIndex];
    if (!targetWallet) return;
    commitDeckChange(targetIndex, targetWallet.id, "pull-up");
  }

  function handleWalletCreated(created: Wallet) {
    setCreatedWallets((prev) => {
      const updated = created.is_primary_savings
        ? prev.map((item) => ({ ...item, is_primary_savings: false }))
        : prev;
      return [...updated, created];
    });
    // Langsung bawa kartu dompet yang baru dibuat ke depan tumpukan
    setActiveIndex(displayedWallets.length);
  }

  // Gesture tarik/geser pada kartu paling depan
  function handleFrontPointerDown(event: React.PointerEvent<HTMLElement>) {
    if (totalWallets <= 1 || deckTransition) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    pointerStartRef.current = {
      x: event.clientX,
      y: event.clientY,
      pointerId: event.pointerId,
    };
    didSwipeRef.current = false;
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handleFrontPointerMove(event: React.PointerEvent<HTMLElement>) {
    const start = pointerStartRef.current;
    if (!start || start.pointerId !== event.pointerId) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) > 6 || Math.abs(dy) > 6) {
      didSwipeRef.current = true;
    }
    setDragOffset({
      x: Math.max(-96, Math.min(96, dx)),
      y: Math.max(-44, Math.min(28, dy * 0.55)),
    });
  }

  function handleFrontPointerEnd(event: React.PointerEvent<HTMLElement>) {
    const start = pointerStartRef.current;
    if (!start || start.pointerId !== event.pointerId) return;

    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;

    pointerStartRef.current = null;
    setDragOffset(null);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    if (dx <= -SWIPE_THRESHOLD_PX || dy <= -SWIPE_THRESHOLD_PX) {
      handleNextCard();
    } else if (dx >= SWIPE_THRESHOLD_PX) {
      handlePrevCard();
    }
  }

  // Urutan kartu dari depan (depth 0) ke belakang (depth 1..N-1)
  const orderedDeck = React.useMemo(() => {
    if (totalWallets === 0) return [];
    const visibleCount = Math.min(totalWallets, MAX_VISIBLE_DECK_CARDS);
    const items: Array<{ wallet: Wallet; originalIndex: number; depth: number }> = [];

    for (let depth = 0; depth < visibleCount; depth += 1) {
      const originalIndex = (safeActiveIndex + depth) % totalWallets;
      const wallet = displayedWallets[originalIndex];
      if (wallet) {
        items.push({ wallet, originalIndex, depth });
      }
    }

    return items;
  }, [displayedWallets, safeActiveIndex, totalWallets]);

  const stackDepthCount = Math.max(0, orderedDeck.length - 1);
  const topPaddingPx = stackDepthCount * 18;

  return (
    <section
      aria-labelledby="wallet-strip-heading"
      data-slot="wallet-strip"
      className="border-ink bg-card shadow-brutal flex h-full min-w-0 flex-col justify-between gap-4 overflow-hidden rounded-[22px] border-[2.5px] p-5 sm:p-6"
    >
      {/* Header Deck */}
      <div className="flex items-center justify-between gap-2.5">
        <div className="min-w-0 space-y-0.5">
          <div className="flex items-center gap-2">
            <h2
              id="wallet-strip-heading"
              className="font-display text-ink truncate text-lg leading-snug font-bold tracking-tight"
            >
              Dompet &amp; Akun
            </h2>
            {totalWallets > 0 ? (
              <span className="border-ink bg-subtle inline-flex shrink-0 items-center gap-1 rounded-full border-2 px-2 py-0.5 font-mono text-[11px] font-extrabold">
                <Layers className="size-3" aria-hidden="true" />
                {safeActiveIndex + 1}/{totalWallets}
              </span>
            ) : null}
          </div>
          <p className="text-ink-muted truncate text-xs font-semibold">
            {totalWallets > 1
              ? "Klik kartu belakang atau geser untuk pindah dompet"
              : "Tersinkron otomatis ke Total Saldo Bersih"}
          </p>
        </div>

        <ResponsiveModal open={modalOpen} onOpenChange={setModalOpen}>
          <ResponsiveModalTrigger asChild>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              data-testid="btn-add-wallet"
              className="min-h-9 shrink-0 px-3 text-xs font-extrabold"
            >
              <Plus className="size-4 stroke-[2.75]" aria-hidden="true" />
              Tambah
            </Button>
          </ResponsiveModalTrigger>
          <ResponsiveModalContent className="gap-4 sm:max-w-[480px]">
            <ResponsiveModalHeader>
              <ResponsiveModalTitle className="flex items-center gap-2">
                <WalletIcon className="size-5 shrink-0" aria-hidden="true" />
                Tambah Dompet Baru
              </ResponsiveModalTitle>
              <ResponsiveModalDescription>
                Tambahkan rekening bank, e-wallet, uang tunai, atau kantong tabungan baru ke Poko.
              </ResponsiveModalDescription>
            </ResponsiveModalHeader>

            {modalOpen ? (
              <AddWalletForm
                nextSortOrder={nextSortOrder}
                onCreated={handleWalletCreated}
                onClose={() => setModalOpen(false)}
              />
            ) : null}
          </ResponsiveModalContent>
        </ResponsiveModal>
      </div>

      {totalWallets === 0 ? (
        <div className="border-ink bg-subtle flex flex-1 flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-4 py-7 text-center">
          <span className="border-ink bg-yellow shadow-brutal-sm inline-flex size-12 items-center justify-center rounded-2xl border-2">
            <WalletIcon className="text-ink size-6" aria-hidden="true" />
          </span>
          <div className="space-y-1">
            <p className="font-display text-ink text-base font-bold">
              {dataSource === "fallback"
                ? "Dompet belum tersinkron dengan database"
                : "Belum ada dompet aktif"}
            </p>
            <p className="text-ink-muted max-w-xs text-xs leading-relaxed font-medium">
              {dataSource === "fallback"
                ? "Hubungkan Supabase untuk memunculkan dompet bawaan Poko."
                : "Tambahkan dompet pertamamu agar saldo & transaksi terpisah rapi."}
            </p>
          </div>
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={() => setModalOpen(true)}
            className="min-h-10"
          >
            <Plus className="size-4 stroke-[2.75]" aria-hidden="true" />
            Tambah Dompet Pertama
          </Button>
        </div>
      ) : (
        <div className="flex flex-1 flex-col justify-between gap-3.5">
          {/* Interactive Stacked Card Deck Stage */}
          <div
            data-slot="wallet-deck-stage"
            style={{ paddingTop: `${topPaddingPx}px` }}
            className="relative isolate flex min-h-[190px] w-full flex-1 items-end px-1 pb-1"
          >
            <div className="relative h-[168px] w-full sm:h-[176px]">
              {/* Render dari kartu paling belakang ke paling depan */}
              {[...orderedDeck].reverse().map(({ wallet, originalIndex, depth }) => {
                const isFront = depth === 0;
                const typeKey = resolveWalletType(wallet.wallet_type);
                const { label, Icon } = WALLET_TYPE_META[typeKey];
                const accentHex = getSafeAccentColor(wallet.color, typeKey);

                const isLifting = deckTransition?.liftingId === wallet.id;
                const isPullingUp = isLifting && deckTransition?.direction === "pull-up";
                const isSendingBack = isLifting && deckTransition?.direction === "send-back";

                // Hitung transform fisik kartu dalam tumpukan (z-index lokal di dalam isolate)
                const baseY = -depth * 18;
                const baseScale = 1 - depth * 0.045;
                let transformValue = `translate3d(0px, ${baseY}px, 0px) scale(${baseScale})`;
                let zIndexValue = 10 - depth * 2;

                if (isPullingUp) {
                  // Efek menarik kartu dari tumpukan naik ke atas sebelum mendarat ke depan
                  transformValue = `translate3d(0px, ${baseY - 30}px, 0px) scale(0.99) rotate(1.8deg)`;
                  zIndexValue = 15;
                } else if (isSendingBack) {
                  // Efek menggeser kartu depan naik & masuk ke tumpukan belakang
                  transformValue = `translate3d(20px, -28px, 0px) scale(0.95) rotate(3deg)`;
                  zIndexValue = 5;
                } else if (isFront && dragOffset) {
                  const tilt = dragOffset.x * 0.06;
                  transformValue = `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0px) rotate(${tilt.toFixed(2)}deg)`;
                }

                return (
                  <article
                    key={wallet.id}
                    data-slot="wallet-card"
                    data-deck-depth={depth}
                    data-active={isFront ? "true" : "false"}
                    role={totalWallets > 1 ? "button" : undefined}
                    tabIndex={totalWallets > 1 ? 0 : undefined}
                    aria-label={
                      isFront
                        ? `${wallet.name} (${label}), kartu aktif. Klik atau geser untuk ganti dompet`
                        : `Pindahkan kartu ${wallet.name} ke paling depan`
                    }
                    onClick={() => {
                      if (didSwipeRef.current) {
                        didSwipeRef.current = false;
                        return;
                      }
                      if (isFront) {
                        handleNextCard();
                      } else {
                        handleSelectWallet(originalIndex);
                      }
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        if (isFront) {
                          handleNextCard();
                        } else {
                          handleSelectWallet(originalIndex);
                        }
                      } else if (isFront && event.key === "ArrowRight") {
                        event.preventDefault();
                        handleNextCard();
                      } else if (isFront && event.key === "ArrowLeft") {
                        event.preventDefault();
                        handlePrevCard();
                      }
                    }}
                    onPointerDown={isFront ? handleFrontPointerDown : undefined}
                    onPointerMove={isFront ? handleFrontPointerMove : undefined}
                    onPointerUp={isFront ? handleFrontPointerEnd : undefined}
                    onPointerCancel={isFront ? handleFrontPointerEnd : undefined}
                    style={{
                      backgroundColor: accentHex,
                      transform: transformValue,
                      zIndex: zIndexValue,
                    }}
                    className={cn(
                      "border-ink absolute inset-0 flex select-none flex-col justify-between overflow-hidden rounded-[20px] border-[2.5px] p-4 sm:p-5",
                      isFront
                        ? "shadow-brutal touch-pan-y"
                        : "shadow-brutal-sm hover:brightness-[1.03]",
                      totalWallets > 1 && "cursor-pointer",
                      dragOffset && isFront
                        ? "transition-none"
                        : "transition-[transform,box-shadow,filter] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
                    )}
                  >
                    {/* Aksen dekoratif halus khas kartu Neo-Brutalist */}
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute -right-7 -bottom-7 size-28 rounded-full border-2 border-ink/15 bg-white/25"
                    />

                    {/* Baris Atas: Label tipe + Tabungan Utama + Ikon (bagian ini mengintip saat di belakang!) */}
                    <div className="relative z-10 flex items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-1.5">
                        <span className="border-ink bg-card inline-flex shrink-0 items-center rounded-full border-2 px-2 py-0.5 text-[10px] font-extrabold">
                          {label}
                        </span>
                        {!isFront ? (
                          <span className="font-display text-ink truncate text-xs font-bold">
                            {wallet.name}
                          </span>
                        ) : wallet.is_primary_savings ? (
                          <span
                            data-slot="primary-savings-badge"
                            className="border-ink bg-lime text-ink inline-flex shrink-0 items-center gap-1 rounded-full border-2 px-2 py-0.5 text-[10px] font-extrabold"
                          >
                            <Sparkles className="size-2.5 shrink-0" aria-hidden="true" />
                            Tabungan Utama
                          </span>
                        ) : null}
                      </div>

                      <span className="border-ink bg-card flex size-8 shrink-0 items-center justify-center rounded-xl border-2 shadow-[2px_2px_0px_#111111]">
                        <Icon className="text-ink size-4" aria-hidden />
                      </span>
                    </div>

                    {/* Konten Utama Kartu */}
                    <div className="relative z-10 min-w-0 space-y-1">
                      <p className="text-ink/75 text-[11px] font-extrabold tracking-wide uppercase">
                        Saldo Dompet
                      </p>
                      <h3 className="font-display text-ink truncate text-base leading-tight font-bold sm:text-lg">
                        {wallet.name}
                      </h3>
                      <p className="text-ink truncate text-xl leading-tight font-extrabold sm:text-2xl">
                        <PrivateAmount amount={Number(wallet.balance ?? 0)} />
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          {/* Deck Controls: Tombol Prev/Next + Indikator Kartu */}
          {totalWallets > 1 ? (
            <div className="flex items-center justify-between gap-2 pt-0.5">
              <div
                className="flex min-w-0 items-center gap-1.5 overflow-x-auto py-0.5"
                role="tablist"
                aria-label="Pilih kartu dompet"
              >
                {displayedWallets.map((wallet, idx) => {
                  const active = idx === safeActiveIndex;
                  const typeKey = resolveWalletType(wallet.wallet_type);
                  const accentHex = getSafeAccentColor(wallet.color, typeKey);

                  return (
                    <button
                      key={wallet.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      aria-label={`Pilih dompet ${wallet.name}`}
                      onClick={() => handleSelectWallet(idx)}
                      className={cn(
                        "border-ink inline-flex h-7 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border-2 px-2.5 text-[11px] font-extrabold transition-[background-color,transform] duration-150",
                        active
                          ? "bg-ink text-white"
                          : "bg-subtle text-ink hover:bg-card hover:-translate-y-0.5"
                      )}
                    >
                      <span
                        aria-hidden="true"
                        style={{ backgroundColor: accentHex }}
                        className="border-ink size-2.5 shrink-0 rounded-full border"
                      />
                      <span className="max-w-[84px] truncate">{wallet.name}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex shrink-0 items-center gap-1.5">
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  onClick={handlePrevCard}
                  disabled={Boolean(deckTransition)}
                  aria-label="Kartu dompet sebelumnya"
                  data-testid="wallet-deck-prev"
                  className="size-8"
                >
                  <ChevronLeft className="size-4 stroke-[2.5]" aria-hidden="true" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  onClick={handleNextCard}
                  disabled={Boolean(deckTransition)}
                  aria-label="Kartu dompet berikutnya"
                  data-testid="wallet-deck-next"
                  className="size-8"
                >
                  <ChevronRight className="size-4 stroke-[2.5]" aria-hidden="true" />
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-ink-soft text-center text-[11px] font-semibold">
              Tambahkan dompet lain (Bank, E-Wallet, Tunai) untuk menumpuk kartu di deck ini.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
