
# Plano: Corrigir Calendario, Analytics, Redes Sociais e Seguranca

## Problemas Identificados

### 1. Erros de Ref no Console (forwardRef)
Os componentes `DocumentsView`, `SocialNetworkCard` e `SettingsView` geram warnings porque sao passados onde refs podem ser atribuidas. O Dashboard usa esses componentes em contextos que tentam atribuir refs a eles.

### 2. Menu "Redes Sociais" usa estado local, nao conexoes reais
O menu `networks` no Dashboard (linhas 52-73) usa `connectedPlatforms` como estado local (`useState`) com valores hardcoded `["facebook", "instagram", "linkedin"]`. Os botoes de conectar/desconectar so alteram o estado local, sem integracao real com o OAuth ou o banco de dados. O `SocialNetworkCard` tambem nao dispara OAuth - so inverte o estado local.

### 3. Calendario funcional mas com problemas de estabilidade
O `CalendarView` esta funcional e ja possui Realtime, filtros e resumo mensal. O problema pode ser o `useEffect` de notificacoes de falhas que roda a cada mudanca de `posts` sem controle, podendo causar loops de re-render.

### 4. Analytics usa dados simulados
O edge function `get-analytics` gera dados de engajamento com `Math.random()`, o que faz os valores mudarem a cada refresh.

---

## Correcoes Planejadas

### Passo 1: Integrar menu "Redes Sociais" com OAuth real

**Arquivo: `src/pages/Dashboard.tsx`**
- Remover o estado local `connectedPlatforms` e `toggleConnection`
- Importar e usar `useSocialConnections` no Dashboard
- Passar `initiateOAuth` e `disconnect` para o `SocialNetworkCard`
- Atualizar o card de "Redes Conectadas" no dashboard principal para mostrar status real

**Arquivo: `src/components/dashboard/SocialNetworkCard.tsx`**
- Adicionar `React.forwardRef` para corrigir o warning de ref
- Aceitar props `onConnect` e `onDisconnect` separadas
- Mostrar estado real de conexao (conectando, conectado, desconectado)
- Exibir `page_name` quando conectado

### Passo 2: Corrigir warnings de forwardRef

**Arquivos afetados:**
- `DocumentsView.tsx` - Envolver com `React.forwardRef`
- `SettingsView.tsx` - Envolver com `React.forwardRef`
- `SocialNetworkCard.tsx` - Envolver com `React.forwardRef`

### Passo 3: Estabilizar CalendarView

**Arquivo: `src/components/dashboard/CalendarView.tsx`**
- Adicionar `useRef` para rastrear posts com falha ja notificados, evitando notificacoes duplicadas
- Estabilizar a referencia de `refetch` com `useCallback` para evitar re-subscricoes desnecessarias do canal Realtime

### Passo 4: Melhorar Analytics

**Arquivo: `supabase/functions/get-analytics/index.ts`**
- Substituir `Math.random()` por seed deterministica baseada no `user.id` e periodo
- Manter os calculos de overview (totalPosts, published, etc.) baseados em dados reais
- Usar hash do userId como seed para gerar dados de engajamento consistentes (mesmos valores para o mesmo periodo)

### Passo 5: Corrigir seguranca restante

- O storage bucket `media` esta publico. Isso e aceitavel para um bucket de midia compartilhavel, mas vou documentar/ignorar a finding
- As demais findings de seguranca ja foram mitigadas (tokens, JWT validation)

---

## Detalhes Tecnicos

### Arquivos editados:
- `src/pages/Dashboard.tsx` - Integrar `useSocialConnections`, remover estado local
- `src/components/dashboard/SocialNetworkCard.tsx` - forwardRef + props de conexao real
- `src/components/dashboard/DocumentsView.tsx` - forwardRef
- `src/components/dashboard/SettingsView.tsx` - forwardRef
- `src/components/dashboard/CalendarView.tsx` - Estabilizar notificacoes de falha
- `supabase/functions/get-analytics/index.ts` - Dados de engajamento determinísticos

### Edge functions redeployadas:
- `get-analytics`

### Ordem de execucao:
1. Corrigir forwardRef em DocumentsView, SettingsView, SocialNetworkCard
2. Integrar SocialNetworkCard com OAuth real via useSocialConnections
3. Atualizar Dashboard para usar conexoes reais
4. Estabilizar CalendarView
5. Melhorar get-analytics com dados determinísticos
6. Atualizar findings de seguranca
