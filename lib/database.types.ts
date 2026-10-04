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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          cancelled_at: string | null
          created_at: string
          customer_name: string
          customer_phone: string
          deposit_kobo: number
          ends_at: string
          flag_reason: string | null
          flagged: boolean
          hold_expires_at: string | null
          id: string
          rescheduled_from: string | null
          service_id: string
          source: string
          staff_id: string
          starts_at: string
          status: string
          token_hash: string
          updated_at: string
        }
        Insert: {
          cancelled_at?: string | null
          created_at?: string
          customer_name: string
          customer_phone: string
          deposit_kobo: number
          ends_at: string
          flag_reason?: string | null
          flagged?: boolean
          hold_expires_at?: string | null
          id?: string
          rescheduled_from?: string | null
          service_id: string
          source?: string
          staff_id: string
          starts_at: string
          status?: string
          token_hash: string
          updated_at?: string
        }
        Update: {
          cancelled_at?: string | null
          created_at?: string
          customer_name?: string
          customer_phone?: string
          deposit_kobo?: number
          ends_at?: string
          flag_reason?: string | null
          flagged?: boolean
          hold_expires_at?: string | null
          id?: string
          rescheduled_from?: string | null
          service_id?: string
          source?: string
          staff_id?: string
          starts_at?: string
          status?: string
          token_hash?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_rescheduled_from_fkey"
            columns: ["rescheduled_from"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount_kobo: number
          booking_id: string
          created_at: string
          currency: string
          id: string
          paystack_reference: string
          raw_event: Json | null
          status: string
          updated_at: string
          verified_at: string | null
        }
        Insert: {
          amount_kobo: number
          booking_id: string
          created_at?: string
          currency?: string
          id?: string
          paystack_reference: string
          raw_event?: Json | null
          status?: string
          updated_at?: string
          verified_at?: string | null
        }
        Update: {
          amount_kobo?: number
          booking_id?: string
          created_at?: string
          currency?: string
          id?: string
          paystack_reference?: string
          raw_event?: Json | null
          status?: string
          updated_at?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      reminder_settings: {
        Row: {
          confirmation_enabled: boolean
          confirmation_offset_minutes: number
          created_at: string
          id: number
          reminder_24h_enabled: boolean
          reminder_24h_hours_before: number
          reminder_2h_enabled: boolean
          reminder_2h_hours_before: number
          updated_at: string
        }
        Insert: {
          confirmation_enabled?: boolean
          confirmation_offset_minutes?: number
          created_at?: string
          id?: number
          reminder_24h_enabled?: boolean
          reminder_24h_hours_before?: number
          reminder_2h_enabled?: boolean
          reminder_2h_hours_before?: number
          updated_at?: string
        }
        Update: {
          confirmation_enabled?: boolean
          confirmation_offset_minutes?: number
          created_at?: string
          id?: number
          reminder_24h_enabled?: boolean
          reminder_24h_hours_before?: number
          reminder_2h_enabled?: boolean
          reminder_2h_hours_before?: number
          updated_at?: string
        }
        Relationships: []
      }
      reminders: {
        Row: {
          attempts: number
          booking_id: string
          created_at: string
          id: string
          kind: string
          last_error: string | null
          provider_message_id: string | null
          scheduled_for: string
          sent_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          attempts?: number
          booking_id: string
          created_at?: string
          id?: string
          kind: string
          last_error?: string | null
          provider_message_id?: string | null
          scheduled_for: string
          sent_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          attempts?: number
          booking_id?: string
          created_at?: string
          id?: string
          kind?: string
          last_error?: string | null
          provider_message_id?: string | null
          scheduled_for?: string
          sent_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reminders_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      salon_owner: {
        Row: {
          created_at: string
          id: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      salon_settings: {
        Row: {
          address: string
          booking_window_days: number
          cancel_cutoff_hours: number
          created_at: string
          hold_minutes: number
          id: number
          min_notice_hours: number
          name: string
          slot_interval_minutes: number
          timezone: string
          updated_at: string
          whatsapp_phone: string
        }
        Insert: {
          address: string
          booking_window_days?: number
          cancel_cutoff_hours?: number
          created_at?: string
          hold_minutes?: number
          id?: number
          min_notice_hours?: number
          name: string
          slot_interval_minutes?: number
          timezone?: string
          updated_at?: string
          whatsapp_phone: string
        }
        Update: {
          address?: string
          booking_window_days?: number
          cancel_cutoff_hours?: number
          created_at?: string
          hold_minutes?: number
          id?: number
          min_notice_hours?: number
          name?: string
          slot_interval_minutes?: number
          timezone?: string
          updated_at?: string
          whatsapp_phone?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          created_at: string
          deposit_kobo: number
          description: string
          duration_minutes: number
          id: string
          is_active: boolean
          name: string
          price_kobo: number
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          deposit_kobo: number
          description?: string
          duration_minutes: number
          id?: string
          is_active?: boolean
          name: string
          price_kobo: number
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          deposit_kobo?: number
          description?: string
          duration_minutes?: number
          id?: string
          is_active?: boolean
          name?: string
          price_kobo?: number
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      staff: {
        Row: {
          bio: string
          created_at: string
          id: string
          is_active: boolean
          name: string
          photo_url: string | null
          role: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          bio?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          photo_url?: string | null
          role?: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          bio?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          photo_url?: string | null
          role?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      staff_hours: {
        Row: {
          closes_at: string
          created_at: string
          id: string
          is_closed: boolean
          opens_at: string
          staff_id: string
          updated_at: string
          weekday: number
        }
        Insert: {
          closes_at: string
          created_at?: string
          id?: string
          is_closed?: boolean
          opens_at: string
          staff_id: string
          updated_at?: string
          weekday: number
        }
        Update: {
          closes_at?: string
          created_at?: string
          id?: string
          is_closed?: boolean
          opens_at?: string
          staff_id?: string
          updated_at?: string
          weekday?: number
        }
        Relationships: [
          {
            foreignKeyName: "staff_hours_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_services: {
        Row: {
          service_id: string
          staff_id: string
        }
        Insert: {
          service_id: string
          staff_id: string
        }
        Update: {
          service_id?: string
          staff_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_services_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
