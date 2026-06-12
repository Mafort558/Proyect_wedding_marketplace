export type UserRole = "client" | "provider";

export type BookingStatus = "pending" | "deposit_paid" | "confirmed" | "cancelled";

export type ProviderCategory = "venue" | "catering" | "photography" | "music" | "decoration";

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  created_at: string;
}

export interface Venue {
  id: number;
  provider_id: number;
  name: string;
  description: string;
  capacity: number;
  city: string;
  address: string;
  price: string;
  deposit_amount: string;
  photos: string[];
  created_at: string;
}

export interface VenueList {
  items: Venue[];
  total: number;
}

export interface VenueAvailability {
  venue_id: number;
  booked_dates: string[];
}

export interface Booking {
  id: number;
  user_id: number;
  venue_id: number | null;
  service_id: number | null;
  event_date: string;
  status: BookingStatus;
  total_price: string;
  created_at: string;
}

export interface Provider {
  id: number;
  user_id: number;
  business_name: string;
  category: ProviderCategory;
  description: string;
  phone: string;
  created_at: string;
}

export interface Service {
  id: number;
  provider_id: number;
  name: string;
  category: ProviderCategory;
  description: string;
  price: string;
  photos: string[];
  created_at: string;
}

export interface ServiceList {
  items: Service[];
  total: number;
}

export interface CheckoutResponse {
  payment_id: number;
  booking_id: number;
  preference_id: string;
  init_point: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}
