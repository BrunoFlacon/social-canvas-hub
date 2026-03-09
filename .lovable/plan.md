# Plan: Fix OAuth, RLS, Callback Credentials & Data Display

continue e termine  o andamento dos planos de trabalhos anteriores e inicie e termine de executar este atual plano de trabalho

## Issues Found

### 1. RLS Policies STILL RESTRICTIVE (Critical)

ALL tables show `Permissive: No` in the database schema. The previous migration either failed or new restrictive policies were created on top. This blocks ALL data operations — credentials, posts, connections, documents, media, messages.

**Fix**: New migration to drop ALL existing policies and recreate them as `AS PERMISSIVE`.

### 2. OAuth Callback Ignores User Credentials (Causes INVALID_APP_ID)

The `social-oauth-init` was updated to read from `api_credentials` table, but `social-oauth-callback` still hardcodes `Deno.env.get("META_APP_ID")` etc. When a user saves their own App ID in the UI and clicks "Conectar", the init function correctly uses their App ID to build the OAuth URL. But when Facebook redirects back, the callback uses the ENV secret (which may differ or be missing), causing `PLATFORM__INVALID_APP_ID`.

**Fix**: Update `social-oauth-callback` to fetch user credentials from `api_credentials` table and use them for token exchange, falling back to env vars.

### 3. Profile Photo & Follower Count Not Displayed

The social connections UI only shows `page_name`. Need to store and display `profile_image_url` and fetch basic stats from connected platforms.

**Fix**: 

- Add `profile_image_url` column to `social_connections` table
- Update callback functions to fetch profile image URLs from each platform's API
- Update SettingsView to display the avatar and connection details

### 4. Calendar Not Showing Posts by Date

The calendar already has post display logic. Need to verify it loads correctly once RLS is fixed.

## Implementation Steps

### Step 1: Migration — Fix ALL RLS to PERMISSIVE + Add profile_image_url column

Single migration that:

- Drops and recreates ALL policies as PERMISSIVE across all 12 tables
- Adds `profile_image_url text` column to `social_connections`

### Step 2: Update `social-oauth-callback` Edge Function

- At the start, fetch user's credentials from `api_credentials` table
- Create a `getCredential(userKey, envKey)` helper (same pattern as `social-oauth-init`)
- Pass user credentials to each `exchange*()` function instead of reading env vars directly
- Fetch profile image URL from each platform API during token exchange
- Store `profile_image_url` in `social_connections` upsert

### Step 3: Update SettingsView API Tab

- Show platform profile image (avatar) next to connected platform name
- Display `page_name` and connection status more prominently
- Show token expiration info

### Step 4: Redeploy both edge functions

- `social-oauth-init` (already updated, just redeploy)
- `social-oauth-callback` (with new credential reading logic)

## Files Modified

1. **New migration**: Fix RLS + add `profile_image_url` column
2. **Modified**: `supabase/functions/social-oauth-callback/index.ts` — read user credentials from DB
3. **Modified**: `src/components/dashboard/SettingsView.tsx` — show profile avatar for connected platforms