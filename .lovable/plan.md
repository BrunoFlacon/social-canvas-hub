

# Plano: Corrigir Perfil, Notificacoes, Calendario e Adicionar Papeis de Usuario

## Problemas Identificados

### 1. Foto de perfil nao funciona
- O botao de camera em `SettingsView.tsx` nao faz nada (nenhum handler)
- O `Header.tsx` mostra apenas a inicial do email, nunca exibe `avatar_url` do perfil
- `updateProfile` no `AuthContext` nao salva `bio` nem `avatar_url` corretamente (so envia `name`)

### 2. Botao de configuracoes no sidebar
- O botao de "Sair" no `Sidebar.tsx` (linha 136) nao chama `logout()` — e apenas um botao vazio

### 3. Notificacoes
- O `NotificationsPanel` usa dados em memoria do `NotificationContext` (state local)
- A pagina "Notificações" no dashboard (case "notifications") esta vazia — so mostra titulo
- Nao ha persistencia de notificacoes no banco de dados
- Nao ha notificacoes automaticas quando posts mudam de status (aprovacao/rejeicao)

### 4. Papeis de usuario (jornalista/editor)
- Nao existe tabela `user_roles` — qualquer usuario pode aprovar/rejeitar posts
- Necessario criar tabela + enum + funcao `has_role` + RLS

---

## Correcoes Planejadas

### Passo 1: Criar tabela `notifications` no banco
- Tabela para persistir notificacoes com tipo, titulo, mensagem, plataforma, read, user_id
- Habilitar realtime para atualizacao instantanea
- RLS: usuarios so veem suas proprias notificacoes

### Passo 2: Criar tabela `user_roles` e funcao `has_role`
- Enum `app_role` com valores `admin`, `editor`, `journalist`
- Tabela `user_roles` com `user_id` + `role`
- Funcao `has_role` security definer para verificar papeis sem recursao RLS
- Atribuir role `admin` ao primeiro usuario (ou via migration)

### Passo 3: Corrigir upload de avatar no perfil
- **SettingsView.tsx**: Adicionar input file hidden + handler que faz upload para o bucket `media` e salva `avatar_url` no perfil
- **SettingsView.tsx**: Chamar `updateProfile({ name, bio, avatar_url })` ao salvar (atualmente so salva `name`)
- **AuthContext.tsx**: Garantir que `updateProfile` aceita e salva `bio` e `avatar_url`

### Passo 4: Exibir avatar no Header
- **Header.tsx**: Usar componente `Avatar` com `profile?.avatar_url` como imagem, fallback para inicial do nome/email

### Passo 5: Corrigir botao Sair no Sidebar
- **Sidebar.tsx**: Receber `onLogout` como prop, chamar `logout()` do AuthContext no Dashboard e passar

### Passo 6: Refatorar NotificationContext para usar banco de dados
- **NotificationContext.tsx**: `addNotification` insere no banco via supabase
- `notifications` sao carregadas do banco com realtime subscription
- `markAsRead`, `markAllAsRead`, `removeNotification`, `clearAll` operam via supabase
- Manter compatibilidade com `useNotifications()` existente

### Passo 7: Pagina de notificacoes completa no Dashboard
- **Dashboard.tsx** case "notifications": Renderizar lista completa de notificacoes com filtros (lidas/nao lidas/todas), usando dados do `NotificationContext`

### Passo 8: Notificacoes automaticas no fluxo editorial
- Quando um post e enviado para aprovacao (`submitForApproval`), criar notificacao para editores
- Quando um post e aprovado/rejeitado, criar notificacao para o autor
- Integrar no `useScheduledPosts` ou via trigger no banco

### Passo 9: Restringir aprovacao/rejeicao a editores
- No `CalendarView.tsx`, verificar role do usuario antes de mostrar botoes "Aprovar"/"Rejeitar"
- No `useScheduledPosts`, validar role antes de executar `approvePost`/`rejectPost`
- Criar hook `useUserRole` que busca role do usuario logado

---

## Detalhes Tecnicos

### Migracao SQL (2 migrations):

**Migration 1 — Notificacoes:**
```sql
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL DEFAULT 'info',
  title text NOT NULL,
  message text NOT NULL,
  platform text,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notifications" ON public.notifications FOR DELETE TO authenticated USING (auth.uid() = user_id);

ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
```

**Migration 2 — User Roles:**
```sql
CREATE TYPE public.app_role AS ENUM ('admin', 'editor', 'journalist');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;
```

### Arquivos editados:
- `src/components/dashboard/SettingsView.tsx` — upload avatar + salvar bio
- `src/components/dashboard/Header.tsx` — exibir avatar do perfil
- `src/components/dashboard/Sidebar.tsx` — botao sair funcional
- `src/pages/Dashboard.tsx` — passar logout, renderizar pagina notificacoes completa
- `src/contexts/NotificationContext.tsx` — persistir no banco com realtime
- `src/contexts/AuthContext.tsx` — garantir updateProfile salva bio/avatar
- `src/hooks/useUserRole.ts` (novo) — hook para verificar role do usuario
- `src/hooks/useScheduledPosts.ts` — notificacoes automaticas no fluxo editorial
- `src/components/dashboard/CalendarView.tsx` — condicionar botoes aprovar/rejeitar a role editor/admin

### Arquivos novos:
- `src/hooks/useUserRole.ts`

