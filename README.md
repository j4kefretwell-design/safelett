# SafeLett

Property compliance tracking for UK property managers. Built with Next.js and Supabase.

## Features

- Email/password authentication via Supabase Auth
- Dashboard with compliance overview and traffic-light status per property
- Add and manage properties (address, type, bedrooms)
- Track compliance certificates (Gas Safety, EICR, EPC, and more)
- Automatic status calculation: green (valid), amber (expiring within 60 days), red (expired or expiring within 30 days)

## Prerequisites

- [Node.js](https://nodejs.org/) 18.18 or later
- A [Supabase](https://supabase.com) account

## Step 1: Install dependencies

```bash
cd Safelett
npm install
```

## Step 2: Create a Supabase project

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **New project**
3. Choose an organisation, name the project (e.g. `safelett`), set a database password, and select **London (eu-west-2)** for UK users
4. Wait for the project to finish provisioning

## Step 3: Set up the database

1. In your Supabase dashboard, open **SQL Editor**
2. Click **New query**
3. Copy the entire contents of `supabase/schema.sql` and paste it into the editor
4. Click **Run**

This creates the `properties` and `certificates` tables with row-level security so each user only sees their own data.

## Step 4: Configure authentication

1. Go to **Authentication → Providers → Email**
2. Ensure **Email** is enabled
3. For local development, you may want to disable **Confirm email** temporarily (re-enable for production)

4. Go to **Authentication → URL Configuration**
5. Set **Site URL** to `http://localhost:3000`
6. Add `http://localhost:3000/**` to **Redirect URLs**

## Step 5: Connect the app to Supabase

1. In Supabase, go to **Project Settings → API**
2. Copy the **Project URL** and **anon public** key
3. Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

You can also copy `.env.example` and fill in your values:

```bash
cp .env.example .env.local
```

## Step 6: Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), sign up for an account, and start adding properties and certificates.

## Deploying to production

1. Deploy the app on [Vercel](https://vercel.com) (or another host)
2. Add the same environment variables in your hosting dashboard
3. In Supabase **Authentication → URL Configuration**, update:
   - **Site URL** to your production URL (e.g. `https://safelett.vercel.app`)
   - **Redirect URLs** to include your production URL

## Project structure

```
src/
├── app/
│   ├── dashboard/          # Compliance overview
│   ├── login/              # Sign in
│   ├── signup/             # Create account
│   └── properties/
│       ├── new/            # Add property form
│       └── [id]/
│           ├── page.tsx    # Property detail + certificates
│           └── certificates/new/  # Add certificate form
├── components/             # UI components
└── lib/
    ├── compliance.ts     # Status calculation logic
    ├── types.ts            # TypeScript types
    └── supabase/           # Supabase client setup
```

## Compliance status rules

| Status | Condition |
|--------|-----------|
| Green  | All certificates expire more than 60 days from today |
| Amber  | At least one certificate expires within 60 days (and none are red) |
| Red    | At least one certificate is expired or expires within 30 days |

Properties with no certificates are treated as needing attention (red).
