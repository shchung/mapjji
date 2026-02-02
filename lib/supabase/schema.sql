-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgvector for future ML features
CREATE EXTENSION IF NOT EXISTS "vector";

-- Create restaurants table
CREATE TABLE restaurants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT,
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  phone TEXT,
  avg_spice_level DECIMAL(2, 1) CHECK (avg_spice_level >= 1 AND avg_spice_level <= 5),
  is_sponsored BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create menus table
CREATE TABLE menus (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  spice_level DECIMAL(2, 1) CHECK (spice_level >= 1 AND spice_level <= 5),
  price INTEGER,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_profiles table
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname TEXT,
  spice_tolerance INTEGER CHECK (spice_tolerance >= 1 AND spice_tolerance <= 10),
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create reviews table
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  menu_id UUID REFERENCES menus(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  spice_level INTEGER NOT NULL CHECK (spice_level >= 1 AND spice_level <= 5),
  comment TEXT,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_restaurants_lat_lng ON restaurants(lat, lng);
CREATE INDEX idx_restaurants_name ON restaurants USING GIN(to_tsvector('simple', name));
CREATE INDEX idx_menus_restaurant_id ON menus(restaurant_id);
CREATE INDEX idx_reviews_restaurant_id ON reviews(restaurant_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_menu_id ON reviews(menu_id);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to restaurants
CREATE TRIGGER update_restaurants_updated_at
BEFORE UPDATE ON restaurants
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for restaurants (public read, authenticated write)
CREATE POLICY "restaurants_public_read" ON restaurants
  FOR SELECT USING (true);

CREATE POLICY "restaurants_authenticated_insert" ON restaurants
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "restaurants_authenticated_update" ON restaurants
  FOR UPDATE USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- RLS Policies for menus (public read, authenticated write)
CREATE POLICY "menus_public_read" ON menus
  FOR SELECT USING (true);

CREATE POLICY "menus_authenticated_insert" ON menus
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "menus_authenticated_update" ON menus
  FOR UPDATE USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- RLS Policies for reviews (public read, authenticated write own reviews)
CREATE POLICY "reviews_public_read" ON reviews
  FOR SELECT USING (true);

CREATE POLICY "reviews_authenticated_insert" ON reviews
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND user_id = auth.uid());

CREATE POLICY "reviews_authenticated_update_own" ON reviews
  FOR UPDATE USING (auth.role() = 'authenticated' AND user_id = auth.uid())
  WITH CHECK (auth.role() = 'authenticated' AND user_id = auth.uid());

CREATE POLICY "reviews_authenticated_delete_own" ON reviews
  FOR DELETE USING (auth.role() = 'authenticated' AND user_id = auth.uid());

-- RLS Policies for user_profiles (users can read all, write own)
CREATE POLICY "user_profiles_public_read" ON user_profiles
  FOR SELECT USING (true);

CREATE POLICY "user_profiles_authenticated_insert" ON user_profiles
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND id = auth.uid());

CREATE POLICY "user_profiles_authenticated_update_own" ON user_profiles
  FOR UPDATE USING (auth.role() = 'authenticated' AND id = auth.uid())
  WITH CHECK (auth.role() = 'authenticated' AND id = auth.uid());
