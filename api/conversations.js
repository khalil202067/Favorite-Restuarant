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

  if (req.method === 'GET') {
    const { keyword } = req.query;

    let query = supabase
      .from('conversations')
      .select('id, session_id, role, message, created_at')
      .order('created_at', { ascending: false })
      .limit(500);

    if (keyword) {
      query = query.ilike('message', `%${keyword}%`);
    }

    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });

    // Group messages by session_id
    const sessions = {};
    (data || []).forEach(row => {
      if (!sessions[row.session_id]) {
        sessions[row.session_id] = {
          session_id: row.session_id,
          started_at: row.created_at,
          messages: []
        };
      }
      sessions[row.session_id].messages.push({
        role: row.role,
        message: row.message,
        created_at: row.created_at
      });
    });

    // Sort messages inside each session oldest first
    Object.values(sessions).forEach(s => {
      s.messages.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    });

    // Return sessions newest first
    const result = Object.values(sessions).sort(
      (a, b) => new Date(b.started_at) - new Date(a.started_at)
    );

    return res.status(200).json(result);
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
