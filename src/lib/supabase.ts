import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types will be generated from Supabase schema
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
      };
      architectures: {
        Row: {
          id: string;
          name: string;
          description: string;
          data: any;
          created_by: string;
          created_at: string;
          updated_at: string;
          version: number;
          is_public: boolean;
          public_link: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          data: any;
          created_by: string;
          created_at?: string;
          updated_at?: string;
          version?: number;
          is_public?: boolean;
          public_link?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          data?: any;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
          version?: number;
          is_public?: boolean;
          public_link?: string | null;
        };
      };
      architecture_collaborators: {
        Row: {
          id: string;
          architecture_id: string;
          user_id: string;
          role: string;
          added_at: string;
        };
        Insert: {
          id?: string;
          architecture_id: string;
          user_id: string;
          role: string;
          added_at?: string;
        };
        Update: {
          id?: string;
          architecture_id?: string;
          user_id?: string;
          role?: string;
          added_at?: string;
        };
      };
      architecture_snapshots: {
        Row: {
          id: string;
          architecture_id: string;
          name: string;
          description: string;
          data: any;
          created_at: string;
          created_by: string;
        };
        Insert: {
          id?: string;
          architecture_id: string;
          name: string;
          description: string;
          data: any;
          created_at?: string;
          created_by: string;
        };
        Update: {
          id?: string;
          architecture_id?: string;
          name?: string;
          description?: string;
          data?: any;
          created_at?: string;
          created_by?: string;
        };
      };
      comments: {
        Row: {
          id: string;
          architecture_id: string;
          component_id: string | null;
          connection_id: string | null;
          content: string;
          author: string;
          author_email: string;
          created_at: string;
          resolved: boolean;
          position: any | null;
        };
        Insert: {
          id?: string;
          architecture_id: string;
          component_id?: string | null;
          connection_id?: string | null;
          content: string;
          author: string;
          author_email: string;
          created_at?: string;
          resolved?: boolean;
          position?: any | null;
        };
        Update: {
          id?: string;
          architecture_id?: string;
          component_id?: string | null;
          connection_id?: string | null;
          content?: string;
          author?: string;
          author_email?: string;
          created_at?: string;
          resolved?: boolean;
          position?: any | null;
        };
      };
      change_log: {
        Row: {
          id: string;
          architecture_id: string;
          user_id: string;
          user_email: string;
          action: string;
          changes: any;
          timestamp: string;
        };
        Insert: {
          id?: string;
          architecture_id: string;
          user_id: string;
          user_email: string;
          action: string;
          changes: any;
          timestamp?: string;
        };
        Update: {
          id?: string;
          architecture_id?: string;
          user_id?: string;
          user_email?: string;
          action?: string;
          changes?: any;
          timestamp?: string;
        };
      };
    };
  };
}
