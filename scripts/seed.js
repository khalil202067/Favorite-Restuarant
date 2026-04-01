/**
 * FAVORITE RESTAURANT — Knowledge Base Seed Script
 * Source: Official PDF Knowledge Base Document
 * Run: node scripts/seed.js
 */

'use strict';

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ─────────────────────────────────────────────────────────────────────────────
// KNOWLEDGE BASE — sourced directly from the official PDF document
// ─────────────────────────────────────────────────────────────────────────────
const knowledgeBase = [

  // ── ABOUT THE RESTAURANT ───────────────────────────────────────────────────
  {
    category: 'about',
    content: `ABOUT FAVORITE RESTAURANT

Favorite Restaurant is a casual dining restaurant located in Eastleigh, Nairobi, along Second Avenue near 12th Street. It serves a wide variety of meals including Somali traditional dishes, fast food, and international cuisine.

The restaurant is known for:
- Affordable pricing
- Fast service
- A welcoming environment for individuals, families, and groups

The restaurant operates daily and offers dine-in, takeaway, delivery, and reservation services.`
  },

  // ── SERVICES ───────────────────────────────────────────────────────────────
  {
    category: 'services',
    content: `SERVICES OFFERED BY FAVORITE RESTAURANT

1. DINE-IN SERVICE
Customers can visit the restaurant and enjoy meals on-site.
- Comfortable seating available
- Suitable for individuals, families, and groups
- No strict dress code
- First-come, first-served or via reservation

2. TAKEAWAY SERVICE
Customers can order food and take it away.
- Orders prepared quickly
- Packaging provided
- Ideal for quick meals

3. DELIVERY SERVICE
Delivery is available within Eastleigh and nearby areas.
- Orders can be placed via phone or WhatsApp
- Delivery time depends on distance and order size
- Delivery charges may apply

4. RESERVATION / TABLE BOOKING SERVICE
Customers can reserve tables in advance.
Reservation is suitable for:
- Individuals
- Families
- Friends gatherings
- Business meetings
- Special occasions`
  },

  // ── RESERVATION RULES ──────────────────────────────────────────────────────
  {
    category: 'reservation_rules',
    content: `RESERVATION INFORMATION & RULES

INFORMATION REQUIRED TO COMPLETE A RESERVATION:
1. Customer name
2. Contact number (phone or WhatsApp)
3. Number of people
4. Type of reservation (family, friends, business, special occasion, etc.)
5. Date of visit
6. Time of arrival
7. Number of tables required
8. Food pre-order (optional)
9. Special requests (optional)

TABLE ALLOCATION GUIDE:
- 1–2 people → Small table
- 3–5 people → Medium table
- 6–10 people → Large table
- More than 10 people → Multiple tables

RESERVATION RULES:
- Booking should be made at least 1 hour in advance
- Peak hours: 12:00 PM – 3:00 PM and 7:00 PM – 9:00 PM
- Reservation is held for 20 minutes after arrival time

PRE-ORDER OPTION:
Customers can request food to be prepared in advance.
Recommended for:
- Large groups
- Business meetings
- Special events

RESERVATION CONFIRMATION:
Once all details are provided, the reservation is confirmed and tables are prepared accordingly.`
  },

  // ── SOMALI CUISINE ─────────────────────────────────────────────────────────
  {
    category: 'menu_somali',
    content: `SOMALI CUISINE MENU

• Beef Sukar — KES 800
• Chicken Sukar — KES 750
• Camel Meat (Hilib Geel) — KES 1,000
• Anjero with Meat — KES 600

All Somali dishes are prepared with authentic traditional spices and recipes. 100% Halal.`
  },

  // ── FAST FOOD ──────────────────────────────────────────────────────────────
  {
    category: 'menu_fastfood',
    content: `FAST FOOD MENU

• Chicken Shawarma — KES 400
• Beef Shawarma — KES 450
• Chicken Burger — KES 550
• Beef Burger — KES 500
• French Fries — KES 250

All fast food items are made fresh to order. 100% Halal ingredients.`
  },

  // ── BIRYANI & RICE ─────────────────────────────────────────────────────────
  {
    category: 'menu_biryani',
    content: `BIRYANI & RICE MENU

• Beef Biryani — KES 700
• Chicken Biryani — KES 750
• Vegetable Pilau — KES 500

All biryanis are slow-cooked with aromatic basmati rice and traditional spices.`
  },

  // ── BREAKFAST ──────────────────────────────────────────────────────────────
  {
    category: 'menu_breakfast',
    content: `BREAKFAST MENU — Served Daily 6:00 AM – 11:00 PM

• Chapati with Tea — KES 150
• Mandazi with Tea — KES 120
• Omelette with Bread — KES 200

Start your day right with our freshly prepared breakfast options.`
  },

  // ── DRINKS ─────────────────────────────────────────────────────────────────
  {
    category: 'menu_drinks',
    content: `BEVERAGES & DRINKS MENU

• Tea — KES 100
• Coffee — KES 150
• Fresh Juice — KES 250
• Soda — KES 100
• Mineral Water — KES 80

All drinks freshly prepared and served cold or hot as preferred.`
  },

  // ── COMBO MEALS ────────────────────────────────────────────────────────────
  {
    category: 'menu_combos',
    content: `COMBO MEALS — Best Value Deals

• Shawarma Combo (Shawarma + Fries + Soda) — KES 600
• Burger Combo (Burger + Fries + Soda) — KES 750
• Biryani Combo (Biryani + Salad + Juice) — KES 850

Combo meals offer great savings compared to ordering items individually.`
  },

  // ── FOOD CATEGORIES ────────────────────────────────────────────────────────
  {
    category: 'menu_categories',
    content: `ALL FOOD CATEGORIES AVAILABLE AT FAVORITE RESTAURANT

The restaurant offers a wide variety of food across these categories:
1. Breakfast
2. Starters
3. Somali Cuisine
4. Indian Cuisine
5. Chinese Cuisine
6. Continental Dishes
7. Biryani & Pilau
8. Pasta
9. Fast Food
10. Burgers
11. Pizza
12. Sandwiches
13. Salads
14. Beverages

Ask about any category and we will share the available items and prices.`
  },

  // ── PAYMENT ────────────────────────────────────────────────────────────────
  {
    category: 'payment',
    content: `PAYMENT METHODS ACCEPTED

The restaurant accepts the following payment methods:
1. Cash (Kenyan Shillings — KES)
2. M-Pesa (mobile money)
3. Debit/Credit Cards (Visa, Mastercard)

All prices are in Kenyan Shillings (KES).`
  },

  // ── OPERATING HOURS ────────────────────────────────────────────────────────
  {
    category: 'hours',
    content: `OPERATING HOURS

Open DAILY (7 days a week):
Opening Time: 6:00 AM
Closing Time: 11:00 PM

Peak Hours (may have longer wait times — reservation recommended):
- Lunch peak: 12:00 PM – 3:00 PM
- Dinner peak: 7:00 PM – 9:00 PM

We recommend making a reservation during peak hours to guarantee your table.`
  },

  // ── LOCATION ───────────────────────────────────────────────────────────────
  {
    category: 'location',
    content: `LOCATION & HOW TO GET THERE

Restaurant Name: Favorite Restaurant
Address: Along Second Avenue, Near 12th Street, Eastleigh, Nairobi, Kenya

How to get there:
- By taxi: Tell the driver "Second Avenue near 12th Street, Eastleigh"
- By boda boda: Same directions apply
- Walking: Easily accessible on foot if you are in Eastleigh area

The restaurant is located along Second Avenue near 12th Street in Eastleigh, Nairobi.`
  },

  // ── DELIVERY ───────────────────────────────────────────────────────────────
  {
    category: 'delivery',
    content: `DELIVERY SERVICE INFORMATION

Delivery is available within Eastleigh and nearby areas.

HOW TO ORDER DELIVERY:
1. Call us or send a WhatsApp message
2. Tell us your order and your exact location/address
3. We confirm the order and estimated delivery time
4. Your food is delivered to you

DELIVERY DETAILS:
- Coverage area: Eastleigh and nearby areas
- Delivery time: Depends on distance and order size
- Delivery charges: May apply depending on location
- Payment: Cash on delivery or M-Pesa

We will call you to confirm your delivery order before preparing it.`
  },

  // ── FAQ ────────────────────────────────────────────────────────────────────
  {
    category: 'faq',
    content: `FREQUENTLY ASKED QUESTIONS

Q: What services do you offer?
A: We offer dine-in, takeaway, delivery, and reservation services.

Q: Can I reserve a table?
A: Yes, reservations are available. You can book right here in this chat, or contact us by phone or WhatsApp.

Q: Do you offer delivery?
A: Yes, delivery is available within Eastleigh and nearby areas. Place your order by phone or WhatsApp.

Q: What payment methods do you accept?
A: We accept cash, M-Pesa, and debit/credit card payments.

Q: What time do you open?
A: We are open daily from 6:00 AM to 11:00 PM.

Q: Do you serve Somali food?
A: Yes! We offer a variety of authentic Somali dishes including Beef Sukar (KES 800), Chicken Sukar (KES 750), Camel Meat/Hilib Geel (KES 1,000), and Anjero with Meat (KES 600).

Q: Is your food halal?
A: Yes, all our food is 100% halal.

Q: Do you have combo meals?
A: Yes! We have Shawarma Combo (KES 600), Burger Combo (KES 750), and Biryani Combo (KES 850).

Q: How do I make a reservation?
A: Just chat with me here and I will collect all your booking details. You need to book at least 1 hour in advance.

Q: What happens if I am late for my reservation?
A: Your table is held for 20 minutes after your agreed arrival time.`
  },

  // ── AI BEHAVIOR RULES ──────────────────────────────────────────────────────
  {
    category: 'ai_behavior',
    content: `AI ASSISTANT BEHAVIOR RULES

GREETING:
When a user starts a conversation, greet them with:
"Hello! Welcome to Favorite Restaurant. How can I assist you today?"

QUERY HANDLING:
- Menu questions → Return food categories + items with prices
- Price questions → Return relevant items with exact KES prices
- Reservation request → Start reservation collection flow (collect all 7 required fields)
- Location question → Return: "We are located along Second Avenue, near 12th Street, Eastleigh, Nairobi"
- Delivery question → Explain delivery process and coverage area
- Payment question → List all 3 methods: Cash, M-Pesa, Debit/Credit Cards
- Hours question → "We are open daily from 6:00 AM to 11:00 PM"

CONTEXT AWARENESS:
- Remember what the user has asked in this conversation
- Ask follow-up questions if information is missing
- Guide users step-by-step through reservations

SUPPORTED INTENTS:
- Ask about services
- Ask about menu
- Ask about prices
- Ask about combos
- Ask about location
- Ask about hours
- Ask about delivery
- Make reservation
- Modify reservation
- General inquiries

IF UNABLE TO ANSWER:
Say: "Great question! Let me connect you with our team. You can reach us via WhatsApp or phone."
Never make up information that is not in the knowledge base.`
  }

];

// ─────────────────────────────────────────────────────────────────────────────
// SEED FUNCTION
// ─────────────────────────────────────────────────────────────────────────────
async function seed() {
  console.log('🌱 Starting Favorite Restaurant knowledge base seed...\n');
  console.log('📄 Source: Official PDF Knowledge Base Document\n');

  // Wipe existing entries
  const { error: deleteError } = await supabase
    .from('knowledge_base')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');

  if (deleteError) {
    console.error('❌ Failed to clear knowledge_base:', deleteError.message);
    process.exit(1);
  }
  console.log('🗑  Cleared existing entries.');

  // Insert all entries
  const { data, error: insertError } = await supabase
    .from('knowledge_base')
    .insert(knowledgeBase)
    .select();

  if (insertError) {
    console.error('❌ Seed failed:', insertError.message);
    process.exit(1);
  }

  console.log(`\n✅ Successfully seeded ${data.length} knowledge base entries:\n`);
  data.forEach(r => console.log(`   ✔ ${r.category}`));
  console.log('\n🎉 Done! Your chatbot now knows everything about Favorite Restaurant.\n');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
