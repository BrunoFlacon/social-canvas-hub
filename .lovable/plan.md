# Plano: Conectar Calendario Editorial ao Fluxo de Criacao de Conteudo

## Problema Atual

O calendario e o painel de criacao de posts funcionam de forma isolada. Quando o usuario agenda uma pauta no calendario, nao consegue abrir essa pauta no painel de criacao para desenvolver o conteudo e publicar. O botao "+" no calendario navega para a aba "Criar Post" mas sem passar a data selecionada. Nao existe opcao de editar posts existentes a partir do calendario.

## Solucao

Criar um fluxo continuo: **Calendario -> Criar/Editar Post -> Publicar**, onde pautas agendadas podem ser abertas no painel de criacao para desenvolvimento rapido do conteudo.

Cria a pauta o usuário jornalista desenvolve o conteudo da pauta e o editor aprova ou corrige a matéria ou a publicação da pauta e o autor ou editor publica. o calendário aparece todas as publicações tanto para aprovar a publicação, editar, rascunhar e publicar. o calendário mostrará a data e todos os estados de uma matéria nos quadradinhos do dia que foram criados

---

## Passo 1: Adicionar estado compartilhado no Dashboard

**Arquivo: `src/pages/Dashboard.tsx**`

Adicionar dois estados novos:

- `preSelectedDate: Date | null` - data pre-selecionada ao clicar "+" no calendario
- `editingPost: ScheduledPost | null` - post existente sendo editado

Atualizar o callback `onCreatePost` do CalendarView para aceitar tanto data quanto post:

- `onCreatePost(date)` - cria novo post com data pre-selecionada
- `onEditPost(post)` - abre post existente para edicao

Ao navegar para a aba "create", passar `preSelectedDate` e `editingPost` como props.

## Passo 2: Adicionar botao "Editar" no CalendarView

**Arquivo: `src/components/dashboard/CalendarView.tsx**`

No dropdown de acoes de cada post (linhas 395-409), adicionar um item "Editar conteudo" que chama um novo callback `onEditPost(post)`:

- Clicar em "Editar conteudo" navega para aba "Criar Post" com o post carregado
- O botao "+" continua criando novo post com a data pre-selecionada

Atualizar a interface `CalendarViewProps`:

```text
interface CalendarViewProps {
  onCreatePost?: (preSelectedDate?: Date) => void;
  onEditPost?: (post: ScheduledPost) => void;
}
```

## Passo 3: Atualizar CreatePostPanel para aceitar props de edicao

**Arquivo: `src/components/dashboard/CreatePostPanel.tsx**`

Adicionar props opcionais:

- `initialDate?: string` - data pre-preenchida no campo de agendamento
- `editingPost?: ScheduledPost` - post sendo editado (preenche todos os campos)
- `onPostSaved?: () => void` - callback apos salvar/atualizar

Quando `editingPost` e fornecido:

- Preencher automaticamente: content, selectedPlatforms, scheduledDate, mediaType, orientation
- Alterar o titulo de "Criar Publicacao" para "Editar Publicacao"
- O botao "Agendar" muda para "Atualizar Post"
- Usar `updatePost()` em vez de `createPost()` ao salvar
- Mostrar badge "Editando pauta do calendario" para contexto

Quando `initialDate` e fornecido:

- Preencher o campo datetime-local com a data

## Passo 4: Fluxo rapido de publicacao no calendario

**Arquivo: `src/components/dashboard/CalendarView.tsx**`

Adicionar botao "Publicar agora" no dropdown de acoes para posts com status "scheduled" ou "draft":

- Chama a edge function `publish-post` diretamente
- Mostra feedback de sucesso/erro
- Atualiza o calendario via Realtime

## Passo 5: Botao "Voltar ao Calendario" no CreatePostPanel

Quando o usuario esta editando um post vindo do calendario, mostrar um botao "Voltar ao Calendario" no topo do painel para navegacao rapida.

---

## Detalhes Tecnicos

### Arquivos editados:

- `src/pages/Dashboard.tsx` - Estado compartilhado (preSelectedDate, editingPost), callbacks
- `src/components/dashboard/CalendarView.tsx` - Botao "Editar", "Publicar agora", prop onEditPost
- `src/components/dashboard/CreatePostPanel.tsx` - Props de edicao, pre-preenchimento, updatePost

### Fluxo do usuario:

1. Abre Calendario -> ve pautas agendadas
2. Clica "Editar conteudo" em uma pauta -> abre CreatePostPanel com dados preenchidos
3. Desenvolve conteudo, usa IA, adiciona hashtags
4. Clica "Atualizar Post" ou "Publicar Agora"
5. Volta ao calendario e ve o status atualizado em tempo real