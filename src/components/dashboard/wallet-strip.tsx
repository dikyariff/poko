"use client";

import * as React from "react";
import {
  Banknote,
  Check,
  Landmark,
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
import { cn } from "@/lib/utils";
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

    const cleanedBalance = balanceInput.replace(/[^\d]/g, "");
    const parsedBalance = cleanedBalance === "" ? 0 : Number.parseInt(cleanedBalance, 10);
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
        <Input
          id="new-wallet-balance"
          name="balance"
          type="number"
          inputMode="numeric"
          min={0}
          step={1000}
          className="font-mono tabular-nums"
          placeholder="0"
          value={balanceInput}
          aria-invalid={Boolean(fieldErrors.balance)}
          onChange={(event) => {
            setBalanceInput(event.target.value);
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
                    ? "shadow-brutal-sm -translate-y-0.5 scale-105 ring-2 ring-ink ring-offset-2"
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

export function WalletStrip({ wallets, dataSource = "supabase" }: WalletStripProps) {
  const [modalOpen, setModalOpen] = React.useState(false);
  const [createdWallets, setCreatedWallets] = React.useState<Wallet[]>([]);

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

  const nextSortOrder = React.useMemo(() => {
    if (displayedWallets.length === 0) return 1;
    return Math.max(...displayedWallets.map((item) => item.sort_order ?? 0)) + 1;
  }, [displayedWallets]);

  function handleWalletCreated(created: Wallet) {
    setCreatedWallets((prev) => {
      const updated = created.is_primary_savings
        ? prev.map((item) => ({ ...item, is_primary_savings: false }))
        : prev;
      return [...updated, created];
    });
  }

  return (
    <section
      aria-labelledby="wallet-strip-heading"
      data-slot="wallet-strip"
      className="border-ink bg-card shadow-brutal flex min-w-0 flex-col gap-4 rounded-[22px] border-[2.5px] p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0 space-y-0.5">
          <h2
            id="wallet-strip-heading"
            className="font-display text-ink text-lg leading-snug font-bold tracking-tight"
          >
            Dompet &amp; Akun Aktif
          </h2>
          <p className="text-ink-muted text-xs font-semibold sm:text-sm">
            Semua saldo dompet terakumulasi otomatis ke Total Saldo Bersih kamu.
          </p>
        </div>

        <ResponsiveModal open={modalOpen} onOpenChange={setModalOpen}>
          <ResponsiveModalTrigger asChild>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              data-testid="btn-add-wallet"
              className="min-h-10 px-3.5 text-xs font-extrabold"
            >
              <Plus className="size-4 stroke-[2.75]" aria-hidden="true" />
              Tambah Dompet
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

      {displayedWallets.length === 0 ? (
        <div className="border-ink bg-subtle flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-4 py-7 text-center">
          <span className="border-ink bg-yellow shadow-brutal-sm inline-flex size-12 items-center justify-center rounded-2xl border-2">
            <WalletIcon className="text-ink size-6" aria-hidden="true" />
          </span>
          <div className="space-y-1">
            <p className="font-display text-ink text-base font-bold">
              {dataSource === "fallback"
                ? "Dompet belum tersinkron dengan database"
                : "Belum ada dompet aktif"}
            </p>
            <p className="text-ink-muted max-w-md text-xs leading-relaxed font-medium">
              {dataSource === "fallback"
                ? "Hubungkan Supabase untuk memunculkan dompet bawaan Poko (Tabungan Utama)."
                : "Tambahkan dompet pertamamu sekarang supaya pemasukan dan pengeluaranmu rapi terpisah."}
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
        <div className="grid grid-cols-1 gap-3 min-[400px]:grid-cols-2 lg:grid-cols-4">
          {displayedWallets.map((wallet) => {
            const typeKey = resolveWalletType(wallet.wallet_type);
            const { label, Icon } = WALLET_TYPE_META[typeKey];
            const accentHex = getSafeAccentColor(wallet.color, typeKey);

            return (
              <article
                key={wallet.id}
                data-slot="wallet-card"
                style={{ backgroundColor: `${accentHex}33` }}
                className="border-ink shadow-brutal-sm flex min-w-0 flex-col justify-between gap-3 rounded-2xl border-[2.5px] p-4 transition-[transform,box-shadow] duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                    <span className="border-ink bg-card inline-flex items-center rounded-full border-2 px-2 py-0.5 text-[11px] font-extrabold">
                      {label}
                    </span>
                    {wallet.is_primary_savings ? (
                      <span
                        data-slot="primary-savings-badge"
                        className="border-ink bg-lime text-ink inline-flex items-center gap-1 rounded-full border-2 px-2 py-0.5 text-[10px] font-extrabold"
                      >
                        <Sparkles className="size-3 shrink-0" aria-hidden="true" />
                        Tabungan Utama
                      </span>
                    ) : null}
                  </div>

                  <span
                    style={{ backgroundColor: accentHex }}
                    className="border-ink flex size-9 shrink-0 items-center justify-center rounded-xl border-2 shadow-[2px_2px_0px_#111111]"
                    aria-hidden="true"
                  >
                    <Icon className="text-ink size-4" aria-hidden />
                  </span>
                </div>

                <div className="min-w-0 space-y-1">
                  <h3 className="font-display text-ink truncate text-[15px] leading-tight font-bold">
                    {wallet.name}
                  </h3>
                  <p className="text-ink truncate text-base font-extrabold sm:text-lg">
                    <PrivateAmount amount={Number(wallet.balance ?? 0)} />
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
