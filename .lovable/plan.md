

# Status and Plan

## 1. RLS Policies ✅ FIXED
All 43 policies across all tables are confirmed **PERMISSIVE** in the live database. Documents, calendar, and messaging channels will now return data correctly. No action needed.

## 2. Social Platforms Ready to Connect
Based on the configured secrets, these platforms are ready **without additional setup**:

| Platform | Status | Secret Required |
|----------|--------|----------------|
| Facebook | Ready | META_APP_ID + META_APP_SECRET ✅ |
| Instagram | Ready | META_APP_ID + META_APP_SECRET ✅ |
| Threads | Ready | META_APP_ID ✅ |
| WhatsApp | Ready | META_APP_ID ✅ |
| YouTube | Ready | GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET ✅ |
| Google | Ready | GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET ✅ |
| Twitter/X | Ready | TWITTER_CONSUMER_KEY + TWITTER_CONSUMER_SECRET ✅ |
| LinkedIn | Needs setup | LINKEDIN_CLIENT_ID missing |
| TikTok | Needs setup | TIKTOK_CLIENT_KEY missing |
| Pinterest | Needs setup | PINTEREST_APP_ID missing |
| Telegram | Needs setup | TELEGRAM_BOT_TOKEN missing |
| Snapchat | Needs setup | SNAPCHAT_CLIENT_ID missing |

**7 platforms ready**, 5 need additional API keys.

## 3. Telegram Bot Token
Add the `TELEGRAM_BOT_TOKEN` secret using the secrets tool. No code changes needed — the edge function already checks for this env var.

## 4. Testing Post Creation & Editorial Flow
No code changes needed — everything is already implemented. The editorial flow works as:
1. Create post in "Criar Post" panel → saves as `draft`
2. Click "Enviar para Aprovação" → status becomes `pending_approval`
3. Editor clicks "Aprovar" or "Rejeitar" in calendar detail dialog
4. Calendar shows status-specific icons (orange clock for pending, green check for published, etc.)

## Actions to Take
1. **Add Telegram Bot Token** via the secrets tool
2. No code changes required — all features are implemented and RLS is fixed

