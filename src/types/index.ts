export interface Member {
  id: string
  email: string
  first_name: string
  last_name: string
  phone?: string
  truck_year?: number
  truck_make?: 'Chevy' | 'Ford' | 'Dodge'
  truck_model?: string
  truck_photo_url?: string
  profile_photo_url?: string
  bio?: string
  instagram_handle?: string
  snapchat_handle?: string
  tiktok_handle?: string
  is_admin: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface MemberMedia {
  id: string
  member_id: string
  url: string
  type: 'image' | 'video'
  caption?: string
  is_profile: boolean
  created_at: string
}

export interface InviteCode {
  id: string
  code: string
  created_by?: string
  used_by?: string
  max_uses: number
  current_uses: number
  expires_at?: string
  is_active: boolean
  created_at: string
}

export interface MembershipDues {
  id: string
  member_id: string
  amount: number
  stripe_payment_id?: string
  stripe_session_id?: string
  status: 'pending' | 'paid' | 'failed' | 'refunded'
  period_start: string
  period_end: string
  paid_at?: string
  created_at: string
  member?: Member
}

export interface Product {
  id: string
  name: string
  description?: string
  price: number
  member_price?: number
  image_url?: string
  images: string[]
  category: string
  sizes: string[]
  colors: string[]
  stock_quantity: number
  is_members_only: boolean
  is_active: boolean
  stripe_price_id?: string
  stripe_product_id?: string
  created_at: string
  updated_at: string
}

export interface CartItem {
  product: Product
  quantity: number
  size?: string
  color?: string
}

export interface Order {
  id: string
  member_id?: string
  guest_email?: string
  guest_name?: string
  stripe_session_id?: string
  stripe_payment_intent_id?: string
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
  subtotal: number
  tax: number
  shipping: number
  total: number
  shipping_address?: ShippingAddress
  tracking_number?: string
  notes?: string
  created_at: string
  updated_at: string
  items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id?: string
  product_name: string
  quantity: number
  size?: string
  color?: string
  unit_price: number
  total_price: number
  created_at: string
}

export interface ShippingAddress {
  name: string
  line1: string
  line2?: string
  city: string
  state: string
  postal_code: string
  country: string
}

export interface Event {
  id: string
  title: string
  description?: string
  location?: string
  address?: string
  event_date: string
  start_time?: string
  end_time?: string
  image_url?: string
  is_members_only: boolean
  max_attendees?: number
  is_active: boolean
  created_at: string
  updated_at: string
  rsvp_count?: number
}

export interface EventRSVP {
  id: string
  event_id: string
  member_id: string
  status: 'attending' | 'maybe' | 'not_attending'
  guests: number
  created_at: string
  member?: Member
  event?: Event
}

export interface FleetGalleryImage {
  id: string
  member_id: string
  image_url: string
  caption?: string
  is_featured: boolean
  is_approved: boolean
  created_at: string
  member?: Member
}

export interface SiteSetting {
  id: string
  key: string
  value: unknown
  updated_at: string
}
