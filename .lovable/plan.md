

# Plano: Finalizar Calendario, Configurar Secrets OAuth e Testar Fluxo Completo

## 1. Configurar Secrets OAuth

Os secrets para conexoes OAuth reais ainda nao estao configurados. Sera necessario solicitar ao usuario que forneca:

- **META_APP_ID** - ID do aplicativo Meta (Facebook/Instagram)
- **META_APP_SECRET** - Secret do aplicativo Meta
- **GOOGLE_CLIENT_ID** - ID do cliente Google (YouTube/Google)
- **GOOGLE_CLIENT_SECRET** - Secret do cliente Google

Esses secrets serao adicionados usando a ferramenta `add_secret` para que as Edge Functions de OAuth possam usa-los.

---

## 2. Melhorias no Calendario Editorial

O calendario ja esta funcional mas precisa de algumas melhorias:

### 2.1 Adicionar Realtime ao Calendario
- Integrar `supabase.channel('scheduled_posts')` no `CalendarView.tsx` para escutar mudancas em tempo real (INSERT, UPDATE, DELETE)
- Quando um post e criado na aba "Criar Post", o calendario atualiza automaticamente sem refresh

### 2.2 Botao "+" funcional no painel lateral
- O botao "+" no painel de detalhes do dia selecionado atualmente nao faz nada
- Fazer ele navegar para a aba "Criar Post" com a data pre-selecionada (passando via estado)

### 2.3 Filtros de status no calendario
- Adicionar filtros clicaveis na legenda de status (Publicado, Agendado, Rascunho, Falhou) para mostrar/esconder posts por status

### 2.4 Resumo mensal
- Adicionar contadores no topo: total de posts no mes, agendados, publicados, falhos

---

## 3. Testar Fluxo Completo

Apos as implementacoes, testar via browser:
1. Navegar para `/login` e fazer login
2. Ir para aba "Criar Post"
3. Usar "Gerar com IA" para criar conteudo
4. Agendar para data futura
5. Verificar se aparece no calendario

---

## Detalhes Tecnicos

### Arquivos editados:
- `src/components/dashboard/CalendarView.tsx` - Realtime, filtros, resumo mensal, botao "+" funcional
- `src/pages/Dashboard.tsx` - Passar callback `setActiveTab` para CalendarView

### Secrets solicitados:
- META_APP_ID, META_APP_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET (via add_secret tool)

### Ordem de execucao:
1. Solicitar secrets OAuth ao usuario
2. Implementar melhorias no CalendarView (realtime, filtros, resumo)
3. Testar fluxo completo no browser

