# 📚 Bot Fut - Exemplos de Login

Esta pasta contém exemplos práticos de uso dos componentes de autenticação.

---

## 📂 Arquivos

### **LoginExamples.tsx**

Arquivo com 9 exemplos diferentes de uso dos componentes:

1. **PhoneInputBasicExample** - Uso básico do input de telefone
2. **PhoneInputWithValidationExample** - Input com validação e erro
3. **OTPInputBasicExample** - Uso básico do input OTP
4. **OTPInputWithLoadingExample** - OTP com loading state
5. **AlertMessageVariantsExample** - Todas as variantes de alerta
6. **FullLoginFlowExample** - Fluxo completo de login
7. **CompleteFormExample** - Formulário com múltiplos campos
8. **OTPWithResendExample** - OTP com timer de reenvio
9. **PlaygroundExample** - Playground interativo para testar props

---

## 🚀 Como Usar os Exemplos

### **Opção 1: Rodar Exemplo Individual**

```tsx
// App.tsx
import { PhoneInputBasicExample } from './examples/LoginExamples';

export default function App() {
  return <PhoneInputBasicExample />;
}
```

### **Opção 2: Criar Página de Exemplos**

```tsx
// App.tsx
import { useState } from 'react';
import * as Examples from './examples/LoginExamples';

const examplesList = [
  { name: 'PhoneInput Básico', component: Examples.PhoneInputBasicExample },
  { name: 'PhoneInput com Validação', component: Examples.PhoneInputWithValidationExample },
  { name: 'OTPInput Básico', component: Examples.OTPInputBasicExample },
  { name: 'OTPInput com Loading', component: Examples.OTPInputWithLoadingExample },
  { name: 'AlertMessage Variantes', component: Examples.AlertMessageVariantsExample },
  { name: 'Fluxo Completo', component: Examples.FullLoginFlowExample },
  { name: 'Formulário Completo', component: Examples.CompleteFormExample },
  { name: 'OTP com Resend', component: Examples.OTPWithResendExample },
  { name: 'Playground', component: Examples.PlaygroundExample },
];

export default function App() {
  const [selectedExample, setSelectedExample] = useState(0);
  const ExampleComponent = examplesList[selectedExample].component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--bf-navy)] to-[var(--bf-blue-primary)]">
      {/* Navegação */}
      <div className="bg-white border-b p-4">
        <h1 className="text-center mb-4">Exemplos de Login - Bot Fut</h1>
        <div className="flex flex-wrap gap-2 justify-center">
          {examplesList.map((example, index) => (
            <button
              key={index}
              onClick={() => setSelectedExample(index)}
              className={`
                px-4 py-2 rounded-lg transition-all
                ${selectedExample === index
                  ? 'bg-[var(--bf-blue-primary)] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              {example.name}
            </button>
          ))}
        </div>
      </div>

      {/* Exemplo */}
      <div className="py-8">
        <ExampleComponent />
      </div>
    </div>
  );
}
```

---

## 📖 Detalhes dos Exemplos

### **1. PhoneInput Básico**

O exemplo mais simples, mostrando apenas o input de telefone com formatação automática.

**Aprenda:**
- Como usar o componente básico
- Formatação automática de telefone
- Display do valor atual

```tsx
<BFPhoneInput
  value={phone}
  onChange={setPhone}
/>
```

---

### **2. PhoneInput com Validação**

Adiciona validação e mensagens de erro ao input de telefone.

**Aprenda:**
- Como validar telefone
- Mostrar mensagens de erro
- Limpar erros ao digitar
- Desabilitar botão quando inválido

```tsx
<BFPhoneInput
  value={phone}
  onChange={setPhone}
  error={error}
/>
```

---

### **3. OTPInput Básico**

Exemplo simples do input OTP com 6 dígitos.

**Aprenda:**
- Como usar o componente OTP
- Auto-navegação entre campos
- Display do progresso (X/6)

```tsx
<BFOTPInput
  value={otp}
  onChange={setOtp}
/>
```

---

### **4. OTPInput com Loading**

Mostra o input OTP com estado de loading durante verificação.

**Aprenda:**
- Como usar loading state
- Desabilitar campos durante loading
- Mostrar spinner
- Limpar após verificação

```tsx
<BFOTPInput
  value={otp}
  onChange={setOtp}
  loading={loading}
/>
```

---

### **5. AlertMessage Variantes**

Demonstra todas as 4 variantes de alerta disponíveis.

**Aprenda:**
- Variantes: error, success, info, warning
- Como usar título e mensagem
- Botão de fechar
- Cores e ícones de cada variante

```tsx
<BFAlertMessage
  variant="error"
  title="Erro"
  message="Descrição do erro"
  onClose={() => setShow(false)}
/>
```

---

### **6. Fluxo Completo**

Implementação completa do fluxo de login com ambas as etapas.

**Aprenda:**
- Gerenciar múltiplas etapas
- Transição entre telas
- Validação em cada etapa
- Loading states
- Navegação (voltar)

**Features:**
- ✅ Etapa de telefone
- ✅ Etapa de OTP
- ✅ Validações
- ✅ Estados de loading
- ✅ Mensagens de erro
- ✅ Botão voltar

---

### **7. Formulário Completo**

Exemplo de formulário de cadastro com telefone e outros campos.

**Aprende:**
- Integrar PhoneInput em formulário
- Múltiplos campos
- Validação de formulário completo
- Gerenciar erros individuais
- Submit de formulário

**Campos:**
- Nome completo
- Telefone (usando BFPhoneInput)
- Checkbox de termos

---

### **8. OTP com Resend**

Input OTP com funcionalidade de reenviar código após countdown.

**Aprenda:**
- Implementar countdown timer
- Habilitar/desabilitar reenvio
- Resetar campos ao reenviar
- Feedback visual do timer

**Features:**
- ✅ Countdown de 60 segundos
- ✅ Botão "Reenviar" após countdown
- ✅ Limpa campos ao reenviar
- ✅ Display do tempo restante

---

### **9. Playground**

Ambiente interativo para testar todas as props dos componentes.

**Aprenda:**
- Todas as props disponíveis
- Como funcionam os estados
- Testar diferentes combinações
- Debug visual

**Controles:**
- Toggle error
- Toggle disabled/loading
- Limpar valores
- Ver mudanças em tempo real

---

## 🎯 Use Cases Práticos

### **Para Aprender**

1. Comece com exemplos básicos (1-4)
2. Entenda estados e validações
3. Veja o fluxo completo (6)
4. Use o playground (9) para experimentar

### **Para Implementar**

1. Copie o exemplo mais próximo do seu caso de uso
2. Adapte para suas necessidades
3. Integre com seu backend
4. Adicione validações específicas

### **Para Demonstrar**

1. Use a página de exemplos (Opção 2 acima)
2. Mostre para stakeholders
3. Teste interatividade
4. Valide UX/UI

---

## 📝 Personalizando os Exemplos

### **Mudar Cores**

```tsx
// Em styles/globals.css
:root {
  --bf-blue-primary: #0066FF;    /* Sua cor primária */
  --bf-green-primary: #00D66F;   /* Sua cor de sucesso */
}
```

### **Adicionar Validação Customizada**

```tsx
const validatePhone = (phone: string) => {
  const numbers = phone.replace(/\D/g, '');
  
  // Sua lógica de validação
  if (numbers.startsWith('11')) {
    return numbers.length === 11; // São Paulo precisa 11 dígitos
  }
  
  return numbers.length === 10 || numbers.length === 11;
};
```

### **Customizar Mensagens**

```tsx
const messages = {
  pt: {
    phoneRequired: 'Telefone é obrigatório',
    phoneInvalid: 'Telefone inválido',
    otpInvalid: 'Código inválido',
    sendCode: 'Enviar código',
    verify: 'Verificar',
  },
  en: {
    phoneRequired: 'Phone is required',
    phoneInvalid: 'Invalid phone',
    otpInvalid: 'Invalid code',
    sendCode: 'Send code',
    verify: 'Verify',
  },
};
```

---

## 🧪 Testando os Exemplos

### **No Navegador**

```bash
# 1. Iniciar servidor
npm run dev

# 2. Abrir navegador
http://localhost:3000

# 3. Testar interação
- Digite telefone
- Digite código
- Teste estados de erro
- Teste responsividade
```

### **Com Testes Automatizados**

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { PhoneInputBasicExample } from './LoginExamples';

test('formats phone number', () => {
  render(<PhoneInputBasicExample />);
  
  const input = screen.getByRole('textbox');
  fireEvent.change(input, { target: { value: '11999999999' } });
  
  expect(input.value).toBe('(11) 99999-9999');
});
```

---

## 🔗 Links Úteis

- 📄 [LOGIN_README.md](/LOGIN_README.md) - Documentação principal
- 📄 [LOGIN_DESIGN_TOKENS.md](/guidelines/LOGIN_DESIGN_TOKENS.md) - Design tokens
- 📄 [LOGIN_INTEGRATION.md](/guidelines/LOGIN_INTEGRATION.md) - Integração com backend
- 📄 [LOGIN_QUICKSTART.md](/LOGIN_QUICKSTART.md) - Quick start

---

## 💡 Dicas

### **Performance**

- ✅ Use `useMemo` para cálculos pesados
- ✅ Use `useCallback` para handlers
- ✅ Evite re-renders desnecessários

### **Acessibilidade**

- ✅ Sempre use labels descritivas
- ✅ Adicione `aria-*` attributes
- ✅ Teste navegação por teclado
- ✅ Teste com screen reader

### **UX**

- ✅ Mostre feedback visual imediato
- ✅ Mensagens de erro claras
- ✅ Loading states consistentes
- ✅ Animações suaves

---

## 🐛 Problemas Comuns

### **Exemplo não aparece**

```bash
# Verifique imports
import { ExampleName } from './examples/LoginExamples';

# Verifique caminho
./examples/LoginExamples.tsx (correto)
../examples/LoginExamples.tsx (se em subpasta)
```

### **Estilos não aplicam**

```tsx
// Certifique-se de importar globals.css
import './styles/globals.css';
```

### **Componentes não encontrados**

```bash
# Verifique se criou os componentes
/components/BF-PhoneInput.tsx
/components/BF-OTPInput.tsx
/components/BF-AlertMessage.tsx
```

---

## 🎉 Contribuindo

Tem um exemplo legal? Adicione aqui!

1. Crie o exemplo em `LoginExamples.tsx`
2. Documente no README
3. Adicione data-test attributes
4. Teste responsividade
5. Abra um PR

---

**Happy coding!** 🚀⚽

Bot Fut Design System v1.0.0
