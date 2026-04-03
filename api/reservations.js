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
  res.setHeader('Access-Control-Allow-Methods', 'GET, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!checkAuth(req)) return res.status(401).json({ error: 'Unauthorized' });
  if (req.method === 'GET') {
    const { date, status, created_date } = req.query;
    let query = supabase
      .from('reservations')
      .select('id, guest_name, phone, party_size, reservation_type, visit_date, arrival_time, tables_needed, food_preorder, special_requests, status, created_at')
      .order('created_at', { ascending: false });

    if (date) {
      // visit_date is stored as text e.g. "April 4, 2026" — convert and search
      const d = new Date(date + 'T12:00:00Z');
      const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
      const textDate = months[d.getUTCMonth()] + ' ' + d.getUTCDate() + ', ' + d.getUTCFullYear();
      query = query.ilike('visit_date', '%' + textDate + '%');
    }

    if (created_date) {
      // Use Nairobi timezone (EAT = UTC+3) so dates match what admin sees on screen
      const startUTC = new Date(created_date + 'T00:00:00+03:00').toISOString();
      const endUTC   = new Date(created_date + 'T23:59:59+03:00').toISOString();
      query = query.gte('created_at', startUTC).lte('created_at', endUTC);
    }

    if (status && status !== 'all') query = query.eq('status', status);
    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }
  if (req.method === 'PATCH') {
    const { id, status } = req.body;
    if (!id || !status)
      return res.status(400).json({ error: 'id and status are required' });
    const { data, error } = await supabase
      .from('reservations')
      .update({ status })
      .eq('id', id)
      .select();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data[0]);
  }
  return res.status(405).json({ error: 'Method not allowed' });
};
