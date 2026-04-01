# Favorite Restaurant — AI Chatbot

Production-ready AI chatbot for **Favorite Restaurant**, Eastleigh, Nairobi. Built with Node.js, OpenAI GPT-4o, Supabase, and deployed on Vercel.

---

## Quick Start

### 1. Set Up Supabase Tables
1. Go to your [Supabase project](https://supabase.com/dashboard)
2. Click **SQL Editor** → **New query**
3. Copy-paste the entire contents of `supabase-schema.sql`
4. Click **Run**

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your values:
```bash
cp .env.example .env
```

Required variables:
```
OPENAI_API_KEY=sk-...
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
ADMIN_PASSWORD=YourSecurePasswordHere
```

### 4. Seed the Knowledge Base
```bash
npm run seed
```
This loads all restaurant data (menus, FAQs, policies) into your Supabase `knowledge_base` table.

### 5. Run Locally
```bash
npm run dev
```
Visit `http://localhost:3000`

---

## Deploy to Vercel

### First-time deployment
```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### Set Environment Variables in Vercel
Go to your Vercel project → **Settings** → **Environment Variables** and add:
- `OPENAI_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_PASSWORD`

Or use CLI:
```bash
vercel env add OPENAI_API_KEY
vercel env add SUPABASE_URL
vercel env add SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add ADMIN_PASSWORD
```

After adding env vars, redeploy:
```bash
vercel --prod
```

---

## Embed the Chat Widget

Add this single line to **any website**:

```html
<script src="https://YOUR-VERCEL-URL.vercel.app/widget.js"></script>
```

That's it. The chat bubble will appear in the bottom-right corner of the host website, fully connected to your live API.

---

## Pages & Endpoints

| URL | Description |
|-----|-------------|
| `/` | Demo landing page with live chat widget |
| `/admin` | Admin dashboard (password protected) |
| `/widget.js` | Embeddable chat widget script |
| `POST /api/chat` | Main chat endpoint |
| `GET /api/reservations` | List reservations (admin) |
| `PATCH /api/reservations` | Update reservation status (admin) |
| `GET /api/conversations` | List chat sessions (admin) |
| `GET /api/stats` | Dashboard stats (admin) |
| `GET/POST/PATCH/DELETE /api/knowledge` | Manage knowledge base (admin) |
| `POST /api/contact` | Contact form submission |

---

## Admin Dashboard

Visit `/admin` and enter your `ADMIN_PASSWORD`.

**Features:**
- Stats cards (messages today, reservations, unique visitors)
- Reservations table with status updates (pending → confirmed → cancelled)
- Filter reservations by date and status
- Export reservations to CSV
- Chat session browser with full message history
- Knowledge base editor (add, edit, delete entries)

---

## Project Structure

```
├── api/
│   ├── chat.js           # Main chat endpoint (GPT-4o + reservation logic)
│   ├── reservations.js   # Reservation CRUD
│   ├── conversations.js  # Chat history
│   ├── stats.js          # Dashboard stats
│   ├── knowledge.js      # Knowledge base CRUD
│   └── contact.js        # Contact form
├── public/
│   ├── index.html        # Demo landing page
│   ├── admin.html        # Admin dashboard
│   └── widget.js         # Embeddable chat widget
├── scripts/
│   └── seed.js           # Knowledge base seeder
├── supabase-schema.sql   # Database schema + RLS policies
├── vercel.json
├── package.json
└── .env.example
```

---

## Admin Password

Default admin password set during build: **`FavRest@Admin2024`**

**Change it:** Update the `ADMIN_PASSWORD` environment variable in Vercel dashboard.

---

## Re-seeding the Knowledge Base

If you update restaurant info, edit `scripts/seed.js` then re-run:
```bash
npm run seed
```

---

## Tech Stack

- **Runtime:** Node.js 18+
- **AI Model:** OpenAI GPT-4o
- **Database:** Supabase (PostgreSQL)
- **Frontend:** Vanilla HTML/CSS/JS (zero frameworks)
- **Hosting:** Vercel Serverless Functions
- **Version Control:** GitHub
