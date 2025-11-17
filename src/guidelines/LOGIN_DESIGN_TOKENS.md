# 🎨 Bot Fut - Login Design Tokens & Specifications

## 📋 Visão Geral

Sistema de design completo para autenticação com telefone + OTP do Bot Fut.
Design clean, esportivo e responsivo seguindo os padrões da marca.

---

## 🎨 Design Tokens

### **Cores Primárias**

```css
/* Brand Colors */
--bf-green-primary: #00D66F;    /* Ações de sucesso, confirmação */
--bf-green-dark: #00A854;       /* Hover states (verde) */
--bf-green-light: #4DFFB3;      /* Backgrounds sutis */

--bf-blue-primary: #0066FF;     /* Ações principais, links */
--bf-blue-dark: #0047B3;        /* Hover states (azul) */

--bf-navy: #0A1628;             /* Background gradiente escuro */
--bf-navy-light: #1A2B42;       /* Background gradiente meio */
```

### **Cores de Estado**

```css
/* Success */
--success: #00D66F;
--success-bg: #E8FFF4;          /* bg-green-50 */
--success-border: #C3F5DC;      /* border-green-200 */

/* Error */
--destructive: #EF4444;
--error-bg: #FEF2F2;            /* bg-red-50 */
--error-border: #FECACA;        /* border-red-200 */

/* Info */
--info: #0066FF;
--info-bg: #EFF6FF;             /* bg-blue-50 */
--info-border: #BFDBFE;         /* border-blue-100 */

/* Warning */
--warning: #F59E0B;
--warning-bg: #FFFBEB;          /* bg-yellow-50 */
--warning-border: #FDE68A;      /* border-yellow-200 */
```

### **Cores Neutras**

```css
--background: #F5F7FA;          /* Fundo geral */
--foreground: #0A1628;          /* Texto principal */
--card: #FFFFFF;                /* Cards e superfícies */
--border: #E5E7EB;              /* Bordas padrão */
--muted: #E5E9F0;               /* Backgrounds secundários */
--muted-foreground: #64748B;    /* Texto secundário */
```

---

## 📐 Espaçamento

### **Padding**

```
Container:    p-6 sm:p-8       (24px / 32px)
Card:         p-4              (16px)
Input:        px-4 h-14        (16px horizontal, 56px altura)
Button:       px-6 py-3        (24px horizontal, 12px vertical)
Alert:        p-4              (16px)
```

### **Gap**

```
Form fields:  gap-6            (24px)
OTP digits:   gap-2 sm:gap-3   (8px / 12px)
Icons:        gap-3            (12px)
```

### **Margins**

```
Label:        mb-2             (8px)
Error:        mt-2             (8px)
Helper text:  mt-3             (12px)
Sections:     mb-8             (32px)
```

---

## 📝 Tipografia

### **Fonte**

```css
font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

### **Tamanhos**

```css
/* Headings */
h1: 1.875rem (30px) / font-size: text-3xl
h2: 1.5rem (24px)
h3: 1.25rem (20px)
h4: 1.125rem (18px)

/* Body */
Base: 1rem (16px)
Small: 0.875rem (14px) / text-sm
Extra Small: 0.75rem (12px) / text-xs

/* OTP Input */
OTP Digit: 1.5rem (24px) / text-2xl
```

### **Pesos**

```css
Regular: 400
Medium: 500
Semibold: 600
Bold: 700
```

---

## 🔲 Componentes

### **BF-PhoneInput**

**Specs:**
- Altura: `h-14` (56px)
- Padding: `px-4` (16px)
- Border: `border-2` (2px)
- Border Radius: `rounded-xl` (12px)
- Ícone: `Phone` (20px)
- Gap ícone-input: `gap-3` (12px)

**Estados:**
```css
/* Default */
border: var(--border)
background: #FFFFFF

/* Focused */
border: var(--bf-blue-primary)
shadow: shadow-lg shadow-blue-500/10

/* Error */
border: var(--destructive)

/* Disabled */
opacity: 0.5
background: var(--muted)
cursor: not-allowed
```

**Formatação:**
```
Input: (00) 00000-0000
Aceita: 10 ou 11 dígitos
Máscara: Automática
```

---

### **BF-OTPInput**

**Specs:**
- Tamanho: `w-12 h-14 sm:w-14 sm:h-16` (48x56px / 56x64px)
- Text: `text-2xl text-center` (24px centralizado)
- Border: `border-2` (2px)
- Border Radius: `rounded-xl` (12px)
- Gap: `gap-2 sm:gap-3` (8px / 12px)
- Dígitos: 6

**Estados:**
```css
/* Default */
border: var(--border)
background: #FFFFFF

/* Focused */
border: var(--bf-blue-primary)
shadow: shadow-lg shadow-blue-500/10
transform: scale-105

/* Filled */
border: var(--bf-green-primary)

/* Error */
border: var(--destructive)

/* Disabled/Loading */
opacity: 0.5
background: var(--muted)
```

**Comportamento:**
- Auto-avança para próximo campo
- Backspace volta para campo anterior
- Suporta colar código completo
- Setas para navegação

---

### **BF-Button (Login)**

**Variante Primary:**
```css
background: var(--bf-blue-primary)
color: white
height: h-12 (48px) / h-14 (56px) para size="lg"
padding: px-6 py-3
border-radius: rounded-xl (12px)
font-weight: 600 (semibold)
transition: all 200ms

/* Hover */
background: var(--bf-blue-dark)
transform: translateY(-1px)
shadow: shadow-lg

/* Disabled */
opacity: 0.5
cursor: not-allowed

/* Loading */
opacity: 0.8
icon: Loader2 (spinning)
```

**Full Width:**
```css
width: w-full (100%)
```

---

### **BF-AlertMessage**

**Specs:**
- Padding: `p-4` (16px)
- Border: `border-2` (2px)
- Border Radius: `rounded-xl` (12px)
- Gap: `gap-3` (12px)
- Ícone: 20px

**Variantes:**

```css
/* Error */
background: #FEF2F2 (bg-red-50)
border: #FECACA (border-red-200)
icon-color: var(--destructive)
icon: AlertCircle

/* Success */
background: #E8FFF4 (bg-green-50)
border: #C3F5DC (border-green-200)
icon-color: var(--bf-green-primary)
icon: CheckCircle

/* Info */
background: #EFF6FF (bg-blue-50)
border: #BFDBFE (border-blue-100)
icon-color: var(--bf-blue-primary)
icon: Info

/* Warning */
background: #FFFBEB (bg-yellow-50)
border: #FDE68A (border-yellow-200)
icon-color: var(--warning)
icon: AlertTriangle
```

---

## 📱 Responsividade

### **Breakpoints**

```css
Mobile:     < 640px (sm)
Tablet:     640px - 1024px
Desktop:    > 1024px
```

### **Layout Responsivo**

```css
/* Container */
Mobile:     padding: p-4 (16px)
Desktop:    padding: p-6 sm:p-8 (24px / 32px)

/* Card */
Mobile:     width: 100% com padding lateral
Desktop:    max-width: max-w-md (448px)

/* OTP Input */
Mobile:     w-12 h-14 gap-2 (48x56px, gap 8px)
Desktop:    w-14 h-16 gap-3 (56x64px, gap 12px)

/* Logo Container */
Mobile:     p-3
Desktop:    p-4
```

---

## 🎭 Animações

### **Transições**

```css
/* Padrão */
transition: all 200ms ease

/* Suave */
transition: all 300ms ease-in-out

/* Rápida */
transition: all 150ms ease
```

### **Animações Específicas**

```css
/* Alert entrada */
animate-in slide-in-from-top-2 fade-in duration-300

/* Button hover */
transform: translateY(-1px)

/* OTP focus */
transform: scale-105

/* Loading spinner */
animate-spin
```

### **Easing**

```css
Default:    ease
Smooth:     ease-in-out
Bounce:     cubic-bezier(0.68, -0.55, 0.265, 1.55)
```

---

## 🎯 Estados de UI

### **Loading States**

```tsx
/* Button */
<BFButton loading={true}>
  <Loader2 className="animate-spin" />
  Carregando...
</BFButton>

/* OTP Input */
<BFOTPInput loading={true} />
// Mostra spinner ao lado dos campos
```

### **Error States**

```tsx
/* Input com erro */
<BFPhoneInput error="Número inválido" />

/* Alert de erro */
<BFAlertMessage
  variant="error"
  message="Erro ao enviar código"
/>
```

### **Disabled States**

```tsx
/* Input desabilitado */
<BFPhoneInput disabled={true} />

/* Button desabilitado */
<BFButton disabled={true}>
  Enviar código
</BFButton>
```

---

## 🔐 Validações

### **Telefone**

```typescript
// Formato aceito
const phoneRegex = /^\(\d{2}\) \d{4,5}-\d{4}$/;

// Validação
const isValid = (phone: string) => {
  const numbers = phone.replace(/\D/g, '');
  return numbers.length === 10 || numbers.length === 11;
};
```

### **OTP**

```typescript
// Formato aceito
const otpRegex = /^\d{6}$/;

// Validação
const isValid = (otp: string) => {
  return otp.length === 6 && /^\d+$/.test(otp);
};
```

---

## 🌐 Background Gradient

```css
/* Login Page Background */
background: linear-gradient(
  to bottom right,
  var(--bf-navy),
  var(--bf-navy-light),
  var(--bf-blue-primary)
);

/* Classes Tailwind */
className="bg-gradient-to-br from-[var(--bf-navy)] via-[var(--bf-navy-light)] to-[var(--bf-blue-primary)]"
```

---

## ♿ Acessibilidade

### **ARIA Attributes**

```tsx
/* Input com erro */
<input
  aria-invalid={!!error}
  aria-describedby={error ? 'phone-error' : undefined}
/>

/* Mensagem de erro */
<p id="phone-error" role="alert">
  {error}
</p>

/* OTP digit label */
<input
  aria-label={`Dígito ${index + 1} de ${length}`}
/>

/* Alert message */
<div role="alert" aria-live="polite">
  {message}
</div>
```

### **Keyboard Navigation**

```
Tab:            Navega entre campos
Shift + Tab:    Volta campo
Arrow Left:     Campo anterior (OTP)
Arrow Right:    Próximo campo (OTP)
Backspace:      Apaga e volta (OTP)
Enter:          Submit do formulário
```

### **Focus Management**

```tsx
// Auto-focus no primeiro campo
<BFPhoneInput autoFocus />

// Focus após envio de código
<BFOTPInput autoFocus />
```

---

## 📊 Data-Test Attributes

### **Componentes**

```tsx
/* PhoneInput */
data-test="bf-phone-input"
data-test="bf-phone-input-field"
data-test="bf-phone-input-error"

/* OTPInput */
data-test="bf-otp-input"
data-test="bf-otp-input-digit-0"
data-test="bf-otp-input-digit-1"
// ... até digit-5
data-test="bf-otp-input-loading"
data-test="bf-otp-input-error"

/* AlertMessage */
data-test="bf-alert-message"
data-test="bf-alert-message-icon"
data-test="bf-alert-message-title"
data-test="bf-alert-message-message"
data-test="bf-alert-message-close"

/* Login Page */
data-test="login-page"
data-test="login-card"
data-test="phone-step"
data-test="otp-step"
data-test="send-code-button"
data-test="verify-button"
data-test="resend-button"
data-test="back-button"
```

---

## 💡 Exemplo de Uso

### **Fluxo Completo**

```tsx
import { Login } from './pages/Login';

// No App.tsx
const [isAuthenticated, setIsAuthenticated] = useState(false);

if (!isAuthenticated) {
  return <Login onSuccess={() => setIsAuthenticated(true)} />;
}
```

### **Componentes Individuais**

```tsx
import { BFPhoneInput } from './components/BF-PhoneInput';
import { BFOTPInput } from './components/BF-OTPInput';
import { BFAlertMessage } from './components/BF-AlertMessage';

// PhoneInput
<BFPhoneInput
  value={phone}
  onChange={setPhone}
  error={phoneError}
  autoFocus
  data-test="phone-input"
/>

// OTPInput
<BFOTPInput
  value={otp}
  onChange={setOtp}
  loading={isVerifying}
  error={otpError}
  autoFocus
  data-test="otp-input"
/>

// AlertMessage
<BFAlertMessage
  variant="error"
  message="Código inválido"
  onClose={() => setError('')}
  data-test="error-alert"
/>
```

---

## 📦 Exports

```typescript
// components/BF-PhoneInput.tsx
export { BFPhoneInput };
export type { BFPhoneInputProps };

// components/BF-OTPInput.tsx
export { BFOTPInput };
export type { BFOTPInputProps };

// components/BF-AlertMessage.tsx
export { BFAlertMessage };
export type { BFAlertMessageProps, AlertVariant };

// pages/Login.tsx
export { Login };
export default Login;
```

---

## 🎨 Paleta de Cores Completa

```css
/* Cores Principais */
Green Primary:   #00D66F
Green Dark:      #00A854
Green Light:     #4DFFB3
Blue Primary:    #0066FF
Blue Dark:       #0047B3
Navy:            #0A1628
Navy Light:      #1A2B42

/* Estados */
Success:         #00D66F
Error:           #EF4444
Warning:         #F59E0B
Info:            #0066FF

/* Neutras */
White:           #FFFFFF
Background:      #F5F7FA
Foreground:      #0A1628
Muted:           #E5E9F0
Muted Text:      #64748B
Border:          #E5E7EB

/* Transparências */
Blue 10%:        rgba(0, 102, 255, 0.1)
Green 10%:       rgba(0, 214, 111, 0.1)
```

---

## ✅ Checklist de Implementação

### **Componentes Criados**
- [x] BF-PhoneInput
- [x] BF-OTPInput  
- [x] BF-AlertMessage
- [x] Login Page

### **Features Implementadas**
- [x] Formatação automática de telefone
- [x] Input OTP com 6 dígitos
- [x] Auto-navegação entre campos OTP
- [x] Suporte a colar código completo
- [x] Estados de loading
- [x] Estados de erro
- [x] Validações
- [x] Countdown para reenvio
- [x] Navegação entre etapas
- [x] Responsividade completa
- [x] Acessibilidade (ARIA)
- [x] Data-test attributes
- [x] Animações suaves
- [x] Tema esportivo

### **Design Tokens**
- [x] Cores definidas
- [x] Espaçamentos padronizados
- [x] Tipografia configurada
- [x] Animações especificadas
- [x] Breakpoints documentados

---

**Criado por:** Bot Fut Design System  
**Versão:** 1.0.0  
**Data:** Novembro 2024
