-- Create tour_dates table for managing concerts and performances
CREATE TABLE IF NOT EXISTS tour_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Tour and event details
  tour_name TEXT,
  title TEXT NOT NULL,
  description TEXT,
  
  -- Venue information
  venue_name TEXT NOT NULL,
  venue_id UUID REFERENCES venue_profiles(id) ON DELETE SET NULL,
  city TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'Россия',
  
  -- Date and time
  date DATE NOT NULL,
  doors_open TIME,
  show_start TIME NOT NULL,
  
  -- Ticketing
  ticket_url TEXT,
  ticket_price_min NUMERIC(10, 2),
  ticket_price_max NUMERIC(10, 2),
  venue_capacity INTEGER,
  tickets_sold INTEGER DEFAULT 0,
  
  -- Event type and status
  event_type TEXT NOT NULL DEFAULT 'Концерт',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'announced', 'on_sale', 'sold_out', 'cancelled', 'postponed', 'completed')),
  
  -- Moderation (if needed)
  moderation_status TEXT NOT NULL DEFAULT 'pending' CHECK (moderation_status IN ('draft', 'pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  
  -- Media
  banner_url TEXT,
  photos TEXT[], -- Array of photo URLs
  
  -- Analytics
  views INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  
  -- Promotion
  is_promoted BOOLEAN DEFAULT FALSE,
  promotion_expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes
  CONSTRAINT tour_dates_date_check CHECK (date >= CURRENT_DATE OR status = 'completed')
);

-- Create artist_profiles table extension for performance history
CREATE TABLE IF NOT EXISTS artist_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic info
  display_name TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  cover_image_url TEXT,
  
  -- Location
  city TEXT,
  country TEXT DEFAULT 'Россия',
  studio_address TEXT,
  
  -- Social links
  social_links JSONB DEFAULT '{}',
  streaming_links JSONB DEFAULT '{}',
  
  -- Genres and influences
  genres TEXT[],
  influences TEXT[],
  
  -- EPK and riders
  epk_url TEXT,
  tech_rider_url TEXT,
  hospitality_rider_url TEXT,
  
  -- Performance history (array of past performances)
  performance_history JSONB DEFAULT '[]',
  -- Structure: [{ event_name, venue_name, city, date, audience_size, type, description, photos }]
  
  -- Calendars
  release_calendar JSONB DEFAULT '[]',
  events_calendar JSONB DEFAULT '[]',
  
  -- Stats
  total_streams INTEGER DEFAULT 0,
  monthly_listeners INTEGER DEFAULT 0,
  total_fans INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_tour_dates_artist_id ON tour_dates(artist_id);
CREATE INDEX IF NOT EXISTS idx_tour_dates_date ON tour_dates(date);
CREATE INDEX IF NOT EXISTS idx_tour_dates_status ON tour_dates(status);
CREATE INDEX IF NOT EXISTS idx_tour_dates_moderation ON tour_dates(moderation_status);
CREATE INDEX IF NOT EXISTS idx_artist_profiles_user_id ON artist_profiles(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tour_dates
CREATE TRIGGER update_tour_dates_updated_at
  BEFORE UPDATE ON tour_dates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to artist_profiles
CREATE TRIGGER update_artist_profiles_updated_at
  BEFORE UPDATE ON artist_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE tour_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tour_dates
-- Artists can view their own concerts
CREATE POLICY "Artists can view own tour dates"
  ON tour_dates FOR SELECT
  USING (artist_id = auth.uid());

-- Artists can insert their own concerts
CREATE POLICY "Artists can insert own tour dates"
  ON tour_dates FOR INSERT
  WITH CHECK (artist_id = auth.uid());

-- Artists can update their own concerts
CREATE POLICY "Artists can update own tour dates"
  ON tour_dates FOR UPDATE
  USING (artist_id = auth.uid());

-- Artists can delete their own concerts
CREATE POLICY "Artists can delete own tour dates"
  ON tour_dates FOR DELETE
  USING (artist_id = auth.uid());

-- Public can view approved concerts
CREATE POLICY "Public can view approved tour dates"
  ON tour_dates FOR SELECT
  USING (moderation_status = 'approved' AND status NOT IN ('draft', 'cancelled'));

-- RLS Policies for artist_profiles
-- Artists can view their own profile
CREATE POLICY "Artists can view own profile"
  ON artist_profiles FOR SELECT
  USING (user_id = auth.uid());

-- Artists can update their own profile
CREATE POLICY "Artists can update own profile"
  ON artist_profiles FOR UPDATE
  USING (user_id = auth.uid());

-- Public can view all profiles (for discovery)
CREATE POLICY "Public can view profiles"
  ON artist_profiles FOR SELECT
  USING (true);

-- Insert initial artist profile on user signup (via trigger or function)
CREATE OR REPLACE FUNCTION create_artist_profile_on_signup()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO artist_profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', 'Артист'))
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_artist_profile_on_signup();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON tour_dates TO authenticated;
GRANT ALL ON artist_profiles TO authenticated;
GRANT SELECT ON tour_dates TO anon;
GRANT SELECT ON artist_profiles TO anon;
