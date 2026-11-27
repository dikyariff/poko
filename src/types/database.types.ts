export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "17.1";
  };
  public: {
    Tables: {
      challenges: {
        Row: {
          code: string;
          completed_at: string | null;
          created_at: string;
          current_progress: number;
          description: string;
          id: string;
          period_key: string;
          status: string;
          target_progress: number;
          title: string;
          updated_at: string;
          user_id: string;
          xp_reward: number;
        };
        Insert: {
          code: string;
          completed_at?: string | null;
          created_at?: string;
          current_progress?: number;
          description?: string;
          id?: string;
          period_key: string;
          status?: string;
          target_progress?: number;
          title: string;
          updated_at?: string;
          user_id?: string;
          xp_reward?: number;
        };
        Update: {
          code?: string;
          completed_at?: string | null;
          created_at?: string;
          current_progress?: number;
          description?: string;
          id?: string;
          period_key?: string;
          status?: string;
          target_progress?: number;
          title?: string;
          updated_at?: string;
          user_id?: string;
          xp_reward?: number;
        };
        Relationships: [
          {
            foreignKeyName: "challenges_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      dreams: {
        Row: {
          achieved_at: string | null;
          category: string;
          created_at: string;
          emoji: string;
          id: string;
          linked_wallet_id: string | null;
          memoire_caption: string | null;
          memoire_photo_path: string | null;
          priority: number;
          status: string;
          target_amount: number;
          target_date: string | null;
          title: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          achieved_at?: string | null;
          category?: string;
          created_at?: string;
          emoji?: string;
          id?: string;
          linked_wallet_id?: string | null;
          memoire_caption?: string | null;
          memoire_photo_path?: string | null;
          priority?: number;
          status?: string;
          target_amount: number;
          target_date?: string | null;
          title: string;
          updated_at?: string;
          user_id?: string;
        };
        Update: {
          achieved_at?: string | null;
          category?: string;
          created_at?: string;
          emoji?: string;
          id?: string;
          linked_wallet_id?: string | null;
          memoire_caption?: string | null;
          memoire_photo_path?: string | null;
          priority?: number;
          status?: string;
          target_amount?: number;
          target_date?: string | null;
          title?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "dreams_linked_wallet_id_fkey";
            columns: ["linked_wallet_id"];
            isOneToOne: false;
            referencedRelation: "wallets";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "dreams_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      monthly_budget_logs: {
        Row: {
          budget_limit: number;
          created_at: string;
          id: string;
          is_safe: boolean | null;
          month_key: string;
          total_expense: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          budget_limit: number;
          created_at?: string;
          id?: string;
          is_safe?: boolean | null;
          month_key: string;
          total_expense?: number;
          updated_at?: string;
          user_id?: string;
        };
        Update: {
          budget_limit?: number;
          created_at?: string;
          id?: string;
          is_safe?: boolean | null;
          month_key?: string;
          total_expense?: number;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "monthly_budget_logs_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          ai_insight_cache: Json | null;
          ai_insight_updated_at: string | null;
          blobatar_frame: string;
          blobatar_mood: string;
          blobatar_seed: string;
          created_at: string;
          display_name: string;
          handle: string;
          id: string;
          level: number;
          monthly_budget_limit: number;
          privacy_mode: boolean;
          sfx_enabled: boolean;
          updated_at: string;
          xp: number;
        };
        Insert: {
          ai_insight_cache?: Json | null;
          ai_insight_updated_at?: string | null;
          blobatar_frame?: string;
          blobatar_mood?: string;
          blobatar_seed?: string;
          created_at?: string;
          display_name?: string;
          handle?: string;
          id?: string;
          level?: number;
          monthly_budget_limit?: number;
          privacy_mode?: boolean;
          sfx_enabled?: boolean;
          updated_at?: string;
          xp?: number;
        };
        Update: {
          ai_insight_cache?: Json | null;
          ai_insight_updated_at?: string | null;
          blobatar_frame?: string;
          blobatar_mood?: string;
          blobatar_seed?: string;
          created_at?: string;
          display_name?: string;
          handle?: string;
          id?: string;
          level?: number;
          monthly_budget_limit?: number;
          privacy_mode?: boolean;
          sfx_enabled?: boolean;
          updated_at?: string;
          xp?: number;
        };
        Relationships: [];
      };
      transactions: {
        Row: {
          amount: number;
          category: string;
          created_at: string;
          destination_wallet_id: string | null;
          id: string;
          merchant: string | null;
          metadata: Json;
          note: string;
          occurred_at: string;
          source: string;
          type: string;
          updated_at: string;
          user_id: string;
          wallet_id: string;
        };
        Insert: {
          amount: number;
          category?: string;
          created_at?: string;
          destination_wallet_id?: string | null;
          id?: string;
          merchant?: string | null;
          metadata?: Json;
          note?: string;
          occurred_at?: string;
          source?: string;
          type: string;
          updated_at?: string;
          user_id?: string;
          wallet_id: string;
        };
        Update: {
          amount?: number;
          category?: string;
          created_at?: string;
          destination_wallet_id?: string | null;
          id?: string;
          merchant?: string | null;
          metadata?: Json;
          note?: string;
          occurred_at?: string;
          source?: string;
          type?: string;
          updated_at?: string;
          user_id?: string;
          wallet_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "transactions_destination_wallet_id_fkey";
            columns: ["destination_wallet_id"];
            isOneToOne: false;
            referencedRelation: "wallets";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "transactions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "transactions_wallet_id_fkey";
            columns: ["wallet_id"];
            isOneToOne: false;
            referencedRelation: "wallets";
            referencedColumns: ["id"];
          },
        ];
      };
      wallets: {
        Row: {
          balance: number;
          color: string;
          created_at: string;
          icon: string;
          id: string;
          is_archived: boolean;
          is_primary_savings: boolean;
          name: string;
          sort_order: number;
          updated_at: string;
          user_id: string;
          wallet_type: string;
        };
        Insert: {
          balance?: number;
          color?: string;
          created_at?: string;
          icon?: string;
          id?: string;
          is_archived?: boolean;
          is_primary_savings?: boolean;
          name: string;
          sort_order?: number;
          updated_at?: string;
          user_id?: string;
          wallet_type?: string;
        };
        Update: {
          balance?: number;
          color?: string;
          created_at?: string;
          icon?: string;
          id?: string;
          is_archived?: boolean;
          is_primary_savings?: boolean;
          name?: string;
          sort_order?: number;
          updated_at?: string;
          user_id?: string;
          wallet_type?: string;
        };
        Relationships: [
          {
            foreignKeyName: "wallets_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      whoami_clerk_sub: { Args: never; Returns: Json };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
