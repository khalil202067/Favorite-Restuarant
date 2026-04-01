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

  const { search } = req.query;

  let query = supabase
    .from('conversations')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(600);

  if (search && search.trim()) {
    query = query.ilike('message', `%${search.trim()}%`);
  }

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });

  // Group by session_id
  const sessionsMap = {};
  (data || []).forEach(msg => {
    if (!sessionsMap[msg.session_id]) {
      sessionsMap[msg.session_id] = {
        session_id:    msg.session_id,
        message_count: 0,
        created_at:    msg.created_at,
        last_message:  '',
        messages:      []
      };
    }
    const s = sessionsMap[msg.session_id];
    s.messages.push(msg);
    s.message_count++;
    // Keep the earliest created_at as session start
    if (msg.created_at < s.created_at) s.created_at = msg.created_at;
    s.last_message = msg.message.substring(0, 80);
  });

  // Sort sessions newest first
  const sessions = Object.values(sessionsMap).sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );

  return res.status(200).json(sessions);
};
