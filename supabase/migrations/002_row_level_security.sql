-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Security policies for multi-tenant data isolation
-- ============================================

-- Enable RLS on all tables
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE concerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_ticket_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_sales ENABLE ROW LEVEL SECURITY;

-- ============================================
-- ARTISTS POLICIES
-- ============================================

-- Artists can view their own profile
CREATE POLICY "Artists can view own profile"
  ON artists FOR SELECT
  USING (auth.uid()::text = id::text);

-- Artists can update their own profile
CREATE POLICY "Artists can update own profile"
  ON artists FOR UPDATE
  USING (auth.uid()::text = id::text);

-- Artists can insert their own profile (sign up)
CREATE POLICY "Artists can insert own profile"
  ON artists FOR INSERT
  WITH CHECK (auth.uid()::text = id::text);

-- Public can view verified artist profiles (for public pages)
CREATE POLICY "Public can view verified artists"
  ON artists FOR SELECT
  USING (is_verified = true AND is_active = true);

-- ============================================
-- CONCERTS POLICIES
-- ============================================

-- Artists can view their own concerts
CREATE POLICY "Artists can view own concerts"
  ON concerts FOR SELECT
  USING (artist_id::text = auth.uid()::text);

-- Artists can create concerts
CREATE POLICY "Artists can create concerts"
  ON concerts FOR INSERT
  WITH CHECK (artist_id::text = auth.uid()::text);

-- Artists can update their own concerts
CREATE POLICY "Artists can update own concerts"
  ON concerts FOR UPDATE
  USING (artist_id::text = auth.uid()::text);

-- Artists can delete their own concerts
CREATE POLICY "Artists can delete own concerts"
  ON concerts FOR DELETE
  USING (artist_id::text = auth.uid()::text);

-- Public can view approved and promoted concerts
CREATE POLICY "Public can view approved concerts"
  ON concerts FOR SELECT
  USING (
    moderation_status = 'approved' 
    AND is_hidden = false 
    AND is_cancelled = false
  );

-- ============================================
-- NOTIFICATIONS POLICIES
-- ============================================

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (user_id::text = auth.uid()::text);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (user_id::text = auth.uid()::text);

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE
  USING (user_id::text = auth.uid()::text);

-- System can create notifications (service role only)
CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (true); -- Service role bypass

-- ============================================
-- NOTIFICATION SETTINGS POLICIES
-- ============================================

-- Users can view their own settings
CREATE POLICY "Users can view own notification settings"
  ON notification_settings FOR SELECT
  USING (user_id::text = auth.uid()::text);

-- Users can update their own settings
CREATE POLICY "Users can update own notification settings"
  ON notification_settings FOR UPDATE
  USING (user_id::text = auth.uid()::text);

-- Users can insert their own settings
CREATE POLICY "Users can insert own notification settings"
  ON notification_settings FOR INSERT
  WITH CHECK (user_id::text = auth.uid()::text);

-- ============================================
-- EMAIL CAMPAIGNS POLICIES
-- ============================================

-- Artists can view their own campaigns
CREATE POLICY "Artists can view own campaigns"
  ON email_campaigns FOR SELECT
  USING (artist_id::text = auth.uid()::text);

-- Artists can create campaigns
CREATE POLICY "Artists can create campaigns"
  ON email_campaigns FOR INSERT
  WITH CHECK (artist_id::text = auth.uid()::text);

-- Artists can update their own campaigns
CREATE POLICY "Artists can update own campaigns"
  ON email_campaigns FOR UPDATE
  USING (artist_id::text = auth.uid()::text);

-- Artists can delete their own campaigns
CREATE POLICY "Artists can delete own campaigns"
  ON email_campaigns FOR DELETE
  USING (artist_id::text = auth.uid()::text);

-- ============================================
-- TICKET PROVIDERS POLICIES
-- ============================================

-- Everyone can view active providers (public list)
CREATE POLICY "Everyone can view active providers"
  ON ticket_providers FOR SELECT
  USING (is_active = true);

-- ============================================
-- ARTIST TICKET PROVIDER CONNECTIONS POLICIES
-- ============================================

-- Artists can view their own connections
CREATE POLICY "Artists can view own provider connections"
  ON artist_ticket_providers FOR SELECT
  USING (artist_id::text = auth.uid()::text);

-- Artists can create connections
CREATE POLICY "Artists can create provider connections"
  ON artist_ticket_providers FOR INSERT
  WITH CHECK (artist_id::text = auth.uid()::text);

-- Artists can update their own connections
CREATE POLICY "Artists can update own provider connections"
  ON artist_ticket_providers FOR UPDATE
  USING (artist_id::text = auth.uid()::text);

-- Artists can delete their own connections
CREATE POLICY "Artists can delete own provider connections"
  ON artist_ticket_providers FOR DELETE
  USING (artist_id::text = auth.uid()::text);

-- ============================================
-- TICKET SALES POLICIES
-- ============================================

-- Artists can view sales for their concerts
CREATE POLICY "Artists can view own concert sales"
  ON ticket_sales FOR SELECT
  USING (artist_id::text = auth.uid()::text);

-- System can create sales (service role / webhook)
CREATE POLICY "System can create ticket sales"
  ON ticket_sales FOR INSERT
  WITH CHECK (true); -- Service role bypass

-- Artists can update sales status (refunds)
CREATE POLICY "Artists can update own sales"
  ON ticket_sales FOR UPDATE
  USING (artist_id::text = auth.uid()::text);

-- ============================================
-- HELPER FUNCTIONS FOR RLS
-- ============================================

-- Function to check if user is artist owner
CREATE OR REPLACE FUNCTION is_artist_owner(artist_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN artist_uuid::text = auth.uid()::text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user owns concert
CREATE OR REPLACE FUNCTION is_concert_owner(concert_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM concerts 
    WHERE id = concert_uuid 
    AND artist_id::text = auth.uid()::text
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

-- Grant usage on all tables to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- Grant permissions on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON POLICY "Artists can view own profile" ON artists IS 
  'Artists can only view their own profile data';

COMMENT ON POLICY "Public can view approved concerts" ON concerts IS 
  'Public users can view approved, visible, non-cancelled concerts';

COMMENT ON POLICY "Artists can view own concert sales" ON ticket_sales IS 
  'Artists can view ticket sales for their own concerts';

-- ============================================
-- END OF RLS MIGRATION
-- ============================================
