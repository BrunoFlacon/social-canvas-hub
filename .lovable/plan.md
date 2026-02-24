

# Plano de Implementacao Completo

## Resumo

Este plano abrange 6 grandes areas: (1) correcao de seguranca, (2) integracao real com APIs do Meta/Google/YouTube, (3) publicacao em massa via CSV, (4) notificacoes push/email, (5) testes do fluxo completo, e (6) melhorias gerais.

---

## 1. Correcao de Erros de Seguranca

### 1.1 Endpoint de IA sem autenticacao (CRITICO - level: error)

O edge function `generate-post-content` aceita requisicoes sem autenticacao. Qualquer pessoa pode consumir creditos de IA.

**Solucao:**
- Adicionar validacao JWT manual no `generate-post-content/index.ts` (mesmo padrao ja usado em `publish-post` e `get-analytics`)
- Verificar `Authorization` header, extrair token, validar com `supabase.auth.getUser()`
- Atualizar o hook `useAIContent.ts` para enviar o token do usuario autenticado em vez do anon key

### 1.2 OAuth tokens expostos via RLS (CRITICO - level: error)

A tabela `social_connections` expoe `access_token` e `refresh_token` para o cliente via SELECT.

**Solucao:**
- Criar uma view `social_connections_safe` que exclui as colunas `access_token` e `refresh_token`
- Alterar o RLS: a politica SELECT existente permanece, mas o frontend usara a view segura
- Edge functions usarao `SUPABASE_SERVICE_ROLE_KEY` para acessar tokens diretamente (server-side only)
- Atualizar componentes frontend para consultar a view em vez da tabela direta

---

## 2. Integracao Real com APIs de Redes Sociais

### 2.1 Edge Function: OAuth Callback (`social-oauth-callback`)

Nova edge function que processa o retorno OAuth de cada plataforma:

- Recebe `code`, `state`, `platform` como parametros
- Troca o `code` por `access_token` + `refresh_token` via API da plataforma
- Armazena tokens na tabela `social_connections` (server-side only)
- Retorna status de sucesso ao frontend

**Plataformas suportadas:**
- **Meta (Facebook/Instagram):** `https://graph.facebook.com/v21.0/oauth/access_token`
- **Google/YouTube:** `https://oauth2.googleapis.com/token`
- **Twitter/X:** `https://api.x.com/2/oauth2/token`

### 2.2 Edge Function: OAuth Init (`social-oauth-init`)

Nova edge function que gera a URL de autorizacao OAuth:

- Recebe `platform` e `redirect_uri`
- Gera `state` criptografico (armazenado temporariamente no banco)
- Retorna URL de autorizacao para redirecionamento

### 2.3 Edge Function: Token Refresh (`refresh-social-token`)

Nova edge function para renovar tokens expirados:

- Chamada antes de publicar quando `token_expires_at` esta proximo
- Usa `refresh_token` para obter novo `access_token`
- Atualiza banco de dados

### 2.4 Atualizar `publish-post` com APIs Reais

Substituir a funcao `simulatePublish` por chamadas reais:

- **Facebook:** `POST https://graph.facebook.com/v21.0/{page_id}/feed`
- **Instagram:** `POST https://graph.facebook.com/v21.0/{ig_user_id}/media` + `/media_publish`
- **YouTube:** `POST https://www.googleapis.com/upload/youtube/v3/videos`
- **Twitter/X:** `POST https://api.x.com/2/tweets`
- Manter fallback de simulacao para plataformas sem conexao real

### 2.5 Secrets Necessarios

O usuario precisara configurar via painel:
- `META_APP_ID` e `META_APP_SECRET`
- `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET`
- `TWITTER_CONSUMER_KEY` e `TWITTER_CONSUMER_SECRET`

### 2.6 Atualizar SettingsView

- Remover texto "Requer backend"
- Botao "Conectar" redireciona para fluxo OAuth real via `social-oauth-init`
- Exibir status real de conexao a partir da view `social_connections_safe`

### 2.7 Pagina de Callback OAuth

- Nova rota `/oauth/callback` no React Router
- Captura `code` e `state` da URL
- Chama `social-oauth-callback` edge function
- Redireciona de volta para `/dashboard` com toast de sucesso/erro

---

## 3. Publicacao em Massa via CSV

### 3.1 Nova Edge Function: `bulk-import-posts`

- Recebe arquivo CSV parseado (array de objetos)
- Valida cada linha (content, platforms, scheduled_at)
- Insere multiplos registros na tabela `scheduled_posts`
- Retorna relatorio de sucesso/falha por linha

### 3.2 Componente `BulkUploadDialog`

Novo componente no `CreatePostPanel`:

- Botao "Importar CSV" abre dialog
- Upload de arquivo `.csv` ou `.xlsx`
- Parser CSV no frontend com tratamento de campos entre aspas
- Mapeamento dinamico de colunas (arrastar colunas do CSV para campos do sistema)
- Preview das primeiras 5 linhas antes de confirmar
- Barra de progresso durante importacao
- Relatorio final com contagem de sucesso/erro

### 3.3 Formato CSV Esperado

```text
conteudo,plataformas,data_agendamento,tipo_midia
"Texto do post","instagram,facebook","2026-03-01 10:00","image"
"Outro post","twitter,linkedin","2026-03-02 14:00","text"
```

---

## 4. Notificacoes Push e Email

### 4.1 Notificacoes Push (Browser Notifications API)

- Solicitar permissao de notificacao no primeiro login
- Criar hook `useWebPushNotifications` que:
  - Registra service worker
  - Solicita permissao do usuario
  - Envia notificacao local quando post e publicado/falha
- Integrar com `NotificationContext` para disparar push em tempo real
- Usar Supabase Realtime para ouvir mudancas na tabela `scheduled_posts`

### 4.2 Notificacoes por Email

Lovable Cloud suporta apenas emails de autenticacao. Para notificacoes transacionais (post publicado/falhou):

- Informar ao usuario que notificacoes por email de publicacao necessitam de um servico externo (ex: Resend)
- Implementar toggle nas configuracoes de notificacao que salva preferencia no banco
- Preparar a infraestrutura para integracao futura com servico de email

### 4.3 Realtime Updates

- Habilitar Realtime na tabela `scheduled_posts`
- Quando status muda para `published` ou `failed`, disparar notificacao push
- Atualizar automaticamente CalendarView e RecentPosts sem refresh manual

---

## 5. Migracao de Banco de Dados

Nova migracao SQL para suportar as funcionalidades:

```text
- CREATE VIEW social_connections_safe (sem tokens)
- CREATE TABLE oauth_states (para validacao CSRF no OAuth)
- ALTER TABLE scheduled_posts ADD COLUMN bulk_import_id (para rastrear importacoes em massa)
- ALTER PUBLICATION supabase_realtime ADD TABLE scheduled_posts (para realtime)
- Policies RLS para novas tabelas/views
```

---

## 6. Resumo de Arquivos

### Novos arquivos:
- `supabase/functions/social-oauth-init/index.ts`
- `supabase/functions/social-oauth-callback/index.ts`
- `supabase/functions/refresh-social-token/index.ts`
- `supabase/functions/bulk-import-posts/index.ts`
- `src/pages/OAuthCallback.tsx`
- `src/components/dashboard/BulkUploadDialog.tsx`
- `src/hooks/useWebPushNotifications.ts`
- `src/hooks/useSocialConnections.ts`

### Arquivos editados:
- `supabase/functions/generate-post-content/index.ts` (adicionar auth)
- `supabase/functions/publish-post/index.ts` (APIs reais)
- `src/hooks/useAIContent.ts` (enviar auth token)
- `src/components/dashboard/SettingsView.tsx` (OAuth real)
- `src/components/dashboard/CreatePostPanel.tsx` (botao CSV)
- `src/components/dashboard/CalendarView.tsx` (realtime)
- `src/contexts/NotificationContext.tsx` (push notifications)
- `src/App.tsx` (nova rota /oauth/callback)

---

## Ordem de Execucao

1. Migracao de banco (view segura, tabela oauth_states, realtime)
2. Correcoes de seguranca (auth no generate-post-content, view segura)
3. Edge functions de OAuth (init, callback, refresh)
4. Atualizar publish-post com APIs reais
5. Atualizar SettingsView com OAuth real
6. Pagina de callback OAuth
7. Publicacao em massa (edge function + componente)
8. Notificacoes push + realtime
9. Testes end-to-end

