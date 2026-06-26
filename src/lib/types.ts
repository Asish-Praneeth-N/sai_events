export type UserRole = "customer" | "vendor" | "admin";

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone_number: string;
  role: UserRole;
  business_name?: string | null;
  address?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string | null;
  image_url?: string | null;
  is_active: boolean;
  sort_order: number;
  created_by?: string | null;
  updated_by?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface Subcategory {
  id: string;
  category_id: string;
  name: string;
  description?: string | null;
  is_active: boolean;
  sort_order: number;
  created_by?: string | null;
  updated_by?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface ServiceItem {
  id: string;
  subcategory_id: string;
  name: string;
  description: string;
  price: number;
  pricing_type: "flat" | "per_plate";
  is_available: boolean;
  sort_order: number;
  created_by?: string | null;
  updated_by?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface ServiceItemMedia {
  id: string;
  service_item_id: string;
  media_url: string;
  media_type: "image" | "video";
  display_order: number;
  created_at: string;
}
