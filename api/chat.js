'use strict';

const { createClient } = require('@supabase/supabase-js');
const OpenAI = require('openai');

// ── Supabase (service role — server-side only) ──────────────────────────────
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ── OpenAI ──────────────────────────────────────────────────────────────────
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ── In-memory rate limit store (per Vercel function instance) ───────────────
const rateLimitStore = new Map();

function isRateLimited(sessionId) {
  const now = Date.now();
  const WINDOW_MS = 60_000; // 1 minute
  const MAX_MSGS  = 30;

  const timestamps = (rateLimitStore.get(sessionId) || [])
    .filter(t => now - t < WINDOW_MS);

  if (timestamps.length >= MAX_MSGS) return true;

  timestamps.push(now);
  rateLimitStore.set(sessionId, timestamps);
  return false;
}

// ── Load knowledge base from Supabase ───────────────────────────────────────
async function loadKnowledgeBase() {
  const { data, error } = await supabase
    .from('knowledge_base')
    .select('category, content')
    .order('category');
  if (error) throw new Error('KB load failed: ' + error.message);
  return data || [];
}

// ── Build the system prompt ──────────────────────────────────────────────────
function buildSystemPrompt(kb, customerContext) {
  const grouped = {};
  kb.forEach(({ category, content }) => {
    if (!grouped[category]) grouped[category] = [];
    grouped[category].push(content);
  });

  const kbText = Object.entries(grouped)
    .map(([cat, items]) => `\n--- ${cat.toUpperCase().replace(/_/g, ' ')} ---\n${items.join('\n\n')}`)
    .join('\n');

  const customerSection = customerContext ? `
===========================================================
RETURNING CUSTOMER MEMORY
===========================================================
${customerContext}
Use this information to personalise your responses. Greet the customer by name if you know it.
If they have previous reservations, you can reference them naturally (e.g. "Welcome back! Last time you visited on April 5...").
` : '';

  return `You are a friendly, professional AI assistant for Favorite Restaurant — a casual dining restaurant located along Second Avenue, near 12th Street, Eastleigh, Nairobi, Kenya. You are warm, helpful, and knowledgeable about every aspect of the restaurant.

===========================================================
RESTAURANT KNOWLEDGE BASE
===========================================================
${kbText}
${customerSection}
===========================================================
BEHAVIOR RULES
===========================================================
1. GREETING: Begin the first interaction with "Hello! Welcome to Favorite Restaurant. How can I assist you today? 😊"
2. MENU QUESTIONS: Always include item names AND exact prices in KES. Organise answers clearly by category.
3. LOCATION: "We are located along Second Avenue, near 12th Street, Eastleigh, Nairobi."
4. DELIVERY: Available within Eastleigh and nearby areas. Order by phone or WhatsApp. 30-45 min. Minimum KES 300.
5. PAYMENT: Cash, M-Pesa (Lipa Na M-Pesa), Visa/Mastercard debit/credit cards.
6. UNKNOWN QUESTIONS: Say exactly — "Great question! Let me connect you with our team. You can reach us via WhatsApp or phone." — Never invent information.
7. HALAL: All food is 100% halal-certified.
8. BREAKFAST HOURS: Breakfast is served 6:00 AM – 11:00 AM daily.

===========================================================
RESERVATION FLOW (follow these steps IN ORDER)
===========================================================
When a user wants to make a reservation, collect ALL of the following fields ONE or TWO at a time in a natural, conversational way. Never dump all questions at once.

Required fields:
  a) guest_name        — Customer's full name
  b) phone             — Contact phone/WhatsApp number
  c) party_size        — Number of people
  d) reservation_type  — "family", "friends", "business", or "special occasion"
  e) visit_date        — Date of visit (e.g. "April 5, 2026")
  f) arrival_time      — Time of arrival (minimum 1 hour from now; restaurant open 6:00 AM–11:00 PM)
  g) tables_needed     — Auto-suggest based on party size using this guide:
                         1-2 people → 1 small table
                         3-5 people → 1 medium table
                         6-10 people → 1-2 large tables
                         11+ people → multiple tables (ceil(party_size/5))
                         Always confirm with the customer.
  h) food_preorder     — Optional. Strongly recommend for groups of 6+, business meetings, special occasions.
  i) special_requests  — Optional. Any dietary needs, decorations, seating preferences, etc.

Important reservation rules:
  - Booking must be at least 1 hour in advance.
  - Reservation is held for 20 minutes after arrival time.
  - For groups 6+: strongly recommend pre-ordering food.
  - Cancellations: at least 30 minutes before reservation time.

WHEN ALL REQUIRED FIELDS (a–g) ARE COLLECTED, output your friendly confirmation message first, then append this exact block at the very end of your message (do not modify the delimiters):

<<<RESERVATION_DATA>>>
{"guest_name":"","phone":"","party_size":0,"reservation_type":"","visit_date":"","arrival_time":"","tables_needed":0,"food_preorder":"","special_requests":""}
<<<END_RESERVATION_DATA>>>

Fill in every JSON field with the actual values from the conversation. Use empty string "" for optional fields not provided.
===========================================================`;
}

// ── Parse & save reservation if present ─────────────────────────────────────
async function handleReservation(text) {
  const match = text.match(/<<<RESERVATION_DATA>>>([\s\S]*?)<<<END_RESERVATION_DATA>>>/);
  if (!match) return text;

  let clean = text
    .replace(/<<<RESERVATION_DATA>>>[\s\S]*?<<<END_RESERVATION_DATA>>>/, '')
    .trim();

  try {
    const data = JSON.parse(match[1].trim());

    if (!data.tables_needed || data.tables_needed === 0) {
      const sz = data.party_size || 1;
      if (sz <= 2)       data.tables_needed = 1;
      else if (sz <= 5)  data.tables_needed = 1;
      else if (sz <= 10) data.tables_needed = 2;
      else               data.tables_needed = Math.ceil(sz / 5);
    }

    await supabase.from('reservations').insert([{
      guest_name:       data.guest_name       || 'Guest',
      phone:            data.phone            || 'N/A',
      party_size:       data.party_size       || 1,
      reservation_type: data.reservation_type || 'general',
      visit_date:       data.visit_date       || 'TBD',
      arrival_time:     data.arrival_time     || 'TBD',
      tables_needed:    data.tables_needed,
      food_preorder:    data.food_preorder    || null,
      special_requests: data.special_requests || null,
      status:           'pending'
    }]);
  } catch (err) {
    console.error('Reservation save error:', err.message);
  }

  return clean;
}

// ── Main handler ─────────────────────────────────────────────────────────────
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')   return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { message, sessionId, customerName, customerPhone } = req.body;

    if (!message || !sessionId) {
      return res.status(400).json({ error: 'message and sessionId are required.' });
    }
    if (message.length > 2000) {
      return res.status(400).json({ error: 'Message too long.' });
    }

    if (isRateLimited(sessionId)) {
      return res.status(429).json({ error: 'Too many messages. Please wait a moment before sending again.' });
    }

    // Load KB + history + customer reservations in parallel
    const [kb, { data: history }, { data: pastReservations }] = await Promise.all([
      loadKnowledgeBase(),
      supabase
        .from('conversations')
        .select('role, message')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true })
        .limit(30),
      customerPhone
        ? supabase
            .from('reservations')
            .select('guest_name, visit_date, arrival_time, party_size, reservation_type, status')
            .eq('phone', customerPhone)
            .order('created_at', { ascending: false })
            .limit(5)
        : Promise.resolve({ data: [] })
    ]);

    // Build customer context string
    let customerContext = null;
    if (customerName || customerPhone) {
      const lines = [];
      if (customerName)  lines.push(`Customer name: ${customerName}`);
      if (customerPhone) lines.push(`Customer phone: ${customerPhone}`);
      if (pastReservations && pastReservations.length > 0) {
        lines.push('Previous reservations (most recent first):');
        pastReservations.forEach((r, i) => {
          lines.push(`  ${i + 1}. ${r.visit_date} at ${r.arrival_time} — party of ${r.party_size} (${r.reservation_type}) — Status: ${r.status}`);
        });
      } else {
        lines.push('No previous reservations found.');
      }
      customerContext = lines.join('\n');
    }

    const systemPrompt = buildSystemPrompt(kb, customerContext);

    const messages = [
      { role: 'system', content: systemPrompt },
      ...(history || []).map(h => ({ role: h.role, content: h.message })),
      { role: 'user', content: message }
    ];

    const completion = await openai.chat.completions.create({
      model:       'gpt-4o',
      messages,
      max_tokens:  1200,
      temperature: 0.65
    });

    let aiResponse = completion.choices[0].message.content || '';
    aiResponse = await handleReservation(aiResponse);

    await supabase.from('conversations').insert([
      { session_id: sessionId, role: 'user',      message,            customer_phone: customerPhone || null, customer_name: customerName || null },
      { session_id: sessionId, role: 'assistant', message: aiResponse, customer_phone: customerPhone || null, customer_name: customerName || null }
    ]);

    return res.status(200).json({ response: aiResponse });

  } catch (err) {
    console.error('Chat handler error:', err);
    return res.status(500).json({ error: 'Something went wrong. Please try again in a moment.' });
  }
};
