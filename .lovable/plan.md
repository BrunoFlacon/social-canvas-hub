

# Plano: Mensageria Avançada, Chat, Histórico e Conexões Sociais

## Visão Geral

O pedido abrange 4 grandes áreas: (1) expandir o sistema de mensageria com canais de transmissão específicos por rede, envio individual e chat, (2) persistir mensagens enviadas no banco com vínculo ao calendário, (3) adicionar tela de chat/histórico, e (4) expandir o OAuth para mais redes sociais.

---

## 1. Expandir Plataformas de Mensageria

**Problema**: Atualmente só existem 4 plataformas fixas (WhatsApp, Telegram, Facebook, Instagram). Faltam tipos específicos por rede (canais de transmissão no WhatsApp, canais no Facebook, etc.) e campo para redes customizadas.

**Solução**:
- Expandir `messagingPlatforms` no `MessagingView.tsx` para incluir subtipos corretos:
  - WhatsApp: Grupos, Listas de Transmissão, Comunidades, Individual (número de telefone)
  - Facebook: Grupos, Canais de Transmissão
  - Instagram: Canais de Transmissão apenas
  - Telegram: Grupos, Canais, Comunidades, Individual (username/número)
- Adicionar opção "Outra rede" com campo de texto livre para nome da plataforma
- Adicionar campo de número de telefone para envios individuais (WhatsApp/Telegram)
- No dialog "Adicionar Canal", filtrar tipos válidos por plataforma selecionada

---

## 2. Persistir Mensagens no Banco — Tabela `messages`

**Nova tabela**:
```sql
CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  channel_id uuid REFERENCES public.messaging_channels(id) ON DELETE SET NULL,
  content text NOT NULL,
  media_url text,
  status text NOT NULL DEFAULT 'draft', -- draft, scheduled, sent, failed
  scheduled_at timestamptz,
  sent_at timestamptz,
  recipient_phone text, -- para envios individuais
  recipient_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);
-- RLS: users see own messages only
-- Enable realtime
```

Isso permite rascunhos, agendamentos e histórico de mensagens enviadas, vinculados ao calendário.

---

## 3. Tela de Chat / Histórico de Mensagens

**Novo componente**: Seção dentro de `MessagingView` com abas:
- **Canais** (atual): CRUD de canais/grupos
- **Compor**: formulário para escrever e agendar mensagens (com seleção de canais/individuais)
- **Histórico**: lista de todas as mensagens enviadas, estilo chat (balões), agrupadas por canal, com filtros por status (rascunho/agendada/enviada)

O histórico mostrará as mensagens do banco em formato de conversa similar ao WhatsApp/Telegram, com timestamp, status e conteúdo.

---

## 4. Expandir OAuth para Mais Redes

**Problema**: Atualmente o `social-oauth-init` só suporta Facebook, Instagram, Google, YouTube e Twitter. LinkedIn, TikTok, Pinterest, Snapchat, Threads, WhatsApp e Telegram não têm OAuth implementado.

**Realidade das APIs**:
- **LinkedIn**: Tem OAuth 2.0 padrão — implementável
- **TikTok**: Tem OAuth 2.0 (TikTok Login Kit) — implementável, requer app ID e secret
- **Pinterest**: Tem OAuth 2.0 — implementável, requer app ID e secret
- **WhatsApp Business**: Usa Meta Business API (mesmo META_APP_ID) — implementável via Graph API
- **Telegram**: Usa Bot API com token — não é OAuth, mas pode-se conectar via Bot Token
- **Snapchat**: Tem Snap Kit OAuth — requer credenciais próprias
- **Threads**: Usa Meta Graph API — implementável com mesmo META_APP_ID

**Solução pragmática**:
- Adicionar suporte OAuth no `social-oauth-init` para: LinkedIn, TikTok, Pinterest, Threads (via Meta)
- Para WhatsApp: usar Meta Business API (mesmo app Meta), com campo para WhatsApp Business Phone Number ID
- Para Telegram: adicionar campo para Bot Token (não é OAuth)
- Para Snapchat: marcar como "requer credenciais adicionais" e solicitar secrets quando o usuário tentar conectar
- Para "Website": não requer conexão OAuth

**Secrets necessários** (novos):
- `LINKEDIN_CLIENT_ID` e `LINKEDIN_CLIENT_SECRET`
- `TIKTOK_CLIENT_KEY` e `TIKTOK_CLIENT_SECRET`
- `PINTEREST_APP_ID` e `PINTEREST_APP_SECRET`

Para esses, solicitarei ao usuário que configure antes de prosseguir com a implementação.

---

## 5. Vincular Mensagens ao Calendário

As mensagens agendadas (status `scheduled`) aparecerão no `CalendarView` junto com os posts. Isso requer:
- Buscar `messages` com `scheduled_at` no mês visível
- Exibir no calendário com ícone diferenciado (MessageCircle)
- Ao clicar, abrir o detalhe da mensagem

---

## Arquivos Editados/Criados

### Migrations:
1. Tabela `messages` com RLS + realtime

### Arquivos editados:
- `src/components/dashboard/MessagingView.tsx` — reescrever com 3 abas (Canais, Compor, Histórico), tipos por plataforma, campo "outra rede", envio individual
- `supabase/functions/social-oauth-init/index.ts` — adicionar LinkedIn, TikTok, Pinterest, Threads, WhatsApp Business
- `supabase/functions/social-oauth-callback/index.ts` — adicionar handlers para novas plataformas

### Arquivos novos:
- Nenhum componente novo necessário — tudo dentro de `MessagingView`

### Escopo desta implementação:
1. Migration para tabela `messages`
2. Reescrever `MessagingView` com canais expandidos, chat/histórico e composição com agendamento
3. Adicionar LinkedIn e TikTok ao OAuth init/callback (as duas redes mais solicitadas que têm APIs públicas)
4. Para as demais (Pinterest, Snapchat, Telegram), marcar como "configuração pendente" e solicitar secrets quando necessário

