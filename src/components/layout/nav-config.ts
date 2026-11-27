import { BarChart3, Home, ReceiptText, Target, Trophy, type LucideIcon } from "lucide-react";

export interface DashboardNavItem {
  href: string;
  label: string;
  shortLabel: string;
  pageTitle: string;
  subtitle: string;
  icon: LucideIcon;
  badgeColor: string;
}

export const DASHBOARD_NAV_ITEMS: readonly DashboardNavItem[] = [
  {
    href: "/dashboard",
    label: "Beranda",
    shortLabel: "Beranda",
    pageTitle: "Beranda Keuangan",
    subtitle: "Ringkasan saldo bersih, arus kas, dan status koneksi Poko.",
    icon: Home,
    badgeColor: "bg-lime",
  },
  {
    href: "/dashboard/transactions",
    label: "Transaksi",
    shortLabel: "Transaksi",
    pageTitle: "Catatan Transaksi",
    subtitle: "Kelola pemasukan, pengeluaran, dan transfer antar dompet.",
    icon: ReceiptText,
    badgeColor: "bg-cyan",
  },
  {
    href: "/dashboard/dreams",
    label: "Impian & Tabungan",
    shortLabel: "Impian",
    pageTitle: "Impian & Tabungan",
    subtitle: "Pantau Tabungan Utama dan progres seluruh target impian.",
    icon: Target,
    badgeColor: "bg-yellow",
  },
  {
    href: "/dashboard/reports",
    label: "Laporan",
    shortLabel: "Laporan",
    pageTitle: "Laporan & Analitik",
    subtitle: "Evaluasi tren pengeluaran dan kesehatan arus kas bulanan.",
    icon: BarChart3,
    badgeColor: "bg-lavender",
  },
  {
    href: "/dashboard/missions",
    label: "Misi",
    shortLabel: "Misi",
    pageTitle: "Misi & Anti Boncos",
    subtitle: "Tantangan hemat harian dan milestone kantong kamu.",
    icon: Trophy,
    badgeColor: "bg-peach",
  },
] as const;

export function isNavItemActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") {
    return pathname === "/dashboard";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function getActiveRouteMeta(pathname: string): DashboardNavItem {
  return (
    DASHBOARD_NAV_ITEMS.find((item) => isNavItemActive(pathname, item.href)) ??
    DASHBOARD_NAV_ITEMS[0]
  );
}
