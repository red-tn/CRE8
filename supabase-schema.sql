-- CRE8 Truck Club Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Members table
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  truck_year INTEGER,
  truck_make VARCHAR(50) CHECK (truck_make IN ('Chevy', 'Ford', 'Dodge')),
  truck_model VARCHAR(100),
  truck_photo_url TEXT,
  bio TEXT,
  instagram_handle VARCHAR(100),
  is_admin BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invite codes table
CREATE TABLE invite_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) UNIQUE NOT NULL,
  created_by UUID REFERENCES members(id) ON DELETE SET NULL,
  used_by UUID REFERENCES members(id) ON DELETE SET NULL,
  max_uses INTEGER DEFAULT 1,
  current_uses INTEGER DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Membership dues table
CREATE TABLE membership_dues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) NOT NULL DEFAULT 50.00,
  stripe_payment_id VARCHAR(255),
  stripe_session_id VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  member_price DECIMAL(10,2),
  image_url TEXT,
  images TEXT[] DEFAULT '{}',
  category VARCHAR(50) DEFAULT 'general',
  sizes TEXT[] DEFAULT '{}',
  colors TEXT[] DEFAULT '{}',
  stock_quantity INTEGER DEFAULT 0,
  is_members_only BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  stripe_price_id VARCHAR(255),
  stripe_product_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID REFERENCES members(id) ON DELETE SET NULL,
  guest_email VARCHAR(255),
  guest_name VARCHAR(255),
  stripe_session_id VARCHAR(255),
  stripe_payment_intent_id VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded')),
  subtotal DECIMAL(10,2) NOT NULL,
  tax DECIMAL(10,2) DEFAULT 0,
  shipping DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  shipping_address JSONB,
  tracking_number VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items table
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  size VARCHAR(20),
  color VARCHAR(50),
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events table
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  location VARCHAR(255),
  address TEXT,
  event_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  image_url TEXT,
  is_members_only BOOLEAN DEFAULT FALSE,
  max_attendees INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Event RSVPs table
CREATE TABLE event_rsvps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE NOT NULL,
  status VARCHAR(20) DEFAULT 'attending' CHECK (status IN ('attending', 'maybe', 'not_attending')),
  guests INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, member_id)
);

-- Fleet gallery table
CREATE TABLE fleet_gallery (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  caption TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  is_approved BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email logs table (for dues reminders)
CREATE TABLE email_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  email_type VARCHAR(50) NOT NULL,
  recipient_email VARCHAR(255) NOT NULL,
  subject VARCHAR(255),
  status VARCHAR(20) DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'bounced')),
  sendgrid_message_id VARCHAR(255),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sessions table for auth
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE NOT NULL,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Site settings table
CREATE TABLE site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key VARCHAR(100) UNIQUE NOT NULL,
  value JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_members_email ON members(email);
CREATE INDEX idx_members_is_active ON members(is_active);
CREATE INDEX idx_invite_codes_code ON invite_codes(code);
CREATE INDEX idx_membership_dues_member ON membership_dues(member_id);
CREATE INDEX idx_membership_dues_status ON membership_dues(status);
CREATE INDEX idx_orders_member ON orders(member_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_event_rsvps_event ON event_rsvps(event_id);
CREATE INDEX idx_fleet_gallery_member ON fleet_gallery(member_id);
CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_sessions_member ON sessions(member_id);

-- Insert default site settings
INSERT INTO site_settings (key, value) VALUES
  ('membership_price', '50'),
  ('site_name', '"CRE8 Truck Club"'),
  ('site_description', '"The edgiest truck club for young enthusiasts"'),
  ('contact_email', '"info@cre8truckclub.com"');

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE invite_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_dues ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE fleet_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Products are viewable by everyone" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "Events are viewable by everyone" ON events FOR SELECT USING (is_active = true);
CREATE POLICY "Featured gallery images are public" ON fleet_gallery FOR SELECT USING (is_approved = true);
CREATE POLICY "Site settings are public" ON site_settings FOR SELECT USING (true);

-- Service role has full access (for API routes)
CREATE POLICY "Service role full access members" ON members FOR ALL USING (true);
CREATE POLICY "Service role full access invite_codes" ON invite_codes FOR ALL USING (true);
CREATE POLICY "Service role full access membership_dues" ON membership_dues FOR ALL USING (true);
CREATE POLICY "Service role full access products" ON products FOR ALL USING (true);
CREATE POLICY "Service role full access orders" ON orders FOR ALL USING (true);
CREATE POLICY "Service role full access order_items" ON order_items FOR ALL USING (true);
CREATE POLICY "Service role full access events" ON events FOR ALL USING (true);
CREATE POLICY "Service role full access event_rsvps" ON event_rsvps FOR ALL USING (true);
CREATE POLICY "Service role full access fleet_gallery" ON fleet_gallery FOR ALL USING (true);
CREATE POLICY "Service role full access email_logs" ON email_logs FOR ALL USING (true);
CREATE POLICY "Service role full access sessions" ON sessions FOR ALL USING (true);
CREATE POLICY "Service role full access site_settings" ON site_settings FOR ALL USING (true);

-- Insert sample data for testing
INSERT INTO products (name, description, price, member_price, category, sizes, is_members_only, is_active, image_url) VALUES
  ('CRE8 Classic Tee', 'Black cotton tee with gold CRE8 crown logo', 35.00, 28.00, 'apparel', ARRAY['S', 'M', 'L', 'XL', '2XL'], false, true, '/images/products/classic-tee.jpg'),
  ('CRE8 Crown Hoodie', 'Premium heavyweight hoodie with embroidered crown', 75.00, 60.00, 'apparel', ARRAY['S', 'M', 'L', 'XL', '2XL'], false, true, '/images/products/hoodie.jpg'),
  ('CRE8 Snapback', 'Black snapback with gold embroidered logo', 30.00, 24.00, 'accessories', ARRAY['One Size'], false, true, '/images/products/snapback.jpg'),
  ('Members Only Windbreaker', 'Exclusive windbreaker for club members', 95.00, 75.00, 'apparel', ARRAY['S', 'M', 'L', 'XL', '2XL'], true, true, '/images/products/windbreaker.jpg'),
  ('CRE8 Sticker Pack', 'Pack of 5 vinyl stickers', 12.00, 10.00, 'accessories', ARRAY[]::text[], false, true, '/images/products/stickers.jpg');

INSERT INTO events (title, description, location, address, event_date, start_time, end_time, is_members_only) VALUES
  ('Monthly Meet & Greet', 'Join us for our monthly truck meet. Show off your build and meet fellow enthusiasts!', 'Downtown Warehouse District', '123 Industrial Blvd, Austin TX', '2025-01-15', '18:00', '22:00', false),
  ('Members Only BBQ', 'Exclusive BBQ event for CRE8 members. Free food and drinks!', 'CRE8 HQ', '456 Club Drive, Austin TX', '2025-01-22', '12:00', '17:00', true),
  ('Truck Show & Shine', 'Annual truck show with awards and prizes', 'City Fairgrounds', '789 Fair Lane, Austin TX', '2025-02-10', '10:00', '16:00', false);
