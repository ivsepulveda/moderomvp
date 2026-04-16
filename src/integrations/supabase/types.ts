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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      agency_agents: {
        Row: {
          agency_id: string
          created_at: string
          email: string
          id: string
          is_active: boolean
          name: string
          permissions: Json
          phone: string | null
          updated_at: string
        }
        Insert: {
          agency_id: string
          created_at?: string
          email: string
          id?: string
          is_active?: boolean
          name: string
          permissions?: Json
          phone?: string | null
          updated_at?: string
        }
        Update: {
          agency_id?: string
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean
          name?: string
          permissions?: Json
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      applications: {
        Row: {
          active_listings: string | null
          agency_name: string
          associations: string | null
          created_at: string | null
          email: string
          flags: string[] | null
          id: string
          idealista_profile: string | null
          monthly_inquiries: string | null
          pitch: string | null
          rejection_reason: string | null
          status: string
          website: string | null
          years_operating: string | null
        }
        Insert: {
          active_listings?: string | null
          agency_name: string
          associations?: string | null
          created_at?: string | null
          email: string
          flags?: string[] | null
          id?: string
          idealista_profile?: string | null
          monthly_inquiries?: string | null
          pitch?: string | null
          rejection_reason?: string | null
          status?: string
          website?: string | null
          years_operating?: string | null
        }
        Update: {
          active_listings?: string | null
          agency_name?: string
          associations?: string | null
          created_at?: string | null
          email?: string
          flags?: string[] | null
          id?: string
          idealista_profile?: string | null
          monthly_inquiries?: string | null
          pitch?: string | null
          rejection_reason?: string | null
          status?: string
          website?: string | null
          years_operating?: string | null
        }
        Relationships: []
      }
      documents: {
        Row: {
          application_id: string
          file_name: string | null
          file_size: number | null
          file_url: string
          id: string
          tenant_id: string
          type: string
          uploaded_at: string | null
          verified: boolean | null
        }
        Insert: {
          application_id: string
          file_name?: string | null
          file_size?: number | null
          file_url: string
          id?: string
          tenant_id: string
          type: string
          uploaded_at?: string | null
          verified?: boolean | null
        }
        Update: {
          application_id?: string
          file_name?: string | null
          file_size?: number | null
          file_url?: string
          id?: string
          tenant_id?: string
          type?: string
          uploaded_at?: string | null
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "tenant_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      email_logs: {
        Row: {
          application_id: string | null
          created_at: string | null
          id: string
          recipient_email: string | null
          sendgrid_message_id: string | null
          status: string | null
          subject: string | null
          tenant_id: string | null
          type: string
        }
        Insert: {
          application_id?: string | null
          created_at?: string | null
          id?: string
          recipient_email?: string | null
          sendgrid_message_id?: string | null
          status?: string | null
          subject?: string | null
          tenant_id?: string | null
          type: string
        }
        Update: {
          application_id?: string | null
          created_at?: string | null
          id?: string
          recipient_email?: string | null
          sendgrid_message_id?: string | null
          status?: string | null
          subject?: string | null
          tenant_id?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_logs_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "tenant_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          created_at: string | null
          id: string
          idealista_listing_id: string | null
          message: string | null
          price: number | null
          processed: boolean | null
          property_title: string | null
          raw_email_data: Json | null
          raw_email_source: string | null
          tenant_email: string | null
          tenant_name: string | null
          tenant_phone: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          idealista_listing_id?: string | null
          message?: string | null
          price?: number | null
          processed?: boolean | null
          property_title?: string | null
          raw_email_data?: Json | null
          raw_email_source?: string | null
          tenant_email?: string | null
          tenant_name?: string | null
          tenant_phone?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          idealista_listing_id?: string | null
          message?: string | null
          price?: number | null
          processed?: boolean | null
          property_title?: string | null
          raw_email_data?: Json | null
          raw_email_source?: string | null
          tenant_email?: string | null
          tenant_name?: string | null
          tenant_phone?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          agency_name: string | null
          calendar_connected: boolean | null
          calendar_provider: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          notification_email: string | null
          onboarding_completed: boolean | null
        }
        Insert: {
          agency_name?: string | null
          calendar_connected?: boolean | null
          calendar_provider?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          notification_email?: string | null
          onboarding_completed?: boolean | null
        }
        Update: {
          agency_name?: string | null
          calendar_connected?: boolean | null
          calendar_provider?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          notification_email?: string | null
          onboarding_completed?: boolean | null
        }
        Relationships: []
      }
      properties: {
        Row: {
          address: string | null
          agency_id: string
          bathrooms: number | null
          bedrooms: number | null
          created_at: string | null
          currency: string | null
          id: string
          idealista_listing_id: string | null
          is_active: boolean | null
          listing_rules: Json
          rent: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          agency_id: string
          bathrooms?: number | null
          bedrooms?: number | null
          created_at?: string | null
          currency?: string | null
          id?: string
          idealista_listing_id?: string | null
          is_active?: boolean | null
          listing_rules?: Json
          rent?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          agency_id?: string
          bathrooms?: number | null
          bedrooms?: number | null
          created_at?: string | null
          currency?: string | null
          id?: string
          idealista_listing_id?: string | null
          is_active?: boolean | null
          listing_rules?: Json
          rent?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      score_logs: {
        Row: {
          application_id: string
          breakdown: Json | null
          created_at: string | null
          document_score: number | null
          employment_score: number | null
          financial_score: number | null
          fraud_flag: boolean | null
          fraud_penalty: number | null
          fraud_reasons: string[] | null
          id: string
          identity_score: number | null
          result: string | null
          score: number
        }
        Insert: {
          application_id: string
          breakdown?: Json | null
          created_at?: string | null
          document_score?: number | null
          employment_score?: number | null
          financial_score?: number | null
          fraud_flag?: boolean | null
          fraud_penalty?: number | null
          fraud_reasons?: string[] | null
          id?: string
          identity_score?: number | null
          result?: string | null
          score?: number
        }
        Update: {
          application_id?: string
          breakdown?: Json | null
          created_at?: string | null
          document_score?: number | null
          employment_score?: number | null
          financial_score?: number | null
          fraud_flag?: boolean | null
          fraud_penalty?: number | null
          fraud_reasons?: string[] | null
          id?: string
          identity_score?: number | null
          result?: string | null
          score?: number
        }
        Relationships: [
          {
            foreignKeyName: "score_logs_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "tenant_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_applications: {
        Row: {
          agency_id: string
          company: string | null
          contract_type: string | null
          created_at: string | null
          documents_complete: boolean | null
          employment_status: string | null
          fraud_flag: boolean | null
          id: string
          idealista_listing_id: string | null
          income_monthly: number | null
          job_title: string | null
          linked_lead_id: string | null
          linkedin_verified: boolean | null
          property_id: string
          rent: number | null
          salary_payment_date: number | null
          score: number | null
          score_category: string | null
          status: string
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          agency_id: string
          company?: string | null
          contract_type?: string | null
          created_at?: string | null
          documents_complete?: boolean | null
          employment_status?: string | null
          fraud_flag?: boolean | null
          id?: string
          idealista_listing_id?: string | null
          income_monthly?: number | null
          job_title?: string | null
          linked_lead_id?: string | null
          linkedin_verified?: boolean | null
          property_id: string
          rent?: number | null
          salary_payment_date?: number | null
          score?: number | null
          score_category?: string | null
          status?: string
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          agency_id?: string
          company?: string | null
          contract_type?: string | null
          created_at?: string | null
          documents_complete?: boolean | null
          employment_status?: string | null
          fraud_flag?: boolean | null
          id?: string
          idealista_listing_id?: string | null
          income_monthly?: number | null
          job_title?: string | null
          linked_lead_id?: string | null
          linkedin_verified?: boolean | null
          property_id?: string
          rent?: number | null
          salary_payment_date?: number | null
          score?: number | null
          score_category?: string | null
          status?: string
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tenant_applications_linked_lead_id_fkey"
            columns: ["linked_lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_applications_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_applications_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "public_properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_applications_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          age_range: string | null
          auth_type: string | null
          country_of_birth: string | null
          created_at: string | null
          email: string
          email_verified: boolean | null
          id: string
          linkedin_headline: string | null
          linkedin_id: string | null
          linkedin_profile: string | null
          name: string
          nationality: string | null
          phone: string | null
          phone_verified: boolean | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          age_range?: string | null
          auth_type?: string | null
          country_of_birth?: string | null
          created_at?: string | null
          email: string
          email_verified?: boolean | null
          id?: string
          linkedin_headline?: string | null
          linkedin_id?: string | null
          linkedin_profile?: string | null
          name: string
          nationality?: string | null
          phone?: string | null
          phone_verified?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          age_range?: string | null
          auth_type?: string | null
          country_of_birth?: string | null
          created_at?: string | null
          email?: string
          email_verified?: boolean | null
          id?: string
          linkedin_headline?: string | null
          linkedin_id?: string | null
          linkedin_profile?: string | null
          name?: string
          nationality?: string | null
          phone?: string | null
          phone_verified?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      viewings: {
        Row: {
          agency_id: string
          application_id: string
          created_at: string | null
          end_time: string
          external_event_id: string | null
          id: string
          notes: string | null
          property_id: string
          provider: string | null
          start_time: string
          status: string
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          agency_id: string
          application_id: string
          created_at?: string | null
          end_time: string
          external_event_id?: string | null
          id?: string
          notes?: string | null
          property_id: string
          provider?: string | null
          start_time: string
          status?: string
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          agency_id?: string
          application_id?: string
          created_at?: string | null
          end_time?: string
          external_event_id?: string | null
          id?: string
          notes?: string | null
          property_id?: string
          provider?: string | null
          start_time?: string
          status?: string
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "viewings_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "tenant_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "viewings_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "viewings_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "public_properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "viewings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      public_properties: {
        Row: {
          address: string | null
          agency_id: string | null
          bathrooms: number | null
          bedrooms: number | null
          created_at: string | null
          currency: string | null
          id: string | null
          idealista_listing_id: string | null
          is_active: boolean | null
          rent: number | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          agency_id?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          created_at?: string | null
          currency?: string | null
          id?: string | null
          idealista_listing_id?: string | null
          is_active?: boolean | null
          rent?: number | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          agency_id?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          created_at?: string | null
          currency?: string | null
          id?: string | null
          idealista_listing_id?: string | null
          is_active?: boolean | null
          rent?: number | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "agency"
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
  public: {
    Enums: {
      app_role: ["admin", "agency"],
    },
  },
} as const
