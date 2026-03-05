

# Plano: Estabilizar Calendario Editorial e Corrigir Erros

## Analise

Apos revisar todo o codigo, o calendario editorial, o painel de criacao e o fluxo de aprovacao estao **implementados corretamente**. Os componentes principais (`CalendarView.tsx`, `CreatePostPanel.tsx`, `useScheduledPosts.ts`, `Dashboard.tsx`) possuem toda a logica necessaria.

Os problemas potenciais identificados sao:

### 1. Realtime subscription instavel
Em `CalendarView.tsx` (linha 135), o `useEffect` depende de `refetch`, que e recriado a cada render do `useScheduledPosts`. Isso causa re-subscricoes constantes ao canal Realtime, potencialmente causando flickering ou perda de dados.

### 2. Estado do CreatePostPanel nao reseta ao trocar de editingPost
Quando o usuario clica "Editar" em um post do calendario, os `useState` iniciais usam `editingPost` apenas na inicializacao. Se o usuario editar um post e depois clicar em outro, os campos NAO atualizam porque `useState(initialValue)` so roda na primeira montagem.

### 3. Sidebar fixa com `pl-64` pode ocultar conteudo em telas menores
O `Dashboard.tsx` usa `pl-64` fixo, que pode causar problemas de layout quando o sidebar colapsa.

---

## Correcoes

### Passo 1: Estabilizar refetch com useCallback no useScheduledPosts

**Arquivo: `src/hooks/useScheduledPosts.ts`**
- Envolver `fetchPosts` com `useCallback` para manter referencia estavel
- Isso impede re-subscricoes desnecessarias do canal Realtime no CalendarView

### Passo 2: Sincronizar estado do CreatePostPanel com editingPost

**Arquivo: `src/components/dashboard/CreatePostPanel.tsx`**
- Adicionar `useEffect` que observa mudancas em `editingPost` e `initialDate`
- Quando `editingPost` muda, atualizar `content`, `selectedPlatforms`, `scheduledDate`, `selectedMedia` e `orientation`
- Quando `initialDate` muda, atualizar `scheduledDate`

### Passo 3: Estabilizar Realtime no CalendarView

**Arquivo: `src/components/dashboard/CalendarView.tsx`**
- Usar `useRef` para armazenar a referencia de `refetch` e evitar dependencia no useEffect
- Garantir que o canal Realtime so e recriado quando necessario

### Passo 4: Sidebar responsiva

**Arquivo: `src/pages/Dashboard.tsx`**
- Ajustar `pl-64` para ser dinamico com base no estado colapsado do sidebar (se aplicavel)
- Manter funcionalidade existente

---

## Detalhes Tecnicos

### Arquivos editados:
- `src/hooks/useScheduledPosts.ts` - `useCallback` no `fetchPosts`
- `src/components/dashboard/CreatePostPanel.tsx` - `useEffect` para sync com `editingPost`
- `src/components/dashboard/CalendarView.tsx` - `useRef` para `refetch` estavel

### Resultado esperado:
- Calendario exibe grade de dias com icones de status corretamente
- Clicar "+" no dia abre CreatePostPanel com data pre-selecionada
- Clicar "Editar" abre o post com campos pre-preenchidos (e atualiza ao trocar de post)
- Realtime funciona sem re-subscricoes
- Fluxo completo: criar pauta -> desenvolver conteudo -> enviar para aprovacao -> aprovar/rejeitar -> publicar

