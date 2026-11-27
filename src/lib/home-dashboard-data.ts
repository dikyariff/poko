import { ensureStarterWallets } from "@/actions/wallets";
import type { TransactionWalletSummary, TransactionWithWallets } from "@/actions/transactions";
import { type BlobatarMood, isBlobatarMood } from "@/lib/blobatar";
import { getOrCreateProfile } from "@/lib/profile-server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  POKO_EXPENSE_CATEGORIES,
  POKO_INCOME_CATEGORIES,
  POKO_TRANSFER_CATEGORY,
} from "@/lib/validations/finance";
import type { Dream, Json, Wallet } from "@/types/database";

export interface PokoAiInsightItem {
  mood: BlobatarMood;
  badge: string;
  text: string;
  source: "gemini" | "deterministic";
}

export interface HomeDreamPreviewItem {
  id: string;
  title: string;
  emoji: string;
  category: string;
  targetAmount: number;
  currentAmount: number;
  remainingAmount: number;
  progressPercent: number;
  targetDate: string | null;
  priority: number;
  linkedWalletId: string | null;
  linkedWalletName: string;
  isPrimarySavingsSource: boolean;
}

export interface HomeDashboardMetrics {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  netCashflow: number;
  savingsRate: number | null;
  primarySavingsBalance: number;
  monthlyBudgetLimit: number;
  monthLabel: string;
  monthlyTransactionCount: number;
}

export interface HomeDashboardData {
  dataSource: "supabase" | "fallback";
  warningMessage: string | null;
  wallets: Wallet[];
  metrics: HomeDashboardMetrics;
  recentTransactions: TransactionWithWallets[];
  activeDreams: HomeDreamPreviewItem[];
  aiInsights: PokoAiInsightItem[];
  aiInsightUpdatedAt: string | null;
}

const DEFAULT_MONTHLY_BUDGET_LIMIT = 3_500_000;
const JAKARTA_TIME_ZONE = "Asia/Jakarta";

interface JakartaMonthRange {
  startIso: string;
  endExclusiveIso: string;
  monthLabel: string;
}

function getJakartaCurrentMonthRange(now = new Date()): JakartaMonthRange {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: JAKARTA_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
  }).formatToParts(now);

  const yearPart = Number(
    parts.find((part) => part.type === "year")?.value ?? now.getUTCFullYear()
  );
  const monthPart = Number(
    parts.find((part) => part.type === "month")?.value ?? now.getUTCMonth() + 1
  );

  const paddedMonth = String(monthPart).padStart(2, "0");
  const nextYear = monthPart === 12 ? yearPart + 1 : yearPart;
  const nextMonth = monthPart === 12 ? 1 : monthPart + 1;
  const paddedNextMonth = String(nextMonth).padStart(2, "0");

  const monthLabel = new Intl.DateTimeFormat("id-ID", {
    timeZone: JAKARTA_TIME_ZONE,
    month: "long",
    year: "numeric",
  }).format(now);

  return {
    startIso: `${yearPart}-${paddedMonth}-01T00:00:00.000+07:00`,
    endExclusiveIso: `${nextYear}-${paddedNextMonth}-01T00:00:00.000+07:00`,
    monthLabel,
  };
}

function resolveCategoryDisplay(rawCategory: string): { label: string; emoji: string } {
  const normalized = rawCategory.trim().toLowerCase();
  const allCategories = [
    ...POKO_EXPENSE_CATEGORIES,
    ...POKO_INCOME_CATEGORIES,
    POKO_TRANSFER_CATEGORY,
  ];

  const found = allCategories.find(
    (item) => item.id.toLowerCase() === normalized || item.label.toLowerCase() === normalized
  );

  if (found) {
    return { label: found.label, emoji: found.emoji };
  }

  return {
    label: rawCategory.trim() || "Lainnya",
    emoji: "📦",
  };
}

function parseSingleCachedInsight(raw: unknown): PokoAiInsightItem | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return null;
  }

  const record = raw as Record<string, unknown>;
  const textCandidate =
    typeof record.text === "string"
      ? record.text.trim()
      : typeof record.message === "string"
        ? record.message.trim()
        : "";

  if (!textCandidate) {
    return null;
  }

  const badgeCandidate =
    typeof record.badge === "string" && record.badge.trim().length > 0
      ? record.badge.trim().slice(0, 40)
      : "Insight Poko AI";

  const mood: BlobatarMood = isBlobatarMood(record.mood) ? record.mood : "happy";

  return {
    mood,
    badge: badgeCandidate,
    text: textCandidate,
    source: "gemini",
  };
}

/**
 * Membaca cache Gemini dari `profiles.ai_insight_cache` (Phase 5).
 * Mendukung bentuk objek tunggal `{ mood, badge, text }`, array objek, atau `{ insights: [...] }`.
 */
export function parseAiInsightCache(cache: Json | null | undefined): PokoAiInsightItem[] {
  if (!cache) {
    return [];
  }

  if (Array.isArray(cache)) {
    return cache
      .map((entry) => parseSingleCachedInsight(entry))
      .filter((entry): entry is PokoAiInsightItem => entry !== null);
  }

  if (typeof cache === "object") {
    const record = cache as Record<string, unknown>;
    if (Array.isArray(record.insights)) {
      return record.insights
        .map((entry) => parseSingleCachedInsight(entry))
        .filter((entry): entry is PokoAiInsightItem => entry !== null);
    }

    const single = parseSingleCachedInsight(record);
    return single ? [single] : [];
  }

  return [];
}

interface DeterministicInsightInput {
  metrics: HomeDashboardMetrics;
  walletsCount: number;
  topExpenseCategory: { category: string; sharePercent: number } | null;
  topDream: HomeDreamPreviewItem | null;
}

/**
 * Menghasilkan insight deterministik yang relevan dengan metrik bulan berjalan
 * tanpa menampilkan angka Rupiah mentah agar 100% aman terhadap Mode Privasi.
 */
function buildDeterministicInsights({
  metrics,
  walletsCount,
  topExpenseCategory,
  topDream,
}: DeterministicInsightInput): PokoAiInsightItem[] {
  const insights: PokoAiInsightItem[] = [];
  const budgetUsedPercent =
    metrics.monthlyBudgetLimit > 0
      ? Math.round((metrics.monthlyExpense / metrics.monthlyBudgetLimit) * 100)
      : 0;

  // 1. Insight utama berdasarkan arus kas & rasio menabung
  if (metrics.monthlyTransactionCount === 0) {
    insights.push({
      mood: "chill",
      badge: "Siap Mulai Catat",
      text: `Belum ada transaksi tercatat di ${metrics.monthLabel}. Mulai catat pemasukan atau jajan pertamamu supaya Poko bisa mantau rasio menabungmu secara real-time!`,
      source: "deterministic",
    });
  } else if (metrics.monthlyIncome > 0 && metrics.savingsRate !== null) {
    if (metrics.savingsRate >= 40) {
      insights.push({
        mood: "hyped",
        badge: "Mode Sultan Hemat",
        text: `Keren banget! Rasio menabungmu bulan ini tembus ${metrics.savingsRate}%. Pertahankan ritme ini biar Tabungan Utama makin ngebut!`,
        source: "deterministic",
      });
    } else if (metrics.savingsRate >= 15) {
      insights.push({
        mood: "happy",
        badge: "Arus Kas Sehat",
        text: `Rasio menabung bulan ini ada di ${metrics.savingsRate}% dan arus kas masih positif. Jaga rem jajan akhir pekan biar target bulanan makin aman.`,
        source: "deterministic",
      });
    } else if (metrics.savingsRate >= 0) {
      insights.push({
        mood: "thinking",
        badge: "Tipis-Tipis Aman",
        text: `Sisa arus kas bulan ini tinggal ${metrics.savingsRate}% dari pemasukan. Coba tunda belanja impulsif 3 hari ke depan biar napas dompet lebih lega.`,
        source: "deterministic",
      });
    } else {
      insights.push({
        mood: "broke",
        badge: "Waspada Boncos!",
        text: `Pengeluaran bulan ini sudah melampaui pemasukan yang tercatat. Saatnya mode hemat ketat dan cek ulang pos pengeluaran terbesarmu.`,
        source: "deterministic",
      });
    }
  } else if (metrics.monthlyExpense > 0) {
    insights.push({
      mood: budgetUsedPercent >= 85 ? "broke" : "thinking",
      badge: budgetUsedPercent >= 85 ? "Rem Jajan Dulu" : "Belum Ada Pemasukan",
      text: `Kamu sudah mencatat pengeluaran (${budgetUsedPercent}% dari batas jajan), tapi belum ada pemasukan di ${metrics.monthLabel}. Catat pemasukan agar rasio menabung terbaca akurat.`,
      source: "deterministic",
    });
  }

  // 2. Insight pos pengeluaran terbesar
  if (topExpenseCategory) {
    const catMeta = resolveCategoryDisplay(topExpenseCategory.category);
    insights.push({
      mood: topExpenseCategory.sharePercent >= 45 ? "thinking" : "chill",
      badge: `Fokus ${catMeta.label}`,
      text: `Pos pengeluaran terbesar bulan ini ada di ${catMeta.emoji} ${catMeta.label} (${topExpenseCategory.sharePercent}% dari total pengeluaran). Cek transaksi terbesarmu minggu ini buat cari peluang hemat.`,
      source: "deterministic",
    });
  }

  // 3. Insight progres impian teratas
  if (topDream) {
    if (topDream.progressPercent >= 100) {
      insights.push({
        mood: "love",
        badge: "Impian Siap Cair!",
        text: `Target ${topDream.emoji} ${topDream.title} lewat ${topDream.linkedWalletName} sudah mencapai 100%! Saatnya wujudkan impianmu di halaman Impian & Tabungan.`,
        source: "deterministic",
      });
    } else {
      insights.push({
        mood: topDream.progressPercent >= 60 ? "love" : "happy",
        badge: "Booster Impian",
        text: `Progres ${topDream.emoji} ${topDream.title} sudah ${topDream.progressPercent}% tersinkron dari ${topDream.linkedWalletName}. Sedikit demi sedikit lama-lama tercapai!`,
        source: "deterministic",
      });
    }
  } else {
    insights.push({
      mood: "happy",
      badge: "Pasang Target Yuk",
      text: `Kamu punya ${walletsCount} dompet aktif tapi belum ada target Impian. Bikin 1 target pertamamu biar Tabungan Utama punya tujuan yang jelas!`,
      source: "deterministic",
    });
  }

  return insights;
}

function buildFallbackDashboardData(warningMessage: string): HomeDashboardData {
  const { monthLabel } = getJakartaCurrentMonthRange();

  const metrics: HomeDashboardMetrics = {
    totalBalance: 0,
    monthlyIncome: 0,
    monthlyExpense: 0,
    netCashflow: 0,
    savingsRate: null,
    primarySavingsBalance: 0,
    monthlyBudgetLimit: DEFAULT_MONTHLY_BUDGET_LIMIT,
    monthLabel,
    monthlyTransactionCount: 0,
  };

  return {
    dataSource: "fallback",
    warningMessage,
    wallets: [],
    metrics,
    recentTransactions: [],
    activeDreams: [],
    aiInsights: [
      {
        mood: "thinking",
        badge: "Mode Pratinjau",
        text: "Koneksi database Supabase belum aktif. Setelah environment Supabase terhubung, saldo dompet, transaksi, dan progres Impian akan tampil real-time di sini.",
        source: "deterministic",
      },
    ],
    aiInsightUpdatedAt: null,
  };
}

function resolvePrimarySavingsWallet(wallets: Wallet[]): Wallet | null {
  return (
    wallets.find((wallet) => wallet.is_primary_savings) ??
    wallets.find((wallet) => wallet.wallet_type === "savings") ??
    null
  );
}

function mapDreamsWithLiveBalance(
  dreams: Dream[],
  wallets: Wallet[],
  primarySavingsWallet: Wallet | null
): HomeDreamPreviewItem[] {
  const walletMap = new Map<string, Wallet>(wallets.map((wallet) => [wallet.id, wallet]));

  return dreams.map((dream) => {
    const linkedWallet = dream.linked_wallet_id
      ? (walletMap.get(dream.linked_wallet_id) ?? primarySavingsWallet)
      : primarySavingsWallet;

    const currentAmount = Math.max(0, Number(linkedWallet?.balance ?? 0));
    const targetAmount = Math.max(1, Number(dream.target_amount ?? 0));
    const remainingAmount = Math.max(0, targetAmount - currentAmount);
    const progressPercent = Math.min(100, Math.round((currentAmount / targetAmount) * 100));

    return {
      id: dream.id,
      title: dream.title,
      emoji: dream.emoji || "🎯",
      category: dream.category || "Impian",
      targetAmount,
      currentAmount,
      remainingAmount,
      progressPercent,
      targetDate: dream.target_date,
      priority: dream.priority,
      linkedWalletId: linkedWallet?.id ?? null,
      linkedWalletName: linkedWallet?.name ?? "Tabungan Utama",
      isPrimarySavingsSource: Boolean(
        !dream.linked_wallet_id ||
        (primarySavingsWallet && linkedWallet?.id === primarySavingsWallet.id)
      ),
    };
  });
}

function normalizeWalletSummary(raw: unknown): TransactionWalletSummary | null {
  const entry = Array.isArray(raw) ? raw[0] : raw;
  if (!entry || typeof entry !== "object") {
    return null;
  }

  const wallet = entry as Partial<TransactionWalletSummary>;
  if (!wallet.id || !wallet.name) {
    return null;
  }

  return {
    id: wallet.id,
    name: wallet.name,
    wallet_type: wallet.wallet_type ?? "cash",
    color: wallet.color ?? "#FFE14D",
    icon: wallet.icon ?? "wallet",
  };
}

/**
 * Mengambil seluruh data real-time Halaman Beranda untuk user Clerk aktif:
 * - Auto-seed dompet `Tabungan Utama` jika user belum memiliki dompet sama sekali
 * - Total Saldo Bersih & daftar dompet aktif
 * - Metrik arus kas bulan berjalan (Asia/Jakarta) + 6 transaksi terbaru beserta nama dompet
 * - 3 target Impian aktif teratas dengan progres dana terhubung real-time
 * - Insight Poko AI dari `profiles.ai_insight_cache` (fallback deterministik)
 */
export async function getHomeDashboardData(userId: string): Promise<HomeDashboardData> {
  if (!userId || !isSupabaseConfigured()) {
    return buildFallbackDashboardData(
      "Supabase belum terkonfigurasi. Menampilkan tampilan Beranda dalam mode aman."
    );
  }

  try {
    const supabase = await createServerSupabaseClient();
    const monthRange = getJakartaCurrentMonthRange();

    // Pastikan row profil tersedia terlebih dahulu agar FK & query profiles konsisten
    await getOrCreateProfile({ userId });

    // 1. Ambil dompet aktif; jika kosong, pastikan starter wallets Poko sudah dibuat
    const { data: initialWallets, error: walletsError } = await supabase
      .from("wallets")
      .select("*")
      .eq("user_id", userId)
      .eq("is_archived", false)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (walletsError) {
      console.error("[poko/home] Failed to fetch wallets:", walletsError.message);
      return buildFallbackDashboardData(
        "Gagal memuat data dompet dari Supabase. Coba muat ulang halaman."
      );
    }

    let activeWallets: Wallet[] = initialWallets ?? [];

    if (activeWallets.length === 0) {
      const starterResult = await ensureStarterWallets();
      if (starterResult.ok) {
        activeWallets = starterResult.data;
      } else {
        console.warn("[poko/home] ensureStarterWallets fallback:", starterResult.error);
      }
    }

    // 2. Jalankan query bulan berjalan, 6 transaksi terbaru, 3 impian aktif, dan profil secara paralel
    const [monthTxResult, recentTxResult, dreamsResult, profileResult] = await Promise.all([
      supabase
        .from("transactions")
        .select("type, amount, category")
        .eq("user_id", userId)
        .gte("occurred_at", monthRange.startIso)
        .lt("occurred_at", monthRange.endExclusiveIso),
      supabase
        .from("transactions")
        .select(
          `
          *,
          wallet:wallets!transactions_wallet_id_fkey(id, name, wallet_type, color, icon),
          destination_wallet:wallets!transactions_destination_wallet_id_fkey(id, name, wallet_type, color, icon)
        `
        )
        .eq("user_id", userId)
        .order("occurred_at", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(6),
      supabase
        .from("dreams")
        .select("*")
        .eq("user_id", userId)
        .eq("status", "active")
        .order("priority", { ascending: true })
        .order("created_at", { ascending: true })
        .limit(3),
      supabase
        .from("profiles")
        .select("monthly_budget_limit, ai_insight_cache, ai_insight_updated_at")
        .eq("id", userId)
        .maybeSingle(),
    ]);

    if (monthTxResult.error) {
      console.warn("[poko/home] Monthly transactions query warning:", monthTxResult.error.message);
    }
    if (recentTxResult.error) {
      console.warn("[poko/home] Recent transactions query warning:", recentTxResult.error.message);
    }
    if (dreamsResult.error) {
      console.warn("[poko/home] Active dreams query warning:", dreamsResult.error.message);
    }
    if (profileResult.error) {
      console.warn("[poko/home] Profile cache query warning:", profileResult.error.message);
    }

    // 3. Hitung metrik saldo & arus kas bulan berjalan
    const totalBalance = activeWallets.reduce(
      (sum, wallet) => sum + Number(wallet.balance ?? 0),
      0
    );
    const primarySavingsWallet = resolvePrimarySavingsWallet(activeWallets);
    const primarySavingsBalance = Number(primarySavingsWallet?.balance ?? 0);

    const monthRows = monthTxResult.data ?? [];
    let monthlyIncome = 0;
    let monthlyExpense = 0;
    const expenseByCategory = new Map<string, number>();

    for (const row of monthRows) {
      const amount = Number(row.amount ?? 0);
      if (row.type === "income") {
        monthlyIncome += amount;
      } else if (row.type === "expense") {
        monthlyExpense += amount;
        const catKey = row.category || "Lainnya";
        expenseByCategory.set(catKey, (expenseByCategory.get(catKey) ?? 0) + amount);
      }
    }

    const netCashflow = monthlyIncome - monthlyExpense;
    const savingsRate = monthlyIncome > 0 ? Math.round((netCashflow / monthlyIncome) * 100) : null;

    const monthlyBudgetLimit =
      Number(profileResult.data?.monthly_budget_limit ?? 0) > 0
        ? Number(profileResult.data?.monthly_budget_limit)
        : DEFAULT_MONTHLY_BUDGET_LIMIT;

    const metrics: HomeDashboardMetrics = {
      totalBalance,
      monthlyIncome,
      monthlyExpense,
      netCashflow,
      savingsRate,
      primarySavingsBalance,
      monthlyBudgetLimit,
      monthLabel: monthRange.monthLabel,
      monthlyTransactionCount: monthRows.length,
    };

    // 4. Normalisasi 6 transaksi terbaru lengkap dengan dompet asal & tujuan
    const recentTransactions: TransactionWithWallets[] = (recentTxResult.data ?? []).map((row) => ({
      ...row,
      wallet: normalizeWalletSummary(row.wallet),
      destination_wallet: normalizeWalletSummary(row.destination_wallet),
    }));

    // 5. Hitung progres Impian aktif secara real-time dari saldo dompet terhubung / Tabungan Utama
    const activeDreams = mapDreamsWithLiveBalance(
      dreamsResult.data ?? [],
      activeWallets,
      primarySavingsWallet
    );

    // 6. Tentukan kategori pengeluaran terbesar untuk insight deterministik
    let topExpenseCategory: { category: string; sharePercent: number } | null = null;
    if (monthlyExpense > 0 && expenseByCategory.size > 0) {
      const sorted = Array.from(expenseByCategory.entries()).sort((a, b) => b[1] - a[1]);
      const [category, amount] = sorted[0];
      topExpenseCategory = {
        category,
        sharePercent: Math.round((amount / monthlyExpense) * 100),
      };
    }

    // 7. Gunakan `profiles.ai_insight_cache` bila tersedia, fallback ke insight deterministik cerdas
    const cachedInsights = parseAiInsightCache(profileResult.data?.ai_insight_cache);
    const aiInsights =
      cachedInsights.length > 0
        ? cachedInsights
        : buildDeterministicInsights({
            metrics,
            walletsCount: activeWallets.length,
            topExpenseCategory,
            topDream: activeDreams[0] ?? null,
          });

    return {
      dataSource: "supabase",
      warningMessage: null,
      wallets: activeWallets,
      metrics,
      recentTransactions,
      activeDreams,
      aiInsights,
      aiInsightUpdatedAt: profileResult.data?.ai_insight_updated_at ?? null,
    };
  } catch (error) {
    console.error(
      "[poko/home] Unexpected error loading home dashboard data:",
      error instanceof Error ? error.message : String(error)
    );
    return buildFallbackDashboardData(
      "Terjadi kendala saat menghubungkan ke Supabase. Menampilkan tampilan Beranda dalam mode aman."
    );
  }
}
