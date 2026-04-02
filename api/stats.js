'use strict';
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function checkAuth(req) {
  const auth = req.headers['authorization'] || '';
  const token = auth.replace('Bearer ', '').trim();
  return token === process.env.ADMIN_PASSWORD;
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (!checkAuth(req)) return res.status(401).json({ error: 'Unauthorized' });

  const today = new Date().toISOString().split('T')[0];
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  try {
    const [msgRes, sessRes, resTodayRes, resWeekRes] = await Promise.all([
      supabase
        .from('conversations')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', today),
      supabase
        .from('conversations')
        .select('session_id')
        .gte('created_at', today),
      supabase
        .from('reservations')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', today),
      supabase
        .from('reservations')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', weekAgo)
    ]);

    const uniqueSessions = new Set(
      (sessRes.data || []).map(r => r.session_id)
    ).size;

    return res.status(200).json({
      messages_today:        msgRes.count     || 0,
      unique_sessions_today: uniqueSessions,
      reservations_today:    resTodayRes.count || 0,
      reservations_this_week: resWeekRes.count || 0
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
