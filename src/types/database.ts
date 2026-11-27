import type {
  CompositeTypes,
  Database,
  Enums,
  Json,
  Tables,
  TablesInsert,
  TablesUpdate,
} from "@/types/database.types";

export { Constants } from "@/types/database.types";
export type { CompositeTypes, Database, Enums, Json, Tables, TablesInsert, TablesUpdate };

export type PublicTableName = keyof Database["public"]["Tables"];

export type Profile = Tables<"profiles">;
export type ProfileInsert = TablesInsert<"profiles">;
export type ProfileUpdate = TablesUpdate<"profiles">;

export type Wallet = Tables<"wallets">;
export type WalletInsert = TablesInsert<"wallets">;
export type WalletUpdate = TablesUpdate<"wallets">;

export type Transaction = Tables<"transactions">;
export type TransactionInsert = TablesInsert<"transactions">;
export type TransactionUpdate = TablesUpdate<"transactions">;

export type Dream = Tables<"dreams">;
export type DreamInsert = TablesInsert<"dreams">;
export type DreamUpdate = TablesUpdate<"dreams">;

export type Challenge = Tables<"challenges">;
export type ChallengeInsert = TablesInsert<"challenges">;
export type ChallengeUpdate = TablesUpdate<"challenges">;

export type MonthlyBudgetLog = Tables<"monthly_budget_logs">;
export type MonthlyBudgetLogInsert = TablesInsert<"monthly_budget_logs">;
export type MonthlyBudgetLogUpdate = TablesUpdate<"monthly_budget_logs">;
