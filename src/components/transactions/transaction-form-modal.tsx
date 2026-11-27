"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  CalendarClock,
  Loader2,
  Plus,
  Store,
  StickyNote,
  Wallet as WalletIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { createTransaction } from "@/actions/transactions";
import { PrivateAmount } from "@/components/providers/privacy-provider";
import {
  getJakartaNowDatetimeLocal,
  toJakartaIsoString,
  TRANSACTION_AMOUNT_PRESETS,
} from "@/components/transactions/transaction-utils";
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
} from "@/components/ui/responsive-modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn, formatNominalInput } from "@/lib/utils";
import {
  createTransactionSchema,
  POKO_EXPENSE_CATEGORIES,
  POKO_INCOME_CATEGORIES,
  POKO_TRANSFER_CATEGORY,
  type CreateTransactionData,
  type CreateTransactionInput,
  type TransactionType,
} from "@/lib/validations/finance";
import type { Wallet } from "@/types/database";

export interface TransactionFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  wallets: Wallet[];
  onCreated?: () => void;
}

const TRANSACTION_TYPE_TABS: readonly {
  value: TransactionType;
  label: string;
  activeClass: string;
  Icon: typeof ArrowUpRight;
}[] = [
  {
    value: "expense",
    label: "Pengeluaran",
    activeClass: "bg-coral text-ink shadow-brutal-sm -translate-y-0.5",
    Icon: ArrowUpRight,
  },
  {
    value: "income",
    label: "Pemasukan",
    activeClass: "bg-lime text-ink shadow-brutal-sm -translate-y-0.5",
    Icon: ArrowDownLeft,
  },
  {
    value: "transfer",
    label: "Transfer",
    activeClass: "bg-cyan text-ink shadow-brutal-sm -translate-y-0.5",
    Icon: ArrowLeftRight,
  },
] as const;

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

interface TransactionFormBodyProps {
  wallets: Wallet[];
  onClose: () => void;
  onCreated?: () => void;
}

function TransactionFormBody({ wallets, onClose, onCreated }: TransactionFormBodyProps) {
  const router = useRouter();
  const [amountDisplay, setAmountDisplay] = React.useState("");
  const [serverError, setServerError] = React.useState<string | null>(null);

  const defaultWalletId = wallets[0]?.id ?? "";

  const {
    control,
    register,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<CreateTransactionInput, unknown, CreateTransactionData>({
    resolver: zodResolver(createTransactionSchema),
    defaultValues: {
      type: "expense",
      amount: 0,
      wallet_id: defaultWalletId,
      destination_wallet_id: null,
      category: POKO_EXPENSE_CATEGORIES[0].label,
      merchant: "",
      note: "",
      occurred_at: getJakartaNowDatetimeLocal(),
      source: "manual",
      metadata: {},
    },
  });

  const selectedType = useWatch({ control, name: "type" }) ?? "expense";
  const selectedWalletId = useWatch({ control, name: "wallet_id" }) ?? "";
  const selectedDestWalletId = asString(useWatch({ control, name: "destination_wallet_id" }));
  const selectedCategory = asString(useWatch({ control, name: "category" }));
  const selectedAmount = useWatch({ control, name: "amount" });

  const sourceWallet = React.useMemo(
    () => wallets.find((wallet) => wallet.id === selectedWalletId) ?? null,
    [wallets, selectedWalletId]
  );

  const destinationWallet = React.useMemo(
    () => wallets.find((wallet) => wallet.id === selectedDestWalletId) ?? null,
    [wallets, selectedDestWalletId]
  );

  const availableDestinationWallets = React.useMemo(
    () => wallets.filter((wallet) => wallet.id !== selectedWalletId),
    [wallets, selectedWalletId]
  );

  const activeCategoryPool =
    selectedType === "income" ? POKO_INCOME_CATEGORIES : POKO_EXPENSE_CATEGORIES;

  function handleSelectType(nextType: TransactionType) {
    setServerError(null);
    setValue("type", nextType, { shouldValidate: false });
    clearErrors(["destination_wallet_id", "category"]);

    if (nextType === "transfer") {
      setValue("category", POKO_TRANSFER_CATEGORY.label, { shouldValidate: false });
      const fallbackDest = wallets.find((wallet) => wallet.id !== selectedWalletId)?.id ?? null;
      if (!selectedDestWalletId || selectedDestWalletId === selectedWalletId) {
        setValue("destination_wallet_id", fallbackDest, { shouldValidate: false });
      }
      return;
    }

    setValue("destination_wallet_id", null, { shouldValidate: false });
    const nextPool = nextType === "income" ? POKO_INCOME_CATEGORIES : POKO_EXPENSE_CATEGORIES;
    const stillValid = nextPool.some(
      (cat) => cat.label.toLowerCase() === selectedCategory.trim().toLowerCase()
    );
    if (!stillValid) {
      setValue("category", nextPool[0].label, { shouldValidate: false });
    }
  }

  function handleSourceWalletChange(nextWalletId: string) {
    setServerError(null);
    setValue("wallet_id", nextWalletId, { shouldValidate: true });

    if (selectedType === "transfer" && selectedDestWalletId === nextWalletId) {
      const alternate = wallets.find((wallet) => wallet.id !== nextWalletId)?.id ?? null;
      setValue("destination_wallet_id", alternate, { shouldValidate: true });
    }
  }

  function handleAmountChange(
    numericValue: number | null,
    formattedValue: string,
    onFieldChange: (val: number) => void
  ) {
    setServerError(null);
    setAmountDisplay(formattedValue);
    onFieldChange(numericValue ?? 0);
  }

  function handlePresetAmount(presetAmount: number) {
    setServerError(null);
    setAmountDisplay(formatNominalInput(presetAmount));
    setValue("amount", presetAmount, { shouldValidate: true, shouldDirty: true });
  }

  async function onSubmitValid(data: CreateTransactionData) {
    setServerError(null);

    const payload: CreateTransactionInput = {
      type: data.type,
      amount: data.amount,
      wallet_id: data.wallet_id,
      destination_wallet_id: data.type === "transfer" ? (data.destination_wallet_id ?? null) : null,
      category:
        data.type === "transfer"
          ? POKO_TRANSFER_CATEGORY.label
          : (data.category ?? activeCategoryPool[0].label),
      merchant: data.merchant ?? null,
      note: data.note ?? "",
      occurred_at: toJakartaIsoString(data.occurred_at),
      source: "manual",
      metadata: {},
    };

    try {
      const result = await createTransaction(payload);

      if (!result.ok) {
        if (result.fieldErrors) {
          for (const [field, messages] of Object.entries(result.fieldErrors)) {
            const firstMessage = messages?.[0];
            if (
              firstMessage &&
              (field === "type" ||
                field === "amount" ||
                field === "wallet_id" ||
                field === "destination_wallet_id" ||
                field === "category" ||
                field === "merchant" ||
                field === "note" ||
                field === "occurred_at")
            ) {
              setError(field, { type: "server", message: firstMessage });
            }
          }
        }

        setServerError(result.error);
        toast.error("Gagal mencatat transaksi", {
          id: "poko-tx-create-error",
          description: result.error,
        });
        return;
      }

      const typeLabel =
        data.type === "income"
          ? "Pemasukan"
          : data.type === "transfer"
            ? "Transfer"
            : "Pengeluaran";

      toast.success(`${typeLabel} berhasil dicatat!`, {
        id: "poko-tx-create-success",
        description:
          data.type === "transfer"
            ? `Saldo ${sourceWallet?.name ?? "dompet asal"} & ${destinationWallet?.name ?? "dompet tujuan"} diperbarui secara atomik.`
            : `Saldo ${sourceWallet?.name ?? "dompet"} langsung diperbarui secara atomik.`,
      });

      onCreated?.();
      onClose();
      router.refresh();
    } catch {
      const fallbackError = "Terjadi kendala koneksi saat mencatat transaksi. Coba lagi.";
      setServerError(fallbackError);
      toast.error("Gagal mencatat transaksi", {
        id: "poko-tx-create-error",
        description: fallbackError,
      });
    }
  }

  if (wallets.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <div className="border-ink bg-peach/45 flex items-start gap-3 rounded-2xl border-2 p-4 text-sm font-semibold">
          <AlertCircle className="text-ink mt-0.5 size-5 shrink-0" aria-hidden="true" />
          <div className="space-y-1">
            <p className="text-ink font-extrabold">Belum ada dompet aktif</p>
            <p className="text-ink-muted text-xs leading-relaxed">
              Tambahkan minimal satu dompet terlebih dahulu di halaman Beranda agar transaksi bisa
              tercatat secara atomik.
            </p>
          </div>
        </div>

        <ResponsiveModalFooter>
          <ResponsiveModalClose asChild>
            <Button variant="outline" size="sm" className="min-h-10">
              Tutup
            </Button>
          </ResponsiveModalClose>
          <Button asChild size="sm" className="min-h-10">
            <Link href="/dashboard">Buka Beranda Dompet</Link>
          </Button>
        </ResponsiveModalFooter>
      </div>
    );
  }

  const transferNeedsMoreWallets = selectedType === "transfer" && wallets.length < 2;

  return (
    <form
      onSubmit={handleSubmit(onSubmitValid)}
      noValidate
      data-testid="transaction-form"
      className="flex flex-col gap-4"
    >
      {/* Switcher Tipe Transaksi */}
      <div
        role="tablist"
        aria-label="Tipe transaksi"
        className="border-ink bg-subtle grid grid-cols-3 gap-1.5 rounded-2xl border-[2.5px] p-1.5"
      >
        {TRANSACTION_TYPE_TABS.map((tab) => {
          const active = selectedType === tab.value;
          const Icon = tab.Icon;

          return (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={active}
              data-testid={`tx-type-tab-${tab.value}`}
              disabled={isSubmitting}
              onClick={() => handleSelectType(tab.value)}
              className={cn(
                "flex min-h-10 cursor-pointer items-center justify-center gap-1 rounded-xl border-2 px-1.5 py-2 text-[11px] font-extrabold transition-[transform,box-shadow,background-color] duration-150 min-[400px]:text-xs sm:gap-1.5 sm:px-2 sm:text-[13px]",
                active
                  ? cn("border-ink", tab.activeClass)
                  : "text-ink-muted hover:text-ink border-transparent bg-transparent hover:bg-card/70"
              )}
            >
              <Icon
                className="hidden size-3.5 shrink-0 stroke-[2.5] min-[430px]:inline-block"
                aria-hidden="true"
              />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Nominal + Quick Preset Chips */}
      <div className="flex flex-col gap-2">
        <label htmlFor="tx-amount" className="text-ink text-xs font-extrabold uppercase">
          Nominal (Rp)
        </label>
        <Controller
          control={control}
          name="amount"
          render={({ field }) => (
            <NominalInput
              id="tx-amount"
              name={field.name}
              ref={field.ref}
              showPrefix
              placeholder="cth: 35.000"
              disabled={isSubmitting}
              value={amountDisplay}
              aria-invalid={Boolean(errors.amount)}
              aria-describedby={errors.amount ? "tx-amount-error" : undefined}
              onBlur={field.onBlur}
              onValueChange={(numeric, formatted) =>
                handleAmountChange(numeric, formatted, field.onChange)
              }
              className="text-base"
            />
          )}
        />

        {/* Quick Preset Chips */}
        <div
          className="flex flex-wrap items-center gap-1.5"
          role="group"
          aria-label="Nominal cepat"
        >
          {TRANSACTION_AMOUNT_PRESETS.map((preset) => {
            const active = selectedAmount === preset.amount;
            return (
              <button
                key={preset.amount}
                type="button"
                disabled={isSubmitting}
                data-testid={`tx-preset-${preset.amount}`}
                onClick={() => handlePresetAmount(preset.amount)}
                className={cn(
                  "border-ink min-h-8 cursor-pointer rounded-full border-2 px-3 py-1 font-mono text-xs font-extrabold transition-[transform,box-shadow,background-color] duration-150",
                  active
                    ? "bg-yellow text-ink shadow-[2px_2px_0px_#111111] -translate-y-0.5"
                    : "bg-card text-ink hover:bg-subtle"
                )}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        {errors.amount?.message ? (
          <p id="tx-amount-error" role="alert" className="text-expense text-xs font-bold">
            {errors.amount.message}
          </p>
        ) : null}
      </div>

      {/* Dompet Asal & Dompet Tujuan */}
      <div className={cn("grid gap-3", selectedType === "transfer" ? "sm:grid-cols-2" : "")}>
        {/* Dompet Asal */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="tx-wallet-source"
            className="text-ink flex items-center gap-1.5 text-xs font-extrabold uppercase"
          >
            <WalletIcon className="size-3.5" aria-hidden="true" />
            <span>{selectedType === "transfer" ? "Dompet Asal" : "Dompet"}</span>
          </label>
          <Controller
            control={control}
            name="wallet_id"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={handleSourceWalletChange}
                disabled={isSubmitting}
              >
                <SelectTrigger
                  id="tx-wallet-source"
                  aria-invalid={Boolean(errors.wallet_id)}
                  className="w-full"
                >
                  <SelectValue placeholder="Pilih dompet asal" />
                </SelectTrigger>
                <SelectContent>
                  {wallets.map((wallet) => (
                    <SelectItem key={wallet.id} value={wallet.id}>
                      <span className="flex items-center gap-2">
                        <span className="truncate font-bold">{wallet.name}</span>
                        <span className="text-ink-muted text-xs font-semibold">
                          (<PrivateAmount amount={Number(wallet.balance ?? 0)} />)
                        </span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {sourceWallet ? (
            <p className="text-ink-muted text-[11px] font-semibold">
              Saldo saat ini:{" "}
              <PrivateAmount
                amount={Number(sourceWallet.balance ?? 0)}
                className="text-ink font-extrabold"
              />
            </p>
          ) : null}
          {errors.wallet_id?.message ? (
            <p role="alert" className="text-expense text-xs font-bold">
              {errors.wallet_id.message}
            </p>
          ) : null}
        </div>

        {/* Dompet Tujuan (khusus Transfer) */}
        {selectedType === "transfer" ? (
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="tx-wallet-destination"
              className="text-ink flex items-center gap-1.5 text-xs font-extrabold uppercase"
            >
              <ArrowLeftRight className="size-3.5" aria-hidden="true" />
              <span>Dompet Tujuan</span>
            </label>
            <Controller
              control={control}
              name="destination_wallet_id"
              render={({ field }) => (
                <Select
                  value={asString(field.value)}
                  onValueChange={(val) => {
                    setServerError(null);
                    field.onChange(val);
                  }}
                  disabled={isSubmitting || transferNeedsMoreWallets}
                >
                  <SelectTrigger
                    id="tx-wallet-destination"
                    aria-invalid={Boolean(errors.destination_wallet_id)}
                    className="w-full"
                  >
                    <SelectValue
                      placeholder={
                        transferNeedsMoreWallets ? "Butuh minimal 2 dompet" : "Pilih dompet tujuan"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {wallets.map((wallet) => {
                      const isSameAsSource = wallet.id === selectedWalletId;
                      return (
                        <SelectItem key={wallet.id} value={wallet.id} disabled={isSameAsSource}>
                          <span className="flex items-center gap-2">
                            <span className="truncate font-bold">{wallet.name}</span>
                            {isSameAsSource ? (
                              <span className="text-ink-soft text-[11px] font-semibold">
                                (Dompet asal)
                              </span>
                            ) : (
                              <span className="text-ink-muted text-xs font-semibold">
                                (<PrivateAmount amount={Number(wallet.balance ?? 0)} />)
                              </span>
                            )}
                          </span>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              )}
            />
            {transferNeedsMoreWallets ? (
              <p className="text-warning-text text-[11px] font-bold">
                Tambahkan 1 dompet lagi di Beranda untuk melakukan transfer antar dompet.
              </p>
            ) : destinationWallet ? (
              <p className="text-ink-muted text-[11px] font-semibold">
                Saldo tujuan:{" "}
                <PrivateAmount
                  amount={Number(destinationWallet.balance ?? 0)}
                  className="text-ink font-extrabold"
                />
              </p>
            ) : availableDestinationWallets.length > 0 ? (
              <p className="text-ink-soft text-[11px] font-medium">
                Pilih dompet berbeda dari dompet asal.
              </p>
            ) : null}
            {errors.destination_wallet_id?.message ? (
              <p role="alert" className="text-expense text-xs font-bold">
                {errors.destination_wallet_id.message}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

      {/* Kategori */}
      <fieldset className="space-y-2">
        <legend className="text-ink text-xs font-extrabold uppercase">Kategori</legend>
        {selectedType === "transfer" ? (
          <div className="border-ink bg-cyan/40 inline-flex items-center gap-2 rounded-xl border-2 px-3.5 py-2 text-xs font-extrabold shadow-[2px_2px_0px_#111111]">
            <span aria-hidden="true">{POKO_TRANSFER_CATEGORY.emoji}</span>
            <span>Transfer Antar Dompet (Otomatis)</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {activeCategoryPool.map((cat) => {
              const active =
                selectedCategory.trim().toLowerCase() === cat.label.toLowerCase() ||
                selectedCategory.trim().toLowerCase() === cat.id.toLowerCase();

              return (
                <button
                  key={cat.id}
                  type="button"
                  disabled={isSubmitting}
                  aria-pressed={active}
                  onClick={() => {
                    setServerError(null);
                    setValue("category", cat.label, { shouldValidate: true });
                  }}
                  style={active ? { backgroundColor: cat.color } : undefined}
                  className={cn(
                    "border-ink flex min-h-10 cursor-pointer items-center gap-2 rounded-xl border-2 px-2.5 py-1.5 text-left text-xs font-extrabold transition-[transform,box-shadow,background-color] duration-150",
                    active
                      ? "text-ink shadow-[2px_2px_0px_#111111] -translate-x-0.5 -translate-y-0.5"
                      : "bg-card text-ink hover:bg-subtle"
                  )}
                >
                  <span className="text-base leading-none" aria-hidden="true">
                    {cat.emoji}
                  </span>
                  <span className="truncate">{cat.label}</span>
                </button>
              );
            })}
          </div>
        )}
        {errors.category?.message ? (
          <p role="alert" className="text-expense text-xs font-bold">
            {errors.category.message}
          </p>
        ) : null}
      </fieldset>

      {/* Merchant & Tanggal/Waktu */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="tx-merchant"
            className="text-ink flex items-center gap-1.5 text-xs font-extrabold uppercase"
          >
            <Store className="size-3.5" aria-hidden="true" />
            <span>Merchant (Opsional)</span>
          </label>
          <Input
            id="tx-merchant"
            type="text"
            maxLength={120}
            autoComplete="off"
            disabled={isSubmitting}
            placeholder={
              selectedType === "income"
                ? "cth: Kantor, Klien Desain"
                : selectedType === "transfer"
                  ? "cth: Top up e-wallet"
                  : "cth: Kopi Kenangan, Gojek"
            }
            aria-invalid={Boolean(errors.merchant)}
            {...register("merchant")}
          />
          {errors.merchant?.message ? (
            <p role="alert" className="text-expense text-xs font-bold">
              {errors.merchant.message}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="tx-occurred-at"
            className="text-ink flex items-center gap-1.5 text-xs font-extrabold uppercase"
          >
            <CalendarClock className="size-3.5" aria-hidden="true" />
            <span>Tanggal &amp; Waktu (WIB)</span>
          </label>
          <Input
            id="tx-occurred-at"
            type="datetime-local"
            disabled={isSubmitting}
            aria-invalid={Boolean(errors.occurred_at)}
            className="font-mono text-xs sm:text-sm"
            {...register("occurred_at")}
          />
          {errors.occurred_at?.message ? (
            <p role="alert" className="text-expense text-xs font-bold">
              {errors.occurred_at.message}
            </p>
          ) : null}
        </div>
      </div>

      {/* Catatan */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="tx-note"
          className="text-ink flex items-center gap-1.5 text-xs font-extrabold uppercase"
        >
          <StickyNote className="size-3.5" aria-hidden="true" />
          <span>Catatan (Opsional)</span>
        </label>
        <Input
          id="tx-note"
          type="text"
          maxLength={280}
          autoComplete="off"
          disabled={isSubmitting}
          placeholder="cth: Matcha latte + roti buat sarapan"
          aria-invalid={Boolean(errors.note)}
          {...register("note")}
        />
        {errors.note?.message ? (
          <p role="alert" className="text-expense text-xs font-bold">
            {errors.note.message}
          </p>
        ) : null}
      </div>

      {/* Server Error Banner */}
      {serverError ? (
        <div
          role="alert"
          className="border-ink bg-coral/20 text-expense flex items-start gap-2 rounded-xl border-2 px-3 py-2.5 text-xs font-bold"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{serverError}</span>
        </div>
      ) : null}

      <ResponsiveModalFooter className="pt-1">
        <ResponsiveModalClose asChild>
          <Button variant="outline" size="sm" disabled={isSubmitting} className="min-h-10">
            Batal
          </Button>
        </ResponsiveModalClose>
        <Button
          type="submit"
          disabled={isSubmitting || transferNeedsMoreWallets}
          data-testid="tx-submit-btn"
          className="min-h-10 sm:min-w-[180px]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              <span>Menyimpan...</span>
            </>
          ) : (
            <>
              <Plus className="size-4 stroke-[2.75]" aria-hidden="true" />
              <span>Simpan Transaksi</span>
            </>
          )}
        </Button>
      </ResponsiveModalFooter>
    </form>
  );
}

export function TransactionFormModal({
  open,
  onOpenChange,
  wallets,
  onCreated,
}: TransactionFormModalProps) {
  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange}>
      <ResponsiveModalContent className="gap-4 sm:max-w-[540px]">
        <ResponsiveModalHeader>
          <ResponsiveModalTitle className="flex items-center gap-2">
            <span className="border-ink bg-lime inline-flex size-7 items-center justify-center rounded-lg border-2 shadow-[2px_2px_0px_#111111]">
              <Plus className="text-ink size-4 stroke-[2.75]" aria-hidden="true" />
            </span>
            <span>Catat Transaksi</span>
          </ResponsiveModalTitle>
          <ResponsiveModalDescription>
            Catat pemasukan, pengeluaran, atau transfer antar dompet. Saldo dompet langsung
            terupdate secara atomik.
          </ResponsiveModalDescription>
        </ResponsiveModalHeader>

        {open ? (
          <TransactionFormBody
            wallets={wallets}
            onClose={() => onOpenChange(false)}
            onCreated={onCreated}
          />
        ) : null}
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
