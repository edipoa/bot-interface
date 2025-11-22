# Sistema de Autenticação - Bot Fut

## Visão Geral

O sistema de autenticação foi implementado com interceptors do Axios que automaticamente:
- Adiciona tokens JWT em todas as requisições
- Renova tokens automaticamente quando expirados
- Redireciona para login quando não autenticado (erro 401)
- Gerencia tokens de forma segura no localStorage

## Estrutura

```
src/
├── lib/
│   └── axios.ts              # Configuração do axios + interceptors
├── components/
│   └── ProtectedRoute.tsx    # Componente para rotas protegidas
└── examples/
    └── LoginExamples.tsx     # Exemplos de uso dos componentes
```

## Configuração

### 1. Variável de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

### 2. Instância do Axios

A instância configurada do axios está em `src/lib/axios.ts` e exporta:

- `api` - Instância do axios com interceptors configurados
- `authAPI` - Funções de autenticação
- `tokenService` - Gerenciamento de tokens

## Como Usar

### Autenticação (Login)

```tsx
import { authAPI } from '../lib/axios';

// 1. Solicitar código OTP
const handleRequestOTP = async (phone: string) => {
  try {
    await authAPI.requestOTP(phone);
    // Código enviado com sucesso
  } catch (error) {
    console.error('Erro ao enviar código:', error);
  }
};

// 2. Verificar código OTP
const handleVerifyOTP = async (phone: string, otp: string) => {
  try {
    const { accessToken, refreshToken, user } = await authAPI.verifyOTP(phone, otp);
    // Login realizado! Tokens salvos automaticamente
    // Redirecionar para dashboard
    window.location.href = '/dashboard';
  } catch (error) {
    console.error('Código inválido:', error);
  }
};
```

### Fazer Requisições Autenticadas

Basta usar a instância `api` do axios. O token será adicionado automaticamente:

```tsx
import api from '../lib/axios';

// GET
const fetchData = async () => {
  const response = await api.get('/games');
  return response.data;
};

// POST
const createGame = async (gameData) => {
  const response = await api.post('/games', gameData);
  return response.data;
};

// PUT
const updateGame = async (id, gameData) => {
  const response = await api.put(`/games/${id}`, gameData);
  return response.data;
};

// DELETE
const deleteGame = async (id) => {
  await api.delete(`/games/${id}`);
};
```

### Proteger Rotas

Use o componente `ProtectedRoute` para proteger páginas que requerem autenticação:

```tsx
import { ProtectedRoute } from '../components/ProtectedRoute';
import Dashboard from './Dashboard';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      {/* Rotas protegidas */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/games" 
        element={
          <ProtectedRoute>
            <GamesList />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}
```

### Hook useAuth

Use o hook `useAuth` para acessar informações do usuário:

```tsx
import { useAuth } from '../components/ProtectedRoute';

function UserProfile() {
  const { user, logout, refreshUser, isAuthenticated } = useAuth();

  return (
    <div>
      <h1>Olá, {user?.name}</h1>
      <p>Telefone: {user?.phone}</p>
      <p>Role: {user?.role}</p>
      
      <button onClick={logout}>Sair</button>
      <button onClick={refreshUser}>Atualizar dados</button>
    </div>
  );
}
```

### Logout

```tsx
import { authAPI } from '../lib/axios';

const handleLogout = async () => {
  await authAPI.logout();
  // Automaticamente limpa tokens e redireciona para /login
};
```

### Verificar se está Autenticado

```tsx
import { authAPI } from '../lib/axios';

if (authAPI.isAuthenticated()) {
  // Usuário está autenticado
} else {
  // Redirecionar para login
  window.location.href = '/login';
}
```

## Fluxo de Autenticação

### 1. Login Inicial

```
Usuário → Digite telefone → Solicita OTP → Recebe código
       → Digite código → Verifica OTP → Recebe tokens
       → Tokens salvos no localStorage → Redireciona para dashboard
```

### 2. Requisições Autenticadas

```
Requisição → Interceptor adiciona token → API processa
          → Sucesso → Retorna dados
          → Erro 401 → Tenta renovar token
                    → Sucesso → Repete requisição
                    → Falha → Redireciona para login
```

### 3. Renovação de Token

```
Token expirado → Requisição falha (401)
              → Interceptor detecta erro
              → Usa refreshToken para obter novo accessToken
              → Salva novo accessToken
              → Repete requisição original
              → Se refresh falhar → Limpa tokens → Redireciona para login
```

## Gerenciamento de Tokens

Os tokens são gerenciados automaticamente pelo `tokenService`:

```tsx
import { tokenService } from '../lib/axios';

// Obter tokens
const accessToken = tokenService.getAccessToken();
const refreshToken = tokenService.getRefreshToken();

// Salvar tokens (feito automaticamente no login)
tokenService.setTokens(accessToken, refreshToken);

// Limpar tokens (feito automaticamente no logout)
tokenService.clearTokens();

// Obter/salvar dados do usuário
const user = tokenService.getUser();
tokenService.setUser(userData);
```

## Tratamento de Erros

O interceptor trata automaticamente:

- **401 Unauthorized**: Tenta renovar token ou redireciona para login
- **403 Forbidden**: Rejeita com erro (usuário não tem permissão)
- **Outros erros**: Rejeita normalmente para tratamento manual

```tsx
try {
  await api.get('/admin/users');
} catch (error) {
  if (error.response?.status === 403) {
    // Usuário não tem permissão
    alert('Você não tem permissão para acessar este recurso');
  } else if (error.response?.status === 404) {
    // Recurso não encontrado
    alert('Recurso não encontrado');
  } else {
    // Erro genérico
    alert('Erro ao processar requisição');
  }
}
```

## Endpoints da API

Baseados na API do repositório `eaj1998/bot-fut`:

### Autenticação

- `POST /api/auth/request-otp` - Solicita código OTP
  ```json
  { "phone": "+5549999999999" }
  ```

- `POST /api/auth/verify-otp` - Verifica código OTP
  ```json
  { "phone": "+5549999999999", "otp": "123456" }
  ```

- `POST /api/auth/refresh` - Renova token de acesso
  ```json
  { "refreshToken": "..." }
  ```

- `GET /api/auth/me` - Obtém dados do usuário autenticado (requer autenticação)

- `POST /api/auth/logout` - Faz logout (requer autenticação)

### Outros Endpoints

Todos os outros endpoints requerem autenticação e o token será adicionado automaticamente:

- `/api/games` - Gerenciamento de jogos
- `/api/players` - Gerenciamento de jogadores
- `/api/chats` - Gerenciamento de chats
- `/api/debts` - Gerenciamento de débitos
- `/api/workspaces` - Gerenciamento de workspaces
- `/api/dashboard` - Dashboard

## Segurança

### Tokens no localStorage

Os tokens são armazenados no localStorage:
- `accessToken` - Token JWT de acesso (curta duração)
- `refreshToken` - Token para renovação (longa duração)
- `user` - Dados do usuário

### Boas Práticas

1. **Não exponha tokens**: Nunca envie tokens em URLs ou logs
2. **HTTPS obrigatório**: Use sempre HTTPS em produção
3. **Timeout**: Requisições têm timeout de 10 segundos
4. **Renovação automática**: Tokens são renovados automaticamente
5. **Limpeza no logout**: Tokens são removidos completamente no logout

## Troubleshooting

### Token não está sendo enviado

Verifique se está usando a instância `api` do axios:
```tsx
import api from '../lib/axios'; // ✅ Correto
import axios from 'axios';      // ❌ Errado
```

### Redirecionamento em loop

Certifique-se de que a rota `/login` não está protegida:
```tsx
// ❌ Errado
<Route path="/login" element={<ProtectedRoute><Login /></ProtectedRoute>} />

// ✅ Correto
<Route path="/login" element={<Login />} />
```

### Token expira muito rápido

O token é renovado automaticamente. Se estiver expirando durante uso ativo, verifique a configuração do backend.

### CORS errors

Configure o backend para aceitar requisições do frontend:
```typescript
// No backend
app.use(cors({
  origin: 'http://localhost:5173', // URL do Vite
  credentials: true
}));
```

## Exemplo Completo

Veja o arquivo `src/examples/LoginExamples.tsx` para exemplos práticos e completos de uso.
