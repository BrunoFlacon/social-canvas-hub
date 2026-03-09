

# Plan: CRUD de Credenciais por Plataforma na Aba APIs

## Objetivo
Transformar a aba "APIs" em Configurações para que cada plataforma tenha um painel expansível com campos específicos de credenciais, permitindo criar, visualizar, editar e remover credenciais diretamente pela interface.

## Credenciais por Plataforma

| Plataforma | Campos |
|---|---|
| Facebook | App ID, App Secret |
| Instagram | App ID, App Secret (usa Meta) |
| Threads | App ID, App Secret (usa Meta) |
| WhatsApp Business | App ID, App Secret (usa Meta) |
| X (Twitter) | Consumer Key, Consumer Secret |
| YouTube | Client ID, Client Secret (usa Google) |
| Google API | Client ID, Client Secret |
| LinkedIn | Client ID, Client Secret |
| TikTok | Client Key, Client Secret |
| Pinterest | App ID, App Secret |
| Telegram | Bot Token |
| Snapchat | Client ID, Client Secret |
| Website | URL do site (campo simples, sem OAuth) |

## Nova Tabela: `api_credentials`

```sql
CREATE TABLE public.api_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  platform text NOT NULL,
  credentials jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, platform)
);

ALTER TABLE public.api_credentials ENABLE ROW LEVEL SECURITY;

-- RLS policies (PERMISSIVE)
CREATE POLICY "creds_select" ON public.api_credentials AS PERMISSIVE FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "creds_insert" ON public.api_credentials AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "creds_update" ON public.api_credentials AS PERMISSIVE FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "creds_delete" ON public.api_credentials AS PERMISSIVE FOR DELETE TO authenticated USING (auth.uid() = user_id);
```

The `credentials` JSONB column stores platform-specific key-value pairs (e.g. `{"app_id": "...", "app_secret": "..."}`).

## Changes to SettingsView.tsx

1. **New hook `useApiCredentials`** — CRUD operations on `api_credentials` table
2. **Expandable platform cards** — clicking a platform expands it to show:
   - Credential input fields specific to that platform (masked by default, toggle to show)
   - Save / Update / Delete buttons
   - Connection status badge
   - "Conectar" button (existing OAuth flow, only enabled after credentials are saved)
3. **Platform credential config map** — defines which fields each platform needs

## UI Flow
1. User clicks a platform card → it expands showing credential fields
2. User fills in credentials → clicks "Salvar Credenciais"
3. Credentials are upserted to `api_credentials` table
4. "Conectar" button becomes active → triggers existing OAuth flow
5. User can edit (update) or remove (delete) credentials
6. Saved credentials show as masked values (••••••) with eye toggle

## New Hook: `src/hooks/useApiCredentials.ts`
- `fetchCredentials()` — loads all user credentials
- `saveCredentials(platform, data)` — upsert
- `deleteCredentials(platform)` — delete
- Returns `{ credentials, loading, save, remove }`

## Edge Function Update: `social-oauth-init`
- Before building OAuth URL, check `api_credentials` table for user-provided credentials
- Use user credentials if available, fall back to env secrets

## Files Modified
1. **New**: `src/hooks/useApiCredentials.ts`
2. **Modified**: `src/components/dashboard/SettingsView.tsx` — rebuild API tab with expandable CRUD cards
3. **New migration**: Create `api_credentials` table
4. **Modified**: `supabase/functions/social-oauth-init/index.ts` — read user credentials from DB

