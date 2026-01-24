# Vercel Deployment Guide

## Environment Variables

Make sure to set these environment variables in your Vercel project settings:

### Required Variables:
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anon/public key

### Optional (for serverless functions):
- `SUPABASE_URL` - Alternative name for Supabase URL
- `SUPABASE_ANON_KEY` - Alternative name for Supabase anon key

## Build Configuration

- **Framework**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

## Cron Jobs

The keep-alive cron job is configured to run every 10 minutes:
- Path: `/api/cron/keep-alive`
- Schedule: `*/10 * * * *`

**Note**: Cron jobs require Vercel Pro plan. On free tier, the client-side `AutoKeepAlive` component will handle keep-alive.

## API Routes

API routes are located in the `/api` directory:
- `/api/cron/keep-alive.js` - Serverless function for keep-alive cron job

## Troubleshooting

### Build Errors
1. Ensure Node.js version is 18.x or higher
2. Check that all dependencies are in `package.json`
3. Verify build command: `npm run build`

### API Route Errors
1. Check environment variables are set in Vercel dashboard
2. Verify the API route file is in `/api/cron/keep-alive.js`
3. Check Vercel function logs for detailed error messages

### Cron Job Not Running
1. Verify you have Vercel Pro plan (required for cron jobs)
2. Check cron job configuration in Vercel dashboard
3. Review cron job logs in Vercel dashboard

