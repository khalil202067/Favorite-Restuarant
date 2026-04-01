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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (!isAuthorized(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // GET — list all entries
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('knowledge_base')
      .select('*')
      .order('category')
      .order('updated_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  // POST — create new entry
  if (req.method === 'POST') {
    const { category, content } = req.body;
    if (!category || !content) {
      return res.status(400).json({ error: 'category and content are required.' });
    }
    const { data, error } = await supabase
      .from('knowledge_base')
      .insert([{ category, content }])
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(data);
  }

  // PATCH — update an existing entry
  if (req.method === 'PATCH') {
    const { id, category, content } = req.body;
    if (!id) return res.status(400).json({ error: 'id is required.' });

    const updates = { updated_at: new Date().toISOString() };
    if (category) updates.category = category;
    if (content)  updates.content  = content;

    const { data, error } = await supabase
      .from('knowledge_base')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  // DELETE — remove an entry
  if (req.method === 'DELETE') {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'id is required.' });
    const { error } = await supabase.from('knowledge_base').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
