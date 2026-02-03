import { Hono } from 'npm:hono';
import { createClient } from 'npm:@supabase/supabase-js@2';

const concertsRoutes = new Hono();

// Helper to get Supabase client with user auth
const getSupabaseClient = (accessToken?: string) => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = accessToken 
    ? Deno.env.get('SUPABASE_ANON_KEY')!
    : Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  
  const client = createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    },
  });
  
  return client;
};

// Helper to verify user authentication
const verifyAuth = async (accessToken?: string) => {
  if (!accessToken) {
    return { user: null, error: 'No access token provided' };
  }
  
  const supabase = getSupabaseClient(accessToken);
  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  
  if (error || !user) {
    return { user: null, error: 'Unauthorized' };
  }
  
  return { user, error: null };
};

// ============================================
// TOUR DATES (CONCERTS) API
// ============================================

// Get all concerts for current user
concertsRoutes.get('/tour-dates', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { user, error: authError } = await verifyAuth(accessToken);
    
    if (authError || !user) {
      return c.json({ success: false, error: authError || 'Unauthorized' }, 401);
    }
    
    const supabase = getSupabaseClient(accessToken);
    
    const { data: tourDates, error } = await supabase
      .from('tour_dates')
      .select('*')
      .eq('artist_id', user.id)
      .order('date', { ascending: true });
    
    if (error) {
      console.error('Error fetching tour dates:', error);
      return c.json({ success: false, error: error.message }, 500);
    }
    
    return c.json({ success: true, data: tourDates || [] });
  } catch (error) {
    console.error('Error in GET /tour-dates:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get single concert by ID
concertsRoutes.get('/tour-dates/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { user, error: authError } = await verifyAuth(accessToken);
    
    if (authError || !user) {
      return c.json({ success: false, error: authError || 'Unauthorized' }, 401);
    }
    
    const supabase = getSupabaseClient(accessToken);
    
    const { data: tourDate, error } = await supabase
      .from('tour_dates')
      .select('*')
      .eq('id', id)
      .eq('artist_id', user.id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return c.json({ success: false, error: 'Concert not found' }, 404);
      }
      console.error('Error fetching tour date:', error);
      return c.json({ success: false, error: error.message }, 500);
    }
    
    return c.json({ success: true, data: tourDate });
  } catch (error) {
    console.error('Error in GET /tour-dates/:id:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Create new concert
concertsRoutes.post('/tour-dates', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { user, error: authError } = await verifyAuth(accessToken);
    
    if (authError || !user) {
      return c.json({ success: false, error: authError || 'Unauthorized' }, 401);
    }
    
    const body = await c.req.json();
    const supabase = getSupabaseClient(accessToken);
    
    // Create tour date
    const { data: tourDate, error } = await supabase
      .from('tour_dates')
      .insert({
        artist_id: user.id,
        title: body.title,
        description: body.description,
        tour_name: body.tour_name,
        venue_name: body.venue_name,
        venue_address: body.venue_address,
        city: body.city,
        country: body.country || 'Россия',
        date: body.date,
        doors_open: body.doors_open,
        show_start: body.show_start,
        ticket_url: body.ticket_url,
        ticket_price_min: body.ticket_price_min,
        ticket_price_max: body.ticket_price_max,
        venue_capacity: body.venue_capacity,
        event_type: body.event_type || 'Концерт',
        status: body.status || 'draft',
        moderation_status: 'draft',
        banner_url: body.banner_url,
        genre: body.genre,
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating tour date:', error);
      return c.json({ success: false, error: error.message }, 500);
    }
    
    console.log(`Tour date created: ${tourDate.id} for user ${user.id}`);
    return c.json({ success: true, data: tourDate }, 201);
  } catch (error) {
    console.error('Error in POST /tour-dates:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update concert
concertsRoutes.put('/tour-dates/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { user, error: authError } = await verifyAuth(accessToken);
    
    if (authError || !user) {
      return c.json({ success: false, error: authError || 'Unauthorized' }, 401);
    }
    
    const body = await c.req.json();
    const supabase = getSupabaseClient(accessToken);
    
    // Update tour date
    const { data: tourDate, error } = await supabase
      .from('tour_dates')
      .update({
        ...body,
        // Prevent changing artist_id
        artist_id: undefined,
      })
      .eq('id', id)
      .eq('artist_id', user.id)
      .select()
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return c.json({ success: false, error: 'Concert not found' }, 404);
      }
      console.error('Error updating tour date:', error);
      return c.json({ success: false, error: error.message }, 500);
    }
    
    console.log(`Tour date updated: ${id} for user ${user.id}`);
    return c.json({ success: true, data: tourDate });
  } catch (error) {
    console.error('Error in PUT /tour-dates/:id:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete concert
concertsRoutes.delete('/tour-dates/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { user, error: authError } = await verifyAuth(accessToken);
    
    if (authError || !user) {
      return c.json({ success: false, error: authError || 'Unauthorized' }, 401);
    }
    
    const supabase = getSupabaseClient(accessToken);
    
    const { error } = await supabase
      .from('tour_dates')
      .delete()
      .eq('id', id)
      .eq('artist_id', user.id);
    
    if (error) {
      console.error('Error deleting tour date:', error);
      return c.json({ success: false, error: error.message }, 500);
    }
    
    console.log(`Tour date deleted: ${id} for user ${user.id}`);
    return c.json({ success: true, message: 'Concert deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /tour-dates/:id:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Submit concert for moderation
concertsRoutes.post('/tour-dates/:id/submit', async (c) => {
  try {
    const id = c.req.param('id');
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { user, error: authError } = await verifyAuth(accessToken);
    
    if (authError || !user) {
      return c.json({ success: false, error: authError || 'Unauthorized' }, 401);
    }
    
    const supabase = getSupabaseClient(accessToken);
    
    const { data: tourDate, error } = await supabase
      .from('tour_dates')
      .update({ moderation_status: 'pending' })
      .eq('id', id)
      .eq('artist_id', user.id)
      .select()
      .single();
    
    if (error) {
      console.error('Error submitting tour date:', error);
      return c.json({ success: false, error: error.message }, 500);
    }
    
    console.log(`Tour date submitted for moderation: ${id}`);
    return c.json({ success: true, data: tourDate });
  } catch (error) {
    console.error('Error in POST /tour-dates/:id/submit:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Promote concert with coins
concertsRoutes.post('/tour-dates/:id/promote', async (c) => {
  try {
    const id = c.req.param('id');
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { user, error: authError } = await verifyAuth(accessToken);
    
    if (authError || !user) {
      return c.json({ success: false, error: authError || 'Unauthorized' }, 401);
    }
    
    const body = await c.req.json();
    const { days = 7 } = body; // Default 7 days promotion
    
    const supabase = getSupabaseClient(accessToken);
    
    // Calculate promotion expiry
    const promotionExpiresAt = new Date();
    promotionExpiresAt.setDate(promotionExpiresAt.getDate() + days);
    
    const { data: tourDate, error } = await supabase
      .from('tour_dates')
      .update({ 
        is_promoted: true,
        promotion_expires_at: promotionExpiresAt.toISOString(),
      })
      .eq('id', id)
      .eq('artist_id', user.id)
      .select()
      .single();
    
    if (error) {
      console.error('Error promoting tour date:', error);
      return c.json({ success: false, error: error.message }, 500);
    }
    
    console.log(`Tour date promoted: ${id} for ${days} days`);
    return c.json({ success: true, data: tourDate });
  } catch (error) {
    console.error('Error in POST /tour-dates/:id/promote:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============================================
// PERFORMANCE HISTORY API
// ============================================

// Get performance history
concertsRoutes.get('/performance-history', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { user, error: authError } = await verifyAuth(accessToken);
    
    if (authError || !user) {
      return c.json({ success: false, error: authError || 'Unauthorized' }, 401);
    }
    
    const supabase = getSupabaseClient(accessToken);
    
    const { data: profile, error } = await supabase
      .from('artist_profiles')
      .select('performance_history')
      .eq('user_id', user.id)
      .single();
    
    if (error) {
      console.error('Error fetching performance history:', error);
      return c.json({ success: false, error: error.message }, 500);
    }
    
    return c.json({ 
      success: true, 
      data: profile?.performance_history || [] 
    });
  } catch (error) {
    console.error('Error in GET /performance-history:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Add performance to history
concertsRoutes.post('/performance-history', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { user, error: authError } = await verifyAuth(accessToken);
    
    if (authError || !user) {
      return c.json({ success: false, error: authError || 'Unauthorized' }, 401);
    }
    
    const body = await c.req.json();
    const supabase = getSupabaseClient(accessToken);
    
    // Get current performance history
    const { data: profile, error: fetchError } = await supabase
      .from('artist_profiles')
      .select('performance_history')
      .eq('user_id', user.id)
      .single();
    
    if (fetchError) {
      console.error('Error fetching profile:', fetchError);
      return c.json({ success: false, error: fetchError.message }, 500);
    }
    
    // Add new performance
    const currentHistory = profile?.performance_history || [];
    const newHistory = [
      ...currentHistory,
      {
        ...body,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        created_at: new Date().toISOString(),
      }
    ];
    
    // Update profile
    const { data: updatedProfile, error: updateError } = await supabase
      .from('artist_profiles')
      .update({ performance_history: newHistory })
      .eq('user_id', user.id)
      .select()
      .single();
    
    if (updateError) {
      console.error('Error updating performance history:', updateError);
      return c.json({ success: false, error: updateError.message }, 500);
    }
    
    console.log(`Performance added to history for user ${user.id}`);
    return c.json({ 
      success: true, 
      data: updatedProfile.performance_history 
    }, 201);
  } catch (error) {
    console.error('Error in POST /performance-history:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update performance in history
concertsRoutes.put('/performance-history/:id', async (c) => {
  try {
    const performanceId = c.req.param('id');
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { user, error: authError } = await verifyAuth(accessToken);
    
    if (authError || !user) {
      return c.json({ success: false, error: authError || 'Unauthorized' }, 401);
    }
    
    const body = await c.req.json();
    const supabase = getSupabaseClient(accessToken);
    
    // Get current performance history
    const { data: profile, error: fetchError } = await supabase
      .from('artist_profiles')
      .select('performance_history')
      .eq('user_id', user.id)
      .single();
    
    if (fetchError) {
      console.error('Error fetching profile:', fetchError);
      return c.json({ success: false, error: fetchError.message }, 500);
    }
    
    // Update performance
    const currentHistory = profile?.performance_history || [];
    const updatedHistory = currentHistory.map((perf: any) => 
      perf.id === performanceId ? { ...perf, ...body } : perf
    );
    
    // Update profile
    const { data: updatedProfile, error: updateError } = await supabase
      .from('artist_profiles')
      .update({ performance_history: updatedHistory })
      .eq('user_id', user.id)
      .select()
      .single();
    
    if (updateError) {
      console.error('Error updating performance history:', updateError);
      return c.json({ success: false, error: updateError.message }, 500);
    }
    
    console.log(`Performance ${performanceId} updated for user ${user.id}`);
    return c.json({ 
      success: true, 
      data: updatedProfile.performance_history 
    });
  } catch (error) {
    console.error('Error in PUT /performance-history/:id:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete performance from history
concertsRoutes.delete('/performance-history/:id', async (c) => {
  try {
    const performanceId = c.req.param('id');
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { user, error: authError } = await verifyAuth(accessToken);
    
    if (authError || !user) {
      return c.json({ success: false, error: authError || 'Unauthorized' }, 401);
    }
    
    const supabase = getSupabaseClient(accessToken);
    
    // Get current performance history
    const { data: profile, error: fetchError } = await supabase
      .from('artist_profiles')
      .select('performance_history')
      .eq('user_id', user.id)
      .single();
    
    if (fetchError) {
      console.error('Error fetching profile:', fetchError);
      return c.json({ success: false, error: fetchError.message }, 500);
    }
    
    // Remove performance
    const currentHistory = profile?.performance_history || [];
    const updatedHistory = currentHistory.filter((perf: any) => perf.id !== performanceId);
    
    // Update profile
    const { error: updateError } = await supabase
      .from('artist_profiles')
      .update({ performance_history: updatedHistory })
      .eq('user_id', user.id);
    
    if (updateError) {
      console.error('Error deleting performance from history:', updateError);
      return c.json({ success: false, error: updateError.message }, 500);
    }
    
    console.log(`Performance ${performanceId} deleted for user ${user.id}`);
    return c.json({ success: true, message: 'Performance deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /performance-history/:id:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

export default concertsRoutes;