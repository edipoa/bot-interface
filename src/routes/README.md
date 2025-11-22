# Sistema de Rotas - Bot Fut

## Estrutura

O sistema de rotas usa **React Router v6** com as seguintes estruturas:

```
src/
├── routes/
│   └── index.tsx           # Definição de todas as rotas
├── layouts/
│   ├── AuthLayout.tsx      # Layout para páginas públicas (Login)
│   └── AppLayout.tsx       # Layout para páginas autenticadas (com Sidebar)
├── pages/                  # Páginas da aplicação
└── components/
    └── ProtectedRoute.tsx  # Componente para proteger rotas
```

## Rotas Disponíveis

### Rotas Públicas

| Rota | Componente | Descrição |
|------|-----------|-----------|
| `/login` | Login | Página de autenticação |
| `/` | Redirect | Redireciona para `/login` |

### Rotas Admin (Protegidas)

| Rota | Componente | Descrição |
|------|-----------|-----------|
| `/admin` | Redirect | Redireciona para `/admin/dashboard` |
| `/admin/dashboard` | AdminDashboard | Dashboard administrativo |
| `/admin/games` | ManageGames | Gerenciamento de jogos |
| `/admin/games/:gameId` | GameDetail | Detalhes de um jogo |
| `/admin/players` | ManagePlayers | Gerenciamento de jogadores |
| `/admin/debts` | ManageDebts | Gerenciamento de débitos |
| `/admin/workspaces` | ManageWorkspaces | Gerenciamento de workspaces |
| `/admin/workspaces/:workspaceId` | WorkspaceDetail | Detalhes de um workspace |
| `/admin/chats` | ManageChats | Gerenciamento de chats |
| `/admin/credits/add` | AddCredit | Adicionar crédito |
| `/admin/debits/add` | AddDebit | Adicionar débito |

### Rotas User (Protegidas)

| Rota | Componente | Descrição |
|------|-----------|-----------|
| `/user` | Redirect | Redireciona para `/user/dashboard` |
| `/user/dashboard` | UserDashboard | Dashboard do usuário |

### Rotas de Desenvolvimento

| Rota | Componente | Descrição |
|------|-----------|-----------|
| `/dev` | DevHandoff | Página de handoff para desenvolvedores |

## Como Usar

### 1. Navegação Programática

Use o hook `useNavigate` para navegar entre páginas:

```tsx
import { useNavigate } from 'react-router-dom';

function MyComponent() {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/admin/games');
  };

  return <button onClick={handleClick}>Ver Jogos</button>;
}
```

### 2. Links Declarativos

Use o componente `Link` para criar links:

```tsx
import { Link } from 'react-router-dom';

function Navigation() {
  return (
    <nav>
      <Link to="/admin/dashboard">Dashboard</Link>
      <Link to="/admin/games">Jogos</Link>
      <Link to="/admin/players">Jogadores</Link>
    </nav>
  );
}
```

### 3. Parâmetros de Rota

Acesse parâmetros de rota com `useParams`:

```tsx
import { useParams } from 'react-router-dom';

function GameDetail() {
  const { gameId } = useParams();

  return <div>Detalhes do jogo: {gameId}</div>;
}
```

### 4. Proteger Rotas

As rotas protegidas já estão configuradas com o componente `ProtectedRoute`:

```tsx
// Em routes/index.tsx
{
  path: '/admin',
  element: (
    <ProtectedRoute>
      <AppLayout role="admin" />
    </ProtectedRoute>
  ),
  children: [
    // ... rotas filhas
  ],
}
```

### 5. Informações do Usuário

Use o hook `useAuth` para acessar dados do usuário:

```tsx
import { useAuth } from '../components/ProtectedRoute';

function UserProfile() {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <div>
      <p>Nome: {user?.name}</p>
      <p>Role: {user?.role}</p>
      <button onClick={logout}>Sair</button>
    </div>
  );
}
```

### 6. Redirecionamento após Login

O componente Login automaticamente redireciona baseado no role do usuário:

```tsx
// Em Login.tsx
const response = await authAPI.verifyOTP(phone, otp);

// Redireciona baseado no role
const userRole = response.user?.role || 'user';
if (userRole === 'admin') {
  navigate('/admin/dashboard');
} else {
  navigate('/user/dashboard');
}
```

## Layouts

### AuthLayout

Layout para páginas públicas (Login):
- Background gradient
- Logo centralizada
- Sem sidebar

```tsx
// Usado automaticamente em:
<Route path="/login" element={<AuthLayout />}>
  <Route index element={<Login />} />
</Route>
```

### AppLayout

Layout para páginas autenticadas:
- Sidebar com navegação
- Informações do usuário
- Área de conteúdo principal
- Diferencia entre admin e user

```tsx
// Uso:
<Route element={<AppLayout role="admin" />}>
  <Route path="dashboard" element={<AdminDashboard />} />
</Route>
```

## Fluxo de Autenticação

```
1. Usuário acessa qualquer rota
   ↓
2. ProtectedRoute verifica se está autenticado
   ↓
3a. SIM: Renderiza conteúdo da rota
3b. NÃO: Redireciona para /login
   ↓
4. Usuário faz login
   ↓
5. Sistema salva tokens e dados do usuário
   ↓
6. Redireciona para dashboard baseado no role
   - Admin → /admin/dashboard
   - User → /user/dashboard
```

## Adicionar Novas Rotas

### Rota Pública

```tsx
// Em routes/index.tsx
{
  path: '/sobre',
  element: <About />,
}
```

### Rota Protegida (Admin)

```tsx
// Em routes/index.tsx
{
  path: '/admin',
  element: <ProtectedRoute><AppLayout role="admin" /></ProtectedRoute>,
  children: [
    // ... rotas existentes
    {
      path: 'nova-pagina',
      element: <NovaPagina />,
    },
  ],
}
```

### Rota com Parâmetro

```tsx
{
  path: 'players/:playerId',
  element: <PlayerDetail />,
}

// No componente:
const { playerId } = useParams();
```

## Configuração do Vite

As rotas usam o modo history do React Router. Certifique-se de que o Vite está configurado corretamente:

```ts
// vite.config.ts
export default defineConfig({
  // ... outras configurações
  server: {
    historyApiFallback: true, // Para rotas funcionarem em dev
  },
});
```

## Troubleshooting

### Página em branco ao acessar rota

Verifique se:
1. A rota está definida em `routes/index.tsx`
2. O componente da página está sendo importado corretamente
3. O componente da página está exportando corretamente

### Redirecionamento em loop

Verifique se:
1. A rota `/login` não está protegida
2. O `ProtectedRoute` não está verificando autenticação na rota de login

### Parâmetros de rota não funcionam

Verifique se:
1. A rota está definida com `:parametro` (ex: `games/:gameId`)
2. Você está usando `useParams()` para acessar o parâmetro

### 404 em produção

Configure o servidor para redirecionar todas as rotas para `index.html`:

```nginx
# Nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

## Navegação na Sidebar

A sidebar usa o sistema de rotas automaticamente. Ao clicar em um item:

```tsx
// Em AppLayout.tsx
const handleItemClick = (item: BFSidebarItem) => {
  setActiveItem(item.id);
  if (item.path) {
    navigate(item.path); // Usa navigate do React Router
  }
};
```

## Boas Práticas

1. **Use navegação programática** para ações do usuário (botões, formulários)
2. **Use Links** para navegação principal (menus, sidebars)
3. **Sempre proteja rotas** que requerem autenticação
4. **Valide parâmetros** de rota antes de usar
5. **Trate erros** de navegação (rotas inexistentes)
6. **Mantenha rotas organizadas** por feature/funcionalidade

## Exemplo Completo

```tsx
// Página com navegação completa
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../components/ProtectedRoute';

function GameDetail() {
  const navigate = useNavigate();
  const { gameId } = useParams();
  const { user } = useAuth();

  const handleEdit = () => {
    navigate(`/admin/games/${gameId}/edit`);
  };

  const handleBack = () => {
    navigate('/admin/games');
  };

  return (
    <div>
      <h1>Jogo #{gameId}</h1>
      <p>Visualizado por: {user?.name}</p>
      
      <button onClick={handleEdit}>Editar</button>
      <button onClick={handleBack}>Voltar</button>
      
      <Link to="/admin/dashboard">Dashboard</Link>
    </div>
  );
}
```
