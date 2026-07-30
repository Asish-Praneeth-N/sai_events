export type UserRole = "customer" | "vendor" | "admin" | "operational_manager";

export type PricingUnit = "per_plate" | "per_piece" | "fixed";
export type FoodCategory = "veg" | "non_veg" | "beverage" | "dessert" | "general";
export type MealType = "breakfast" | "lunch" | "dinner" | "high_tea" | "general";

export type VendorAvailabilityStatus = "Available" | "Not Available" | "Busy" | "Leave" | "In Work";
export type ServiceStatusColor = "not_sent" | "sent_waiting" | "vendor_responded" | "vendor_finalized";

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone_number: string;
  role: UserRole;
  business_name?: string | null;
  address?: string | null;
  status?: string | null;
  availability_status?: VendorAvailabilityStatus | string | null;
  max_daily_capacity?: number | null;
  service_radius_km?: number | null;
  primary_city?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  years_of_experience?: number | null;
  instagram_url?: string | null;
  website_url?: string | null;
  facebook_url?: string | null;
  bank_name?: string | null;
  account_number?: string | null;
  ifsc_code?: string | null;
  account_name?: string | null;
  bank_verified?: boolean | null;
  vendor_documents?: Record<string, { url: string; status: "Pending" | "Approved" | "Rejected"; notes?: string }> | null;
  godown_photos?: string[] | null;
  vehicle_assets?: Array<{ type: string; url: string; name: string }> | null;
  additional_notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface MainCategory {
  id: string;
  name: string;
  description?: string | null;
  image_url?: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  main_category_id?: string | null;
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
  main_category?: MainCategory;
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
  pricing_unit?: PricingUnit;
  food_category?: FoodCategory;
  meal_type?: MealType;
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

export interface EventPart {
  id: string;
  event_type: string;
  name: string;
  description?: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Recommendation {
  id: string;
  event_type: string;
  service_item_id: string;
  badge_label: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  service_item?: ServiceItem;
}

export interface EventRequest {
  id: string;
  customer_id: string;
  event_type: string;
  event_date: string;
  location: string;
  guest_count: number;
  status: string;
  total_budget: number;
  whatsapp_number?: string | null;
  event_for?: string | null;
  event_time?: string | null;
  duration_hours?: number | null;
  venue_address?: string | null;
  venue_lat?: number | null;
  venue_lng?: number | null;
  cancellation_reason?: string | null;
  reference_number?: string | null;
  target_budget?: number | null;
  special_requirements?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface VendorPersonalSchedule {
  id: string;
  vendor_id: string;
  title: string;
  entry_type: "Leave" | "Personal Function" | "Equipment Maintenance" | "Office Work" | "Family Function";
  start_date: string;
  end_date: string;
  start_time?: string | null;
  end_time?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface VendorQuotationItem {
  id: string;
  quotation_id: string;
  service_item_id: string;
  item_price: number;
  quantity: number;
  subtotal: number;
  created_at: string;
  service_item?: ServiceItem;
}

export interface VendorQuotation {
  id: string;
  request_id: string;
  vendor_id: string;
  grand_total: number;
  is_confirmed: boolean;
  confirmed_at?: string | null;
  notes?: string | null;
  status: "Draft" | "Submitted" | "Approved" | "Rejected";
  created_at: string;
  updated_at: string;
  items?: VendorQuotationItem[];
  event_request?: EventRequest;
  vendor_profile?: Profile;
}

export interface VendorFinancialRecord {
  id: string;
  request_id: string;
  vendor_id: string;
  total_agreed_amount: number;
  advance_paid: number;
  remaining_balance: number;
  payment_status: "Paid" | "Partial" | "Pending";
  paid_date?: string | null;
  invoice_number?: string | null;
  invoice_url?: string | null;
  created_at: string;
  updated_at: string;
  event_request?: EventRequest;
  payments?: VendorPayment[];
}

export interface VendorPayment {
  id: string;
  financial_id: string;
  vendor_id: string;
  amount_paid: number;
  payment_method: string;
  reference_number?: string | null;
  payment_date: string;
  notes?: string | null;
  created_at: string;
}
