"use client";

import * as React from "react";
import {
  BellRingIcon,
  LayersIcon,
  PanelBottomOpenIcon,
  PlusIcon,
  SparklesIcon,
  Trash2Icon,
  WalletIcon,
} from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn, formatIDR } from "@/lib/utils";

const walletSamples = [
  { name: "BCA Utama", kind: "Rekening", balance: 6450000, badge: "bg-lime" },
  { name: "GoPay Harian", kind: "E-Wallet", balance: 785000, badge: "bg-cyan" },
  { name: "Kantong Impian", kind: "Tabungan", balance: 4200000, badge: "bg-yellow" },
];

export function DesignSystemShowcase() {
  const isDesktop = useMediaQuery("(min-width: 768px)", false);
  const [responsiveOpen, setResponsiveOpen] = React.useState(false);
  const [dreamProgress, setDreamProgress] = React.useState(72);
  const [txAmount, setTxAmount] = React.useState("125000");
  const [txNote, setTxNote] = React.useState("Kopi susu & roti bakar");
  const [selectedWallet, setSelectedWallet] = React.useState("bca");
  const [selectedCategory, setSelectedCategory] = React.useState("makan");

  function handleSaveQuickTx(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = Number(txAmount) || 0;
    toast.success("Transaksi berhasil dicatat!", {
      description: `${txNote || "Catatan cepat"} · ${formatIDR(parsed)}`,
    });
    setResponsiveOpen(false);
  }

  function handleAddDreamDeposit() {
    setDreamProgress((prev) => {
      const next = prev >= 100 ? 35 : Math.min(100, prev + 10);
      toast.success(next === 100 ? "Target impian tercapai 100%!" : `Progres naik ke ${next}%`, {
        description: "Kantong Impian: Laptop Baru tersinkron otomatis.",
      });
      return next;
    });
  }

  return (
    <section
      className="flex flex-col gap-6"
      aria-label="Smoke-Test Komponen Neo-Brutalist shadcn/ui"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="border-ink bg-yellow shadow-brutal-sm inline-flex items-center gap-1.5 rounded-full border-2 px-3 py-1 font-mono text-xs font-bold uppercase">
            <SparklesIcon className="size-3.5 stroke-[2.5]" />
            Phase 1 · Task 2 UI Kit
          </span>
          <h2 className="font-display text-ink mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Smoke-Test 11 Komponen &amp; ResponsiveModal
          </h2>
        </div>
        <span
          data-testid="viewport-mode-pill"
          className="border-ink bg-card shadow-brutal-sm inline-flex items-center gap-2 rounded-full border-2 px-3 py-1.5 font-mono text-xs font-bold"
        >
          <span
            className={cn(
              "border-ink inline-block size-2.5 rounded-full border",
              isDesktop ? "bg-lime" : "bg-cyan"
            )}
            aria-hidden="true"
          />
          {isDesktop ? "Desktop >=768px · Dialog" : "Mobile <768px · Vaul Drawer"}
        </span>
      </div>

      {/* Row 1: Buttons + Modals/Alerts/Toasts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Varian Tombol Taktil</CardTitle>
            <CardDescription>
              Border tegas 2.5px, hard offset shadow, tactile press shift, dan focus-visible ring
              berkontras tinggi.
            </CardDescription>
            <CardAction>
              <span className="border-ink bg-lime rounded-lg border-2 px-2 py-0.5 font-mono text-xs font-bold">
                Button
              </span>
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2.5">
              <Button variant="default">
                <PlusIcon className="stroke-[2.75]" />
                Primary Lime
              </Button>
              <Button variant="secondary">Secondary Yellow</Button>
              <Button variant="outline">Outline Paper</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">
                <Trash2Icon className="stroke-[2.5]" />
                Destructive
              </Button>
            </div>
            <div className="border-ink/15 flex flex-wrap items-center gap-2.5 border-t-2 pt-4">
              <Button size="sm" variant="default">
                Size SM
              </Button>
              <Button size="lg" variant="secondary">
                Size LG
              </Button>
              <Button size="icon" variant="outline" aria-label="Notifikasi Poko">
                <BellRingIcon className="stroke-[2.5]" />
              </Button>
              <Button variant="link">Link Style</Button>
              <Button variant="outline" disabled>
                Disabled
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Modal, Drawer, Alert &amp; Sonner</CardTitle>
            <CardDescription>
              Uji interaksi ResponsiveModal otomatis, AlertDialog destruktif, dan notifikasi toast
              Neo-Brutalist.
            </CardDescription>
            <CardAction>
              <span className="border-ink bg-cyan rounded-lg border-2 px-2 py-0.5 font-mono text-xs font-bold">
                Overlay
              </span>
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2.5">
              {/* ResponsiveModal: Dialog on Desktop >= 768px, Vaul Drawer on Mobile < 768px */}
              <ResponsiveModal open={responsiveOpen} onOpenChange={setResponsiveOpen}>
                <ResponsiveModalTrigger asChild>
                  <Button data-testid="open-responsive-modal">
                    <LayersIcon className="stroke-[2.5]" />
                    Buka ResponsiveModal
                  </Button>
                </ResponsiveModalTrigger>
                <ResponsiveModalContent>
                  <ResponsiveModalHeader>
                    <ResponsiveModalTitle>Catat Transaksi Cepat</ResponsiveModalTitle>
                    <ResponsiveModalDescription>
                      Komponen ini otomatis memakai Dialog di desktop (&ge; 768px) dan Vaul Drawer
                      di mobile (&lt; 768px).
                    </ResponsiveModalDescription>
                  </ResponsiveModalHeader>
                  <form onSubmit={handleSaveQuickTx} className="flex flex-col gap-3.5">
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="modal-nominal" className="text-xs font-extrabold uppercase">
                        Nominal (Rp)
                      </label>
                      <Input
                        id="modal-nominal"
                        type="number"
                        inputMode="numeric"
                        className="font-mono tabular-nums"
                        value={txAmount}
                        onChange={(e) => setTxAmount(e.target.value)}
                        placeholder="Contoh: 45000"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="modal-note" className="text-xs font-extrabold uppercase">
                        Catatan
                      </label>
                      <Input
                        id="modal-note"
                        value={txNote}
                        onChange={(e) => setTxNote(e.target.value)}
                        placeholder="Makan siang bareng teman"
                      />
                    </div>
                    <ResponsiveModalFooter className="pt-2">
                      <ResponsiveModalClose asChild>
                        <Button variant="outline">Batal</Button>
                      </ResponsiveModalClose>
                      <Button type="submit">Simpan Catatan</Button>
                    </ResponsiveModalFooter>
                  </form>
                </ResponsiveModalContent>
              </ResponsiveModal>

              {/* AlertDialog */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" data-testid="open-alert-dialog">
                    <Trash2Icon className="stroke-[2.5]" />
                    Buka AlertDialog
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Hapus Target Impian?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Saldo yang tersimpan di kantong impian akan dikembalikan ke dompet utama BCA.
                      Tindakan ini tidak bisa dibatalkan.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Kembali</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() =>
                        toast.error("Target impian dihapus", {
                          description: "Dana dikembalikan ke dompet BCA Utama.",
                        })
                      }
                    >
                      Ya, Hapus Target
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            <div className="border-ink/15 flex flex-wrap gap-2.5 border-t-2 pt-4">
              {/* Direct Dialog & Drawer triggers */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    Dialog Langsung
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Dialog Neo-Brutalist</DialogTitle>
                    <DialogDescription>
                      Pratinjau langsung komponen shadcn Dialog dengan hard offset shadow.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="secondary">Siap, Mengerti</Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Drawer>
                <DrawerTrigger asChild>
                  <Button variant="outline" size="sm">
                    <PanelBottomOpenIcon className="stroke-[2.5]" />
                    Drawer Langsung
                  </Button>
                </DrawerTrigger>
                <DrawerContent>
                  <DrawerHeader>
                    <DrawerTitle>Vaul Bottom Sheet</DrawerTitle>
                    <DrawerDescription>
                      Tarik gagang atas ke bawah atau tekan tombol tutup untuk menutup sheet.
                    </DrawerDescription>
                  </DrawerHeader>
                  <DrawerFooter>
                    <DrawerClose asChild>
                      <Button variant="default">Tutup Drawer</Button>
                    </DrawerClose>
                  </DrawerFooter>
                </DrawerContent>
              </Drawer>

              {/* Sonner Toast triggers */}
              <Button
                variant="secondary"
                size="sm"
                data-testid="trigger-sonner-toast"
                onClick={() =>
                  toast.success("Setoran tabungan masuk!", {
                    description: "+Rp 250.000 ke Kantong Impian: Laptop Baru",
                    action: {
                      label: "Lihat",
                      onClick: () => toast.info("Membuka rincian Kantong Impian..."),
                    },
                  })
                }
              >
                <BellRingIcon className="stroke-[2.5]" />
                Trigger Toast
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  toast.warning("Batas anggaran hampir tercapai", {
                    description: "Pengeluaran Kopi & Jajan bulan ini sudah 85%.",
                  })
                }
              >
                Toast Warning
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Form Controls (Input + Select) + Tabs / Progress / Skeleton */}
      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-5">
          <CardHeader>
            <CardTitle>Input &amp; Select</CardTitle>
            <CardDescription>
              Kontrol form Neo-Brutalist dengan kontras placeholder WCAG AA dan state invalid.
            </CardDescription>
            <CardAction>
              <span className="border-ink bg-lavender rounded-lg border-2 px-2 py-0.5 font-mono text-xs font-bold">
                Form
              </span>
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="showcase-amount" className="text-xs font-extrabold uppercase">
                Nominal Transaksi
              </label>
              <Input
                id="showcase-amount"
                type="number"
                inputMode="numeric"
                className="font-mono tabular-nums"
                value={txAmount}
                onChange={(e) => setTxAmount(e.target.value)}
                placeholder="Masukkan nominal Rupiah..."
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="showcase-wallet" className="text-xs font-extrabold uppercase">
                Pilih Dompet
              </label>
              <Select value={selectedWallet} onValueChange={setSelectedWallet}>
                <SelectTrigger id="showcase-wallet" aria-label="Pilih Dompet">
                  <SelectValue placeholder="Pilih dompet sumber" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Dompet Aktif</SelectLabel>
                    <SelectItem value="bca">BCA Utama · Rp 6.450.000</SelectItem>
                    <SelectItem value="gopay">GoPay Harian · Rp 785.000</SelectItem>
                    <SelectItem value="tabungan">Kantong Impian · Rp 4.200.000</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="showcase-category" className="text-xs font-extrabold uppercase">
                Kategori
              </label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger id="showcase-category" aria-label="Pilih Kategori">
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Kategori Populer</SelectLabel>
                    <SelectItem value="makan">Makan &amp; Kopi</SelectItem>
                    <SelectItem value="transport">Transportasi</SelectItem>
                    <SelectItem value="gaji">Gaji &amp; Proyek</SelectItem>
                    <SelectItem value="impian">Setoran Impian</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="justify-between">
            <span className="text-ink-muted font-mono text-xs font-bold tabular-nums">
              {formatIDR(Number(txAmount) || 0)}
            </span>
            <Button
              size="sm"
              onClick={() =>
                toast.success("Form tersimpan!", {
                  description: `Dompet: ${selectedWallet.toUpperCase()} · Kategori: ${selectedCategory}`,
                })
              }
            >
              Simpan Simulasi
            </Button>
          </CardFooter>
        </Card>

        <Card className="lg:col-span-7">
          <CardHeader>
            <CardTitle>Tabs, Progress &amp; Skeleton</CardTitle>
            <CardDescription>
              Navigasi segmented control, progress bar bergaris, dan placeholder loading state.
            </CardDescription>
            <CardAction>
              <span className="border-ink bg-peach rounded-lg border-2 px-2 py-0.5 font-mono text-xs font-bold">
                Display
              </span>
            </CardAction>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="impian" className="w-full">
              <TabsList aria-label="Mode Pratinjau Poko">
                <TabsTrigger value="impian" data-testid="tab-impian">
                  Target Impian
                </TabsTrigger>
                <TabsTrigger value="dompet" data-testid="tab-dompet">
                  Ringkasan Dompet
                </TabsTrigger>
                <TabsTrigger value="skeleton" data-testid="tab-skeleton">
                  Skeleton State
                </TabsTrigger>
              </TabsList>

              <TabsContent value="impian" className="flex flex-col gap-4 pt-2">
                <div className="border-ink bg-subtle flex flex-col gap-2 rounded-2xl border-2 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-display text-sm font-bold">Laptop Kerja Baru</span>
                    <span className="text-income font-mono text-xs font-extrabold tabular-nums">
                      {dreamProgress}%
                    </span>
                  </div>
                  <Progress value={dreamProgress} aria-label="Progres Laptop Kerja Baru" />
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <span className="text-ink-muted font-mono text-xs tabular-nums">
                      Target {formatIDR(15000000)}
                    </span>
                    <Button size="sm" variant="secondary" onClick={handleAddDreamDeposit}>
                      +10% Nabung
                    </Button>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="border-ink bg-card flex flex-col gap-2 rounded-xl border-2 p-3.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span>Liburan Bali</span>
                      <span className="text-transfer font-mono tabular-nums">48%</span>
                    </div>
                    <Progress value={48} tone="cyan" aria-label="Progres Liburan Bali" />
                  </div>

                  <div className="border-ink bg-card flex flex-col gap-2 rounded-xl border-2 p-3.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span>Batas Jajan Bulanan</span>
                      <span className="text-expense font-mono tabular-nums">86%</span>
                    </div>
                    <Progress value={86} tone="danger" aria-label="Batas Jajan Bulanan" />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="dompet" className="pt-2">
                <ul className="divide-ink/15 border-ink bg-subtle divide-y-2 rounded-2xl border-2">
                  {walletSamples.map((wallet) => (
                    <li
                      key={wallet.name}
                      className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className={cn(
                            "border-ink inline-flex size-8 items-center justify-center rounded-lg border-2",
                            wallet.badge
                          )}
                        >
                          <WalletIcon className="size-4 stroke-[2.5]" />
                        </span>
                        <div>
                          <p className="text-sm font-bold">{wallet.name}</p>
                          <p className="text-ink-muted text-xs font-medium">{wallet.kind}</p>
                        </div>
                      </div>
                      <span className="font-mono text-sm font-extrabold tabular-nums">
                        {formatIDR(wallet.balance)}
                      </span>
                    </li>
                  ))}
                </ul>
              </TabsContent>

              <TabsContent value="skeleton" className="pt-2">
                <div
                  className="border-ink bg-card flex flex-col gap-3.5 rounded-2xl border-2 p-4"
                  aria-label="Contoh Skeleton Loading"
                >
                  <div className="flex items-center gap-3">
                    <Skeleton className="size-11 shrink-0 rounded-xl" />
                    <div className="flex flex-1 flex-col gap-2">
                      <Skeleton className="h-4 w-2/5" />
                      <Skeleton className="h-3 w-3/5" />
                    </div>
                    <Skeleton className="h-6 w-24 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-full rounded-full" />
                  <div className="grid grid-cols-2 gap-3">
                    <Skeleton className="h-14 w-full" />
                    <Skeleton className="h-14 w-full" />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
