'use strict';

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function isAuthorized(req) {
  const auth = req.headers.authorization || '';
  return auth === `Bearer ${process.env.ADMIN_PASSWORD}`;
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET')    return res.status(405).json({ error: 'Method not allowed' });

  if (!isAuthorized(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const now     = new Date();
  const today   = now.toISOString().split('T')[0];               // YYYY-MM-DD
  const weekAgo = new Date(now - 7 * 86400_000).toISOString();   // 7 days ago

  const [
    { data: msgsToday },
    { data: resToday },
    { data: resWeek },
    { data: contactsTotal }
  ] = await Promise.all([
    supabase.from('conversations').select('session_id').gte('created_at', today),
    supabase.from('reservations').select('id').gte('created_at', today),
    supabase.from('reservations').select('id').gte('created_at', weekAgo),
    supabase.from('contact_submissions').select('id')
  ]);

  const totalMessagesToday      = msgsToday?.length       || 0;
  const uniqueSessionsToday     = new Set((msgsToday || []).map(m => m.session_id)).size;
  const totalReservationsToday  = resToday?.length        || 0;
  const totalReservationsWeek   = resWeek?.length         || 0;
  const totalContactSubmissions = contactsTotal?.length   || 0;

  return res.status(200).json({
    totalMessagesToday,
    uniqueSessionsToday,
    totalReservationsToday,
    totalReservationsWeek,
    totalContactSubmissions
  });
};
