

# Plano: Correcoes Abrangentes — Perfil, Notificacoes, Stories/Lives, Documentos, Roles e Sincronismo

## Problemas Identificados

1. **Notificacoes — historico sumiu**: O `NotificationsPanel` tem botao "Ver todas as notificacoes" que apenas chama `onClose()` sem navegar para a aba `notifications`. A `NotificationsFullView` esta renderizada no Dashboard mas nao recebe navegacao do painel.

2. **Role do usuario nao atribuido**: A tabela `user_roles` esta vazia — o usuario `b6333d5f-fc76-4c7e-ab0b-c7b6f39b422b` nao tem nenhum papel. Botoes Aprovar/Rejeitar nunca aparecem.

3. **Stories & Lives — tudo mock**: `StoriesLivesView` usa dados hardcoded, botoes "Novo Story" e "Agendar Live" nao fazem nada. Nao ha persistencia.

4. **Documentos — tudo mock**: `DocumentsView` usa dados hardcoded, upload nao funciona, botoes de download/delete/visualizar nao fazem nada.

5. **Redes Sociais — falta sincronismo com criacao de post**: Ao criar post, as plataformas selecionadas nao mostram se estao conectadas ou nao.

6. **Perfil/Avatar**: Funciona no codigo mas usuario reporta que nao consegue trocar foto. Pode ser problema de bucket/CORS ou falta de feedback visual.

---

## Correcoes Planejadas

### 1. Atribuir papel 'admin' ao usuario atual
- INSERT na tabela `user_roles` para o usuario `b6333d5f-fc76-4c7e-ab0b-c7b6f39b422b` com role `admin`
- Isso habilita botoes Aprovar/Rejeitar no calendario

### 2. Auto-atribuicao de role padrao ao registrar
- Criar trigger `on_auth_user_created` que insere automaticamente role `journalist` para novos usuarios
- Migration SQL com funcao + trigger

### 3. Corrigir navegacao NotificationsPanel → aba Notificacoes
- `NotificationsPanel`: receber `onViewAll` callback como prop
- `Dashboard`: passar callback que seta `activeTab("notifications")` e fecha o painel
- Botao "Ver todas" no painel navega para a pagina completa de notificacoes

### 4. Stories & Lives — persistencia com banco
- Criar tabela `stories_lives` com colunas: id, user_id, type (story/live), platform, title, content, thumbnail_url, status, scheduled_at, completed_at, viewers, likes, comments, created_at
- RLS: usuarios so veem seus proprios dados
- Atualizar `StoriesLivesView` para CRUD real com formularios de criacao
- Habilitar realtime

### 5. Documentos — persistencia com storage
- Criar tabela `documents` com colunas: id, user_id, name, file_url, file_type, file_size, downloads, created_at
- RLS: usuarios so veem seus proprios documentos
- Atualizar `DocumentsView`: upload real para bucket `media`, download, delete, preview funcional

### 6. Indicar conexao das redes no CreatePostPanel
- No grid de plataformas do `CreatePostPanel`, mostrar badge de "conectado" ou "nao conectado"
- Receber `connections` como prop do Dashboard ou usar `useSocialConnections` diretamente

### 7. Garantir avatar upload funciona
- Verificar se o caminho `avatars/` no bucket `media` funciona corretamente
- Adicionar tratamento de erro mais claro no `SettingsView`

---

## Detalhes Tecnicos

### Migration 1 — Stories/Lives table
```sql
CREATE TABLE public.stories_lives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL DEFAULT 'story',
  platform text NOT NULL,
  title text NOT NULL,
  content text,
  thumbnail_url text,
  media_url text,
  status text NOT NULL DEFAULT 'draft',
  scheduled_at timestamptz,
  completed_at timestamptz,
  viewers integer DEFAULT 0,
  likes integer DEFAULT 0,
  comments integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.stories_lives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own stories_lives" ON public.stories_lives FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own stories_lives" ON public.stories_lives FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own stories_lives" ON public.stories_lives FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own stories_lives" ON public.stories_lives FOR DELETE TO authenticated USING (auth.uid() = user_id);
```

### Migration 2 — Documents table
```sql
CREATE TABLE public.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  file_url text NOT NULL,
  file_type text NOT NULL DEFAULT 'other',
  file_size integer DEFAULT 0,
  downloads integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own documents" ON public.documents FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own documents" ON public.documents FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own documents" ON public.documents FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own documents" ON public.documents FOR DELETE TO authenticated USING (auth.uid() = user_id);
```

### Migration 3 — Auto-assign journalist role trigger
```sql
CREATE OR REPLACE FUNCTION public.assign_default_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'journalist');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_assign_role
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_default_role();
```

### Data insert — Assign admin role to current user
```sql
INSERT INTO user_roles (user_id, role) VALUES ('b6333d5f-fc76-4c7e-ab0b-c7b6f39b422b', 'admin');
```

### Arquivos editados:
- `src/components/dashboard/NotificationsPanel.tsx` — adicionar `onViewAll` prop
- `src/pages/Dashboard.tsx` — passar `onViewAll` ao NotificationsPanel
- `src/components/dashboard/StoriesLivesView.tsx` — reescrever com CRUD real
- `src/components/dashboard/DocumentsView.tsx` — reescrever com CRUD real
- `src/components/dashboard/CreatePostPanel.tsx` — mostrar status de conexao das plataformas

