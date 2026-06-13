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

export interface Package {
  id: number;
  provider_id: number;
  name: string;
  description: string;
  price: string;
  service_ids: number[];
  created_at: string;
}

export interface PackageList {
  items: Package[];
  total: number;
}

export interface ProviderDashboard {
  total_venues: number;
  total_services: number;
  total_bookings: number;
  bookings_by_status: Record<BookingStatus, number>;
  confirmed_revenue: string;
  upcoming_events: number;
  rating: number | null;
  review_count: number;
}

export interface ProviderPublic {
  id: number;
  user_id: number;
  business_name: string;
  category: ProviderCategory;
  description: string;
  phone: string;
  created_at: string;
  rating: number | null;
  review_count: number;
  venues: Venue[];
  services: Service[];
  packages: Package[];
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

export interface Review {
  id: number;
  user_id: number;
  author_name: string;
  venue_id: number | null;
  service_id: number | null;
  rating: number;
  comment: string;
  created_at: string;
}

export interface ReviewList {
  items: Review[];
  total: number;
  average: number | null;
}

export interface FavoriteList {
  venues: Venue[];
  services: Service[];
}

export interface FavoriteIds {
  venue_ids: number[];
  service_ids: number[];
}

export interface Notification {
  id: number;
  type: string;
  title: string;
  body: string;
  link: string;
  read: boolean;
  created_at: string;
}

export interface NotificationList {
  items: Notification[];
  unread_count: number;
}

export interface Message {
  id: number;
  sender_id: number;
  recipient_id: number;
  body: string;
  read: boolean;
  created_at: string;
}

export interface ConversationSummary {
  partner_id: number;
  partner_name: string;
  last_body: string;
  last_at: string;
  unread_count: number;
}

export interface ConversationList {
  items: ConversationSummary[];
}

export interface Thread {
  partner_id: number;
  partner_name: string;
  messages: Message[];
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
