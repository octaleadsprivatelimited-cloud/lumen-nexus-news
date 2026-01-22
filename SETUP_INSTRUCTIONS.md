# Setup Instructions for 9knowledge News Portal

## Step 1: Create Database Tables in Supabase

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **New query**
5. Open the file `supabase/create-tables.sql` from this project
6. Copy the entire contents
7. Paste into the SQL Editor
8. Click **Run** (or press Ctrl+Enter)

This will create all necessary tables including:
- `articles` table
- `categories` table
- `tags` table
- And other required tables

## Step 2: Add Demo Content (Optional)

1. In Supabase SQL Editor, create a new query
2. Open the file `supabase/seed-demo-content.sql`
3. Copy and paste into SQL Editor
4. Click **Run**

This will insert sample articles and categories.

## Step 3: Restart Development Server

**IMPORTANT**: After creating tables, you MUST restart your dev server to load environment variables:

```bash
# Stop the current server (Ctrl+C in terminal)
# Then restart:
npm run dev
```

## Step 4: Verify Connection

1. Open your browser to http://localhost:8080
2. Open Developer Tools (F12)
3. Check the Console tab
4. You should see:
   - ✅ Supabase environment variables loaded successfully
   - ✅ Supabase client initialized successfully
   - ✅ Supabase articles table connection test successful

## Troubleshooting

### Error: "Could not find the table 'public.articles'"
**Solution**: Run `supabase/create-tables.sql` in Supabase SQL Editor

### Error: Environment variables not loading
**Solution**: 
1. Make sure `.env` file is in the root directory
2. Restart the dev server (stop and run `npm run dev` again)
3. Check that variables start with `VITE_`

### Error: "permission denied" or RLS policy error
**Solution**: The `create-tables.sql` script includes RLS policies. Make sure you ran the complete script.

## Files to Run in Supabase SQL Editor (in order):

1. `supabase/create-tables.sql` - Creates all tables and policies
2. `supabase/seed-demo-content.sql` - Adds demo articles (optional)

