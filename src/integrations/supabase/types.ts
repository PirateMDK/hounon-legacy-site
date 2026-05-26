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
      events: {
        Row: {
          cover_image_url: string | null
          created_at: string
          description: string | null
          event_date: string
          event_time: string | null
          id: string
          location: string | null
          status: string
          title: string
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          event_date: string
          event_time?: string | null
          id?: string
          location?: string | null
          status?: string
          title: string
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          event_date?: string
          event_time?: string | null
          id?: string
          location?: string | null
          status?: string
          title?: string
        }
        Relationships: []
      }
      formation_inscriptions: {
        Row: {
          country: string
          created_at: string
          email: string
          formation_id: string | null
          formation_title: string | null
          full_name: string
          id: string
          message: string | null
          phone: string
          status: string
        }
        Insert: {
          country: string
          created_at?: string
          email: string
          formation_id?: string | null
          formation_title?: string | null
          full_name: string
          id?: string
          message?: string | null
          phone: string
          status?: string
        }
        Update: {
          country?: string
          created_at?: string
          email?: string
          formation_id?: string | null
          formation_title?: string | null
          full_name?: string
          id?: string
          message?: string | null
          phone?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "formation_inscriptions_formation_id_fkey"
            columns: ["formation_id"]
            isOneToOne: false
            referencedRelation: "formations"
            referencedColumns: ["id"]
          },
        ]
      }
      formations: {
        Row: {
          created_at: string
          description: string
          duration: string | null
          icon: string | null
          id: string
          price: string | null
          sort_order: number
          title: string
          visible: boolean
        }
        Insert: {
          created_at?: string
          description: string
          duration?: string | null
          icon?: string | null
          id?: string
          price?: string | null
          sort_order?: number
          title: string
          visible?: boolean
        }
        Update: {
          created_at?: string
          description?: string
          duration?: string | null
          icon?: string | null
          id?: string
          price?: string | null
          sort_order?: number
          title?: string
          visible?: boolean
        }
        Relationships: []
      }
      graduates: {
        Row: {
          bio: string | null
          contact: string | null
          created_at: string
          full_name: string
          id: string
          location: string | null
          photo_url: string | null
          sort_order: number
          specialty: string | null
          user_id: string | null
          visible: boolean
        }
        Insert: {
          bio?: string | null
          contact?: string | null
          created_at?: string
          full_name: string
          id?: string
          location?: string | null
          photo_url?: string | null
          sort_order?: number
          specialty?: string | null
          user_id?: string | null
          visible?: boolean
        }
        Update: {
          bio?: string | null
          contact?: string | null
          created_at?: string
          full_name?: string
          id?: string
          location?: string | null
          photo_url?: string | null
          sort_order?: number
          specialty?: string | null
          user_id?: string | null
          visible?: boolean
        }
        Relationships: []
      }
      media_photos: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string
          photo_date: string | null
          sort_order: number
          title: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url: string
          photo_date?: string | null
          sort_order?: number
          title?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string
          photo_date?: string | null
          sort_order?: number
          title?: string | null
        }
        Relationships: []
      }
      media_videos: {
        Row: {
          created_at: string
          description: string | null
          id: string
          sort_order: number
          thumbnail_url: string | null
          title: string
          video_date: string | null
          youtube_url: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          sort_order?: number
          thumbnail_url?: string | null
          title: string
          video_date?: string | null
          youtube_url: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          sort_order?: number
          thumbnail_url?: string | null
          title?: string
          video_date?: string | null
          youtube_url?: string
        }
        Relationships: []
      }
      message_followups: {
        Row: {
          created_at: string
          created_by: string | null
          done: boolean
          id: string
          message_id: string
          note: string | null
          remind_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          done?: boolean
          id?: string
          message_id: string
          note?: string | null
          remind_at: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          done?: boolean
          id?: string
          message_id?: string
          note?: string | null
          remind_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_followups_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      message_replies: {
        Row: {
          body: string
          channel: string
          created_at: string
          id: string
          message_id: string
          sent_by: string | null
        }
        Insert: {
          body: string
          channel: string
          created_at?: string
          id?: string
          message_id: string
          sent_by?: string | null
        }
        Update: {
          body?: string
          channel?: string
          created_at?: string
          id?: string
          message_id?: string
          sent_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "message_replies_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          country: string
          created_at: string
          email: string
          full_name: string
          id: string
          message: string
          phone: string
          preferred_date: string | null
          service: string | null
          status: string
        }
        Insert: {
          country: string
          created_at?: string
          email: string
          full_name: string
          id?: string
          message: string
          phone: string
          preferred_date?: string | null
          service?: string | null
          status?: string
        }
        Update: {
          country?: string
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          message?: string
          phone?: string
          preferred_date?: string | null
          service?: string | null
          status?: string
        }
        Relationships: []
      }
      navigation_items: {
        Row: {
          created_at: string
          id: string
          is_core: boolean
          is_visible: boolean
          label: string
          open_new_tab: boolean
          order_position: number
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_core?: boolean
          is_visible?: boolean
          label: string
          open_new_tab?: boolean
          order_position?: number
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          is_core?: boolean
          is_visible?: boolean
          label?: string
          open_new_tab?: boolean
          order_position?: number
          url?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          created_at: string
          description: string
          icon: string | null
          id: string
          sort_order: number
          title: string
          visible: boolean
        }
        Insert: {
          created_at?: string
          description: string
          icon?: string | null
          id?: string
          sort_order?: number
          title: string
          visible?: boolean
        }
        Update: {
          created_at?: string
          description?: string
          icon?: string | null
          id?: string
          sort_order?: number
          title?: string
          visible?: boolean
        }
        Relationships: []
      }
      site_content: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          country: string
          created_at: string
          first_name: string
          id: string
          rating: number
          service: string | null
          status: string
          text: string
        }
        Insert: {
          country: string
          created_at?: string
          first_name: string
          id?: string
          rating?: number
          service?: string | null
          status?: string
          text: string
        }
        Update: {
          country?: string
          created_at?: string
          first_name?: string
          id?: string
          rating?: number
          service?: string | null
          status?: string
          text?: string
        }
        Relationships: []
      }
      timeline_milestones: {
        Row: {
          created_at: string
          description: string
          id: string
          sort_order: number
          year: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          sort_order?: number
          year: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          sort_order?: number
          year?: string
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
      vodouns: {
        Row: {
          accent_color: string | null
          created_at: string
          description: string
          id: string
          name: string
          photo_url: string | null
          sort_order: number
          subtitle: string | null
          symbol: string | null
          visible: boolean
        }
        Insert: {
          accent_color?: string | null
          created_at?: string
          description: string
          id?: string
          name: string
          photo_url?: string | null
          sort_order?: number
          subtitle?: string | null
          symbol?: string | null
          visible?: boolean
        }
        Update: {
          accent_color?: string | null
          created_at?: string
          description?: string
          id?: string
          name?: string
          photo_url?: string | null
          sort_order?: number
          subtitle?: string | null
          symbol?: string | null
          visible?: boolean
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "super_admin" | "editor" | "graduate" | "admin" | "sub_admin"
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
      app_role: ["super_admin", "editor", "graduate", "admin", "sub_admin"],
    },
  },
} as const
