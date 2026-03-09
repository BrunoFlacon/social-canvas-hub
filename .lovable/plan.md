

## Analysis

Three critical issues identified:

1. **All RLS policies are RESTRICTIVE** — Every table has `Permissive: No`, which means data queries return empty results. This is the root cause of documents not displaying, channels not loading, and calendar being empty.

2. **No edit channel functionality** — `MessagingView.tsx` only has `handleAddChannel` (INSERT) and `handleDelete`. There's no state or handler for editing an existing channel.

3. **Calendar depends on `posts` prop** — CalendarView receives posts from parent and also fetches messages/stories. If RLS blocks queries, nothing shows.

## Plan

### Step 1: Fix RLS policies (database migration)

Run a single migration to drop all RESTRICTIVE policies and recreate them as PERMISSIVE across all tables: `contacts`, `documents`, `media`, `messages`, `messaging_channels`, `notifications`, `scheduled_posts`, `stories_lives`, `profiles`, `oauth_states`, `social_connections`.

Each table gets 4 PERMISSIVE policies (SELECT/INSERT/UPDATE/DELETE) using `auth.uid() = user_id`. `user_roles` keeps its SELECT-only policy but made PERMISSIVE.

### Step 2: Add channel edit CRUD to MessagingView.tsx

- Add `editingChannel` state (`MessagingChannel | null`)
- Add `handleEditChannel(channel)` that populates the form fields and opens the dialog
- Modify `handleAddChannel` → `handleSaveChannel` to check if `editingChannel` exists:
  - If yes: UPDATE the existing row
  - If no: INSERT a new row
- Reset `editingChannel` on dialog close
- Add an "Edit" button to each channel card (next to the existing delete button)
- Update dialog title to show "Editar Canal" vs "Adicionar Canal"

### Step 3: Verify Documents display

After RLS fix, `DocumentsView.tsx` fetch query will return data. No code changes needed — the component already renders documents correctly when data is returned.

### Step 4: Verify Calendar display

After RLS fix, `CalendarView` will receive posts from the parent hook and its own messages/stories queries will return data. No code changes needed.

## Technical Details

```sql
-- Pattern for each table (repeated for all 11 tables):
DROP POLICY IF EXISTS "policy_name" ON public.table_name;
CREATE POLICY "policy_name" ON public.table_name
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
-- Same for INSERT (WITH CHECK), UPDATE (USING), DELETE (USING)
```

```typescript
// MessagingView.tsx - new state
const [editingChannel, setEditingChannel] = useState<MessagingChannel | null>(null);

// Unified save handler
const handleSaveChannel = async () => {
  const channelData = { platform, channel_name, channel_id, channel_type, members_count };
  if (editingChannel) {
    await supabase.from("messaging_channels").update(channelData).eq("id", editingChannel.id);
  } else {
    await supabase.from("messaging_channels").insert({ user_id: user.id, ...channelData });
  }
};
```

