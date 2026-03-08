

# Plano: Melhorias Abrangentes — Notificacoes, Stories Multi-Rede, Mensageria e Fluxo Editorial

## Escopo e Priorizacao

A solicitacao abrange muitas funcionalidades. Vou priorizar as que agregam mais valor e sao viaveis:

1. **Notificacoes — garantir que o historico funcione** (ja funciona no codigo, pode ser questao de dados vazios)
2. **Stories & Lives multi-rede** — permitir selecionar varias redes ao criar story/live
3. **Nova aba de Mensageria** — WhatsApp, Telegram, grupos Facebook, canais Instagram
4. **Fluxo editorial no calendario** — ja implementado, verificar se admin role foi inserido
5. **Upload funcional em todos os campos** — ja funciona, revisar edge cases

Itens como "transformar imagens horizontais para vertical sem cortar foco" e "abrir lives diretamente" requerem servicos externos de processamento de video/imagem que estao fora do escopo atual.

---

## Passo 1: Inserir role admin para o usuario atual

O usuario `b6333d5f-fc76-4c7e-ab0b-c7b6f39b422b` precisa ter role `admin` para ver botoes Aprovar/Rejeitar. Vou usar o insert tool para garantir que o registro existe (com ON CONFLICT para evitar duplicatas).

---

## Passo 2: Stories & Lives — suporte multi-rede

**Problema atual**: O formulario de criacao so permite selecionar UMA plataforma. O usuario quer publicar em varias redes simultaneamente.

**Solucao**:
- Alterar `StoriesLivesView.tsx`: trocar `formPlatform` (string) por `formPlatforms` (string[])
- Alterar a tabela `stories_lives`: mudar `platform` de `text` para `text[]` (array), ou criar um registro por plataforma
- Abordagem mais simples: criar um registro separado para cada plataforma selecionada (sem alterar schema)
- Adicionar checkboxes de plataformas no dialog de criacao em vez de Select unico

---

## Passo 3: Nova aba — Mensageria (WhatsApp, Telegram, Grupos)

**Nova aba no Sidebar**: "Mensagens" com icone MessageCircle

**Funcionalidades**:
- Lista de canais/grupos configurados (WhatsApp, Telegram, Facebook Groups, canais Instagram)
- Formulario para adicionar novo canal/grupo (nome, plataforma, identificador)
- Criacao de conteudo direcionado para esses canais
- Lista de transmissao e envio individual

**Tabela nova**: `messaging_channels`
- id, user_id, platform, channel_name, channel_id, channel_type (group/broadcast/individual/community), created_at

**Componente novo**: `MessagingView.tsx`
- CRUD de canais
- Criacao e agendamento de mensagens para canais selecionados

---

## Passo 4: Garantir historico de notificacoes visivel

O codigo do `NotificationsFullView` e `NotificationContext` ja estao corretos — persistem no banco e carregam com realtime. O problema pode ser:
- Nenhuma notificacao foi criada ainda (tabela vazia)
- Vou inserir uma notificacao de boas-vindas para o usuario atual como seed

---

## Passo 5: Sincronizar tipos de conteudo entre abas

No `CreatePostPanel`, os media types ja incluem story e live. Vou garantir que ao criar um story/live via CreatePost, ele tambem apareca na aba Stories & Lives (usando a mesma tabela `stories_lives`).

---

## Detalhes Tecnicos

### Migration — Tabela messaging_channels
```sql
CREATE TABLE public.messaging_channels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  platform text NOT NULL,
  channel_name text NOT NULL,
  channel_id text,
  channel_type text NOT NULL DEFAULT 'group',
  members_count integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.messaging_channels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own channels" ON public.messaging_channels FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own channels" ON public.messaging_channels FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own channels" ON public.messaging_channels FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own channels" ON public.messaging_channels FOR DELETE TO authenticated USING (auth.uid() = user_id);
```

### Data inserts
```sql
-- Admin role
INSERT INTO user_roles (user_id, role) VALUES ('b6333d5f-fc76-4c7e-ab0b-c7b6f39b422b', 'admin') ON CONFLICT DO NOTHING;

-- Welcome notification
INSERT INTO notifications (user_id, type, title, message) VALUES ('b6333d5f-fc76-4c7e-ab0b-c7b6f39b422b', 'info', 'Bem-vindo ao SocialHub!', 'Seu painel está pronto. Conecte suas redes sociais e comece a publicar.');
```

### Arquivos editados:
- `src/components/dashboard/Sidebar.tsx` — adicionar aba "Mensagens"
- `src/components/dashboard/StoriesLivesView.tsx` — multi-plataforma no dialog de criacao
- `src/pages/Dashboard.tsx` — registrar aba "messaging", passar dados

### Arquivos novos:
- `src/components/dashboard/MessagingView.tsx` — CRUD canais + envio de mensagens

### Resumo das mudancas:
1. Insert admin role + notificacao seed
2. Migration para `messaging_channels`
3. `StoriesLivesView` — checkbox multi-rede em vez de select unico
4. Nova `MessagingView` com gestao de canais/grupos/listas de transmissao
5. `Sidebar` + `Dashboard` — nova aba Mensagens

