

# Plano: Corrigir Create Post + Calendario Editorial

## Problemas Identificados

1. **Rota `/` sem protecao**: `Index` renderiza `Dashboard` diretamente sem `ProtectedRoute`. Sem usuario autenticado, os hooks de dados rodam sem user mas o dashboard fica inacessivel.

2. **Warnings de forwardRef**: `BulkUploadDialog`, `AdvancedAnalytics`, `StoriesLivesView` geram warnings "Function components cannot be given refs" - sao warnings nao-criticos mas poluem o console.

3. **Sincronismo Create Post <-> Calendario**: O `CreatePostPanel` usa uma instancia separada de `useScheduledPosts` que nao compartilha estado com a do `CalendarView`. Quando um post e criado/editado no painel, o calendario nao atualiza automaticamente.

## Correcoes

### 1. Proteger rota raiz (`src/App.tsx`)
- Rota `/` deve redirecionar para `/login` se nao autenticado, ou renderizar Dashboard protegido
- Remover `Index` intermediario desnecessario

### 2. Compartilhar estado de posts entre CalendarView e CreatePostPanel (`src/pages/Dashboard.tsx`)
- Levantar `useScheduledPosts()` para o `Dashboard` 
- Passar `posts`, `loading`, `refetch`, `createPost`, `updatePost`, `deletePost`, etc. como props para CalendarView e CreatePostPanel
- Isso garante que ao criar/editar um post no painel, o calendario atualiza imediatamente

### 3. Corrigir CalendarView para receber posts como props
- Ao inves de chamar `useScheduledPosts()` internamente, receber os dados do pai
- Manter realtime subscription no Dashboard

### 4. Corrigir CreatePostPanel para receber funcoes como props
- Ao inves de instanciar `useScheduledPosts()` internamente, receber `createPost`, `updatePost`, `submitForApproval` do pai
- Chamar `refetch` apos salvar para atualizar calendario

### 5. Corrigir BulkUploadDialog ref warning
- Verificar se esta sendo passado ref incorretamente para Dialog

## Arquivos editados:
- `src/App.tsx` - Proteger rota `/`
- `src/pages/Dashboard.tsx` - Levantar useScheduledPosts, passar props
- `src/components/dashboard/CalendarView.tsx` - Receber posts/acoes como props
- `src/components/dashboard/CreatePostPanel.tsx` - Receber funcoes como props
- `src/pages/Index.tsx` - Simplificar ou remover

