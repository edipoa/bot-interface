# 🔐 Bot Fut - Guia de Integração de Autenticação

## 📋 Visão Geral

Este guia mostra como integrar o sistema de login com telefone + OTP a um backend real (Firebase, Supabase, AWS Cognito, ou API própria).

---

## 🏗️ Arquitetura Atual

### **Fluxo Implementado (Mock)**

```
1. Usuário digita telefone
   ↓
2. Click "Enviar código" → Simula envio
   ↓
3. Mostra tela de OTP
   ↓
4. Usuário digita código
   ↓
5. Click "Verificar" → Simula validação
   ↓
6. Redirect para dashboard
```

---

## 🔌 Integração com Backend

### **Opção 1: Firebase Authentication**

#### **1. Instalar dependências**

```bash
npm install firebase
```

#### **2. Configurar Firebase**

```typescript
// lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  // ... outras configs
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
```

#### **3. Modificar Login.tsx**

```typescript
// pages/Login.tsx
import { auth } from '../lib/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

// Dentro do componente Login
const [confirmationResult, setConfirmationResult] = useState<any>(null);

// Setup reCAPTCHA
useEffect(() => {
  window.recaptchaVerifier = new RecaptchaVerifier(
    'recaptcha-container',
    {
      size: 'invisible',
      callback: () => {
        // reCAPTCHA resolvido
      }
    },
    auth
  );
}, []);

// Enviar código
const handleSendCode = async () => {
  setError('');
  
  if (!isPhoneValid()) {
    setError('Por favor, digite um número de telefone válido');
    return;
  }

  setLoading(true);

  try {
    // Formatar telefone para E.164 (+5511999999999)
    const phoneNumber = `+55${phone.replace(/\D/g, '')}`;
    
    const appVerifier = window.recaptchaVerifier;
    const result = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
    
    setConfirmationResult(result);
    setStep('otp');
    startResendCountdown();
    setLoading(false);
  } catch (error: any) {
    console.error('Erro ao enviar código:', error);
    setError(error.message || 'Erro ao enviar código. Tente novamente.');
    setLoading(false);
  }
};

// Verificar código
const handleVerifyCode = async () => {
  setError('');
  
  if (!isOtpValid()) {
    setError('Por favor, digite o código completo');
    return;
  }

  setLoading(true);

  try {
    await confirmationResult.confirm(otp);
    
    // Usuário autenticado com sucesso
    console.log('Login bem-sucedido!');
    // Redirecionar para dashboard
    window.location.href = '/dashboard';
  } catch (error: any) {
    console.error('Erro ao verificar código:', error);
    setError('Código inválido. Verifique e tente novamente.');
    setOtp('');
    setLoading(false);
  }
};

// No JSX, adicionar container do reCAPTCHA
<div id="recaptcha-container"></div>
```

---

### **Opção 2: Supabase Authentication**

#### **1. Instalar dependências**

```bash
npm install @supabase/supabase-js
```

#### **2. Configurar Supabase**

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

#### **3. Modificar Login.tsx**

```typescript
// pages/Login.tsx
import { supabase } from '../lib/supabase';

// Enviar código
const handleSendCode = async () => {
  setError('');
  
  if (!isPhoneValid()) {
    setError('Por favor, digite um número de telefone válido');
    return;
  }

  setLoading(true);

  try {
    // Formatar telefone para E.164 (+5511999999999)
    const phoneNumber = `+55${phone.replace(/\D/g, '')}`;
    
    const { error } = await supabase.auth.signInWithOtp({
      phone: phoneNumber,
    });

    if (error) throw error;

    setStep('otp');
    startResendCountdown();
    setLoading(false);
  } catch (error: any) {
    console.error('Erro ao enviar código:', error);
    setError(error.message || 'Erro ao enviar código. Tente novamente.');
    setLoading(false);
  }
};

// Verificar código
const handleVerifyCode = async () => {
  setError('');
  
  if (!isOtpValid()) {
    setError('Por favor, digite o código completo');
    return;
  }

  setLoading(true);

  try {
    const phoneNumber = `+55${phone.replace(/\D/g, '')}`;
    
    const { data, error } = await supabase.auth.verifyOtp({
      phone: phoneNumber,
      token: otp,
      type: 'sms',
    });

    if (error) throw error;

    // Usuário autenticado com sucesso
    console.log('Login bem-sucedido!', data);
    // Redirecionar para dashboard
    window.location.href = '/dashboard';
  } catch (error: any) {
    console.error('Erro ao verificar código:', error);
    setError('Código inválido. Verifique e tente novamente.');
    setOtp('');
    setLoading(false);
  }
};

// Reenviar código
const handleResendCode = async () => {
  if (!canResend) return;

  setError('');
  setLoading(true);
  setOtp('');

  try {
    const phoneNumber = `+55${phone.replace(/\D/g, '')}`;
    
    const { error } = await supabase.auth.signInWithOtp({
      phone: phoneNumber,
    });

    if (error) throw error;

    startResendCountdown();
    setLoading(false);
  } catch (error: any) {
    console.error('Erro ao reenviar código:', error);
    setError('Erro ao reenviar código. Tente novamente.');
    setLoading(false);
  }
};
```

---

### **Opção 3: API Própria**

#### **1. Criar serviço de autenticação**

```typescript
// lib/authService.ts
const API_URL = process.env.VITE_API_URL || 'http://localhost:3000/api';

export interface SendCodeResponse {
  success: boolean;
  message?: string;
  sessionId?: string;
}

export interface VerifyCodeResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: {
    id: string;
    phone: string;
    name: string;
    role: 'admin' | 'user';
  };
}

export const authService = {
  // Enviar código OTP
  async sendCode(phone: string): Promise<SendCodeResponse> {
    const response = await fetch(`${API_URL}/auth/send-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phone }),
    });

    if (!response.ok) {
      throw new Error('Erro ao enviar código');
    }

    return response.json();
  },

  // Verificar código OTP
  async verifyCode(phone: string, code: string, sessionId?: string): Promise<VerifyCodeResponse> {
    const response = await fetch(`${API_URL}/auth/verify-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phone, code, sessionId }),
    });

    if (!response.ok) {
      throw new Error('Erro ao verificar código');
    }

    return response.json();
  },

  // Reenviar código
  async resendCode(phone: string, sessionId?: string): Promise<SendCodeResponse> {
    const response = await fetch(`${API_URL}/auth/resend-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phone, sessionId }),
    });

    if (!response.ok) {
      throw new Error('Erro ao reenviar código');
    }

    return response.json();
  },
};
```

#### **2. Modificar Login.tsx**

```typescript
// pages/Login.tsx
import { authService } from '../lib/authService';

// Dentro do componente Login
const [sessionId, setSessionId] = useState<string>();

// Enviar código
const handleSendCode = async () => {
  setError('');
  
  if (!isPhoneValid()) {
    setError('Por favor, digite um número de telefone válido');
    return;
  }

  setLoading(true);

  try {
    // Formatar telefone (apenas números)
    const phoneNumber = phone.replace(/\D/g, '');
    
    const result = await authService.sendCode(phoneNumber);

    if (result.success) {
      setSessionId(result.sessionId);
      setStep('otp');
      startResendCountdown();
    } else {
      setError(result.message || 'Erro ao enviar código');
    }
  } catch (error: any) {
    console.error('Erro ao enviar código:', error);
    setError('Erro ao enviar código. Tente novamente.');
  } finally {
    setLoading(false);
  }
};

// Verificar código
const handleVerifyCode = async () => {
  setError('');
  
  if (!isOtpValid()) {
    setError('Por favor, digite o código completo');
    return;
  }

  setLoading(true);

  try {
    const phoneNumber = phone.replace(/\D/g, '');
    
    const result = await authService.verifyCode(phoneNumber, otp, sessionId);

    if (result.success && result.token && result.user) {
      // Salvar token no localStorage
      localStorage.setItem('authToken', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));
      
      // Redirecionar para dashboard
      window.location.href = '/dashboard';
    } else {
      setError(result.message || 'Código inválido');
      setOtp('');
    }
  } catch (error: any) {
    console.error('Erro ao verificar código:', error);
    setError('Código inválido. Verifique e tente novamente.');
    setOtp('');
  } finally {
    setLoading(false);
  }
};

// Reenviar código
const handleResendCode = async () => {
  if (!canResend) return;

  setError('');
  setLoading(true);
  setOtp('');

  try {
    const phoneNumber = phone.replace(/\D/g, '');
    
    const result = await authService.resendCode(phoneNumber, sessionId);

    if (result.success) {
      startResendCountdown();
    } else {
      setError(result.message || 'Erro ao reenviar código');
    }
  } catch (error: any) {
    console.error('Erro ao reenviar código:', error);
    setError('Erro ao reenviar código. Tente novamente.');
  } finally {
    setLoading(false);
  }
};
```

---

## 🔒 Gerenciamento de Sessão

### **Context de Autenticação**

```typescript
// contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  phone: string;
  name: string;
  role: 'admin' | 'user';
}

interface AuthContextData {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Carregar dados do localStorage
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }

    setIsLoading(false);
  }, []);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('authToken', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

### **Usar no App.tsx**

```typescript
// App.tsx
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './pages/Login';

function AppContent() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div className="flex h-screen">
      {/* Seu app aqui */}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
```

---

## 🛡️ Proteção de Rotas

### **ProtectedRoute Component**

```typescript
// components/ProtectedRoute.tsx
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'user';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
}) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/unauthorized" />;
  }

  return <>{children}</>;
};
```

---

## 🌐 Variáveis de Ambiente

```env
# .env
VITE_API_URL=http://localhost:3000/api
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## 📱 Backend API Endpoints (Referência)

### **POST /api/auth/send-code**

```json
// Request
{
  "phone": "11999999999"
}

// Response (Success)
{
  "success": true,
  "message": "Código enviado com sucesso",
  "sessionId": "uuid-session-id"
}

// Response (Error)
{
  "success": false,
  "message": "Número de telefone inválido"
}
```

### **POST /api/auth/verify-code**

```json
// Request
{
  "phone": "11999999999",
  "code": "123456",
  "sessionId": "uuid-session-id"
}

// Response (Success)
{
  "success": true,
  "token": "jwt-token",
  "user": {
    "id": "user-id",
    "phone": "11999999999",
    "name": "João Silva",
    "role": "user"
  }
}

// Response (Error)
{
  "success": false,
  "message": "Código inválido"
}
```

### **POST /api/auth/resend-code**

```json
// Request
{
  "phone": "11999999999",
  "sessionId": "uuid-session-id"
}

// Response (Success)
{
  "success": true,
  "message": "Código reenviado com sucesso",
  "sessionId": "uuid-session-id"
}
```

---

## ✅ Checklist de Integração

- [ ] Escolher provedor de autenticação (Firebase/Supabase/API própria)
- [ ] Instalar dependências necessárias
- [ ] Configurar variáveis de ambiente
- [ ] Implementar serviço de autenticação
- [ ] Modificar Login.tsx para usar API real
- [ ] Criar AuthContext para gerenciar sessão
- [ ] Implementar proteção de rotas
- [ ] Adicionar tratamento de erros
- [ ] Testar fluxo completo
- [ ] Implementar logout
- [ ] Adicionar refresh token (se necessário)

---

**Dica:** Comece com Firebase ou Supabase para implementação mais rápida, pois ambos já têm autenticação por telefone pronta.
