export type Database = {
  public: {
    Tables: {
      restaurants: {
        Row: {
          id: string
          name: string
          address: string | null
          lat: number | null
          lng: number | null
          phone: string | null
          avg_spice_level: number | null
          is_sponsored: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          address?: string | null
          lat?: number | null
          lng?: number | null
          phone?: string | null
          avg_spice_level?: number | null
          is_sponsored?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string | null
          lat?: number | null
          lng?: number | null
          phone?: string | null
          avg_spice_level?: number | null
          is_sponsored?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      menus: {
        Row: {
          id: string
          restaurant_id: string
          name: string
          spice_level: number | null
          price: number | null
          description: string | null
          image_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          restaurant_id: string
          name: string
          spice_level?: number | null
          price?: number | null
          description?: string | null
          image_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          restaurant_id?: string
          name?: string
          spice_level?: number | null
          price?: number | null
          description?: string | null
          image_url?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'menus_restaurant_id_fkey'
            columns: ['restaurant_id']
            isOneToMany: false
            referencedRelation: 'restaurants'
            referencedColumns: ['id']
          }
        ]
      }
      reviews: {
        Row: {
          id: string
          restaurant_id: string
          menu_id: string | null
          user_id: string
          spice_level: number
          comment: string | null
          helpful_count: number
          created_at: string
        }
        Insert: {
          id?: string
          restaurant_id: string
          menu_id?: string | null
          user_id: string
          spice_level: number
          comment?: string | null
          helpful_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          restaurant_id?: string
          menu_id?: string | null
          user_id?: string
          spice_level?: number
          comment?: string | null
          helpful_count?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'reviews_restaurant_id_fkey'
            columns: ['restaurant_id']
            isOneToMany: false
            referencedRelation: 'restaurants'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'reviews_menu_id_fkey'
            columns: ['menu_id']
            isOneToMany: false
            referencedRelation: 'menus'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'reviews_user_id_fkey'
            columns: ['user_id']
            isOneToMany: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      user_profiles: {
        Row: {
          id: string
          nickname: string | null
          spice_tolerance: number | null
          review_count: number
          created_at: string
        }
        Insert: {
          id: string
          nickname?: string | null
          spice_tolerance?: number | null
          review_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          nickname?: string | null
          spice_tolerance?: number | null
          review_count?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'user_profiles_id_fkey'
            columns: ['id']
            isOneToMany: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
    CompositeTypes: {}
  }
}
