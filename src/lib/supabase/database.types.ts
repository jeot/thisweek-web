export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      items: {
        Row: {
          calendar: string
          category: Database["public"]["Enums"]["item_category"]
          ciphertext: string
          completed_at: number | null
          created_at: number
          deleted_at: number | null
          due_type: Database["public"]["Enums"]["item_due_type"] | null
          duration: number
          id: number
          is_encrypted: boolean
          iv: string | null
          key_version: number
          meta: Json | null
          modified_at: number
          modified_by: string
          notification: Json | null
          order: Json
          parent: string | null
          pinned: boolean
          project_id: number | null
          recurrence: Json | null
          scheduled_at: number
          status: Database["public"]["Enums"]["item_status"]
          synced_at: number | null
          title: string
          type: Database["public"]["Enums"]["item_type"]
          tz_iana: string
          tz_offset: number
          user_id: string
          uuid: string
          version: number
        }
        Insert: {
          calendar: string
          category: Database["public"]["Enums"]["item_category"]
          ciphertext: string
          completed_at?: number | null
          created_at: number
          deleted_at?: number | null
          due_type?: Database["public"]["Enums"]["item_due_type"] | null
          duration: number
          id?: number
          is_encrypted?: boolean
          iv?: string | null
          key_version: number
          meta?: Json | null
          modified_at: number
          modified_by: string
          notification?: Json | null
          order?: Json
          parent?: string | null
          pinned?: boolean
          project_id?: number | null
          recurrence?: Json | null
          scheduled_at: number
          status: Database["public"]["Enums"]["item_status"]
          synced_at?: number | null
          title: string
          type: Database["public"]["Enums"]["item_type"]
          tz_iana: string
          tz_offset: number
          user_id: string
          uuid: string
          version?: number
        }
        Update: {
          calendar?: string
          category?: Database["public"]["Enums"]["item_category"]
          ciphertext?: string
          completed_at?: number | null
          created_at?: number
          deleted_at?: number | null
          due_type?: Database["public"]["Enums"]["item_due_type"] | null
          duration?: number
          id?: number
          is_encrypted?: boolean
          iv?: string | null
          key_version?: number
          meta?: Json | null
          modified_at?: number
          modified_by?: string
          notification?: Json | null
          order?: Json
          parent?: string | null
          pinned?: boolean
          project_id?: number | null
          recurrence?: Json | null
          scheduled_at?: number
          status?: Database["public"]["Enums"]["item_status"]
          synced_at?: number | null
          title?: string
          type?: Database["public"]["Enums"]["item_type"]
          tz_iana?: string
          tz_offset?: number
          user_id?: string
          uuid?: string
          version?: number
        }
        Relationships: []
      }
      test_me_table: {
        Row: {
          created_at: string
          id: number
          name: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          name?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          name?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      item_category:
        | "daily"
        | "weekly"
        | "monthly"
        | "yearly"
        | "project"
        | "personal"
        | "work"
        | "goal"
        | "life-area"
      item_due_type: "allday" | "fixed" | "range" | "floating"
      item_status:
        | "undone"
        | "done"
        | "pending"
        | "blocked"
        | "canceled"
        | "delegated"
        | "snoozed"
        | "in-progress"
      item_type: "todo" | "note" | "event" | "habit" | "journal" | "reminder"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      item_category: [
        "daily",
        "weekly",
        "monthly",
        "yearly",
        "project",
        "personal",
        "work",
        "goal",
        "life-area",
      ],
      item_due_type: ["allday", "fixed", "range", "floating"],
      item_status: [
        "undone",
        "done",
        "pending",
        "blocked",
        "canceled",
        "delegated",
        "snoozed",
        "in-progress",
      ],
      item_type: ["todo", "note", "event", "habit", "journal", "reminder"],
    },
  },
} as const
