/**
 * Bot Fut - Exemplos de Uso dos Componentes de Login
 * 
 * Este arquivo contém exemplos práticos de como usar os componentes
 * de autenticação em diferentes cenários.
 */

import React, { useState } from 'react';
import { BFPhoneInput } from '../components/BF-PhoneInput';
import { BFOTPInput } from '../components/BF-OTPInput';
import { BFAlertMessage } from '../components/BF-AlertMessage';
import { BFButton } from '../components/BF-Button';
import { authAPI } from '../lib/axios';

/**
 * EXEMPLO 1: PhoneInput Básico
 * Uso mais simples do componente de telefone
 */
export const PhoneInputBasicExample = () => {
  const [phone, setPhone] = useState('');

  return (
    <div className="p-8 max-w-md">
      <BFPhoneInput
        value={phone}
        onChange={setPhone}
        placeholder="Digite seu telefone"
      />

      <p className="mt-4 text-sm text-muted-foreground">
        Valor: {phone || '(vazio)'}
      </p>
    </div>
  );
};

/**
 * EXEMPLO 2: PhoneInput com Validação
 * Mostrando mensagens de erro
 */
export const PhoneInputWithValidationExample = () => {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const handleValidate = () => {
    const numbers = phone.replace(/\D/g, '');

    if (!phone) {
      setError('Telefone é obrigatório');
    } else if (numbers.length < 10) {
      setError('Telefone incompleto');
    } else {
      setError('');
      alert('Telefone válido!');
    }
  };

  return (
    <div className="p-8 max-w-md space-y-4">
      <BFPhoneInput
        value={phone}
        onChange={(value) => {
          setPhone(value);
          setError(''); // Limpa erro ao digitar
        }}
        error={error}
        autoFocus
      />

      <BFButton
        variant="primary"
        onClick={handleValidate}
        fullWidth
      >
        Validar
      </BFButton>
    </div>
  );
};

/**
 * EXEMPLO 3: OTPInput Básico
 * Uso simples do componente OTP
 */
export const OTPInputBasicExample = () => {
  const [otp, setOtp] = useState('');

  return (
    <div className="p-8 max-w-md">
      <BFOTPInput
        value={otp}
        onChange={setOtp}
      />

      <p className="mt-4 text-sm text-muted-foreground text-center">
        Código: {otp || '(vazio)'} ({otp.length}/6)
      </p>
    </div>
  );
};

/**
 * EXEMPLO 4: OTPInput com Loading
 * Mostrando estado de verificação
 */
export const OTPInputWithLoadingExample = () => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    setLoading(true);

    // Simula verificação
    await new Promise(resolve => setTimeout(resolve, 2000));

    setLoading(false);
    alert(`Código ${otp} verificado!`);
    setOtp('');
  };

  return (
    <div className="p-8 max-w-md space-y-6">
      <BFOTPInput
        value={otp}
        onChange={setOtp}
        loading={loading}
      />

      <BFButton
        variant="primary"
        onClick={handleVerify}
        disabled={otp.length !== 6 || loading}
        loading={loading}
        fullWidth
      >
        {loading ? 'Verificando...' : 'Verificar'}
      </BFButton>
    </div>
  );
};

/**
 * EXEMPLO 5: AlertMessage - Todas as Variantes
 * Mostrando os diferentes tipos de alerta
 */
export const AlertMessageVariantsExample = () => {
  const [showError, setShowError] = useState(true);
  const [showSuccess, setShowSuccess] = useState(true);
  const [showInfo, setShowInfo] = useState(true);
  const [showWarning, setShowWarning] = useState(true);

  return (
    <div className="p-8 space-y-4 max-w-2xl">
      <h2 className="mb-6">Variantes de Alerta</h2>

      {showError && (
        <BFAlertMessage
          variant="error"
          title="Erro"
          message="Não foi possível processar sua solicitação. Tente novamente."
          onClose={() => setShowError(false)}
        />
      )}

      {showSuccess && (
        <BFAlertMessage
          variant="success"
          title="Sucesso"
          message="Operação realizada com sucesso!"
          onClose={() => setShowSuccess(false)}
        />
      )}

      {showInfo && (
        <BFAlertMessage
          variant="info"
          title="Informação"
          message="Você receberá um código de verificação via SMS."
          onClose={() => setShowInfo(false)}
        />
      )}

      {showWarning && (
        <BFAlertMessage
          variant="warning"
          title="Atenção"
          message="Seu código expirará em 5 minutos."
          onClose={() => setShowWarning(false)}
        />
      )}

      <div className="mt-6">
        <BFButton
          variant="outline"
          onClick={() => {
            setShowError(true);
            setShowSuccess(true);
            setShowInfo(true);
            setShowWarning(true);
          }}
        >
          Mostrar Todos
        </BFButton>
      </div>
    </div>
  );
};

/**
 * EXEMPLO 6: Fluxo Completo de Login
 * Demonstra o fluxo completo com ambos os componentes
 */
export const FullLoginFlowExample = () => {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isPhoneValid = () => {
    const numbers = phone.replace(/\D/g, '');
    return numbers.length === 10 || numbers.length === 11;
  };

  const handleSendCode = async () => {
    setError('');


    if (!isPhoneValid()) {
      setError('Digite um número de telefone válido');
      return;
    }

    setLoading(true);

    try {
      await authAPI.requestOTP(phone);
      setStep('otp');
    } catch (error: any) {
      console.log(`error: ${error}`);

      setError(error.response?.data?.message || 'Erro ao enviar código. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    setError('');

    if (otp.length !== 6) {
      setError('Digite o código completo');
      return;
    }

    setLoading(true);

    try {
      await authAPI.verifyOTP(phone, otp);
      alert('Login realizado com sucesso!');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Código inválido. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-center mb-6">
          {step === 'phone' ? 'Digite seu telefone' : 'Digite o código'}
        </h2>

        {error && (
          <div className="mb-6">
            <BFAlertMessage
              variant="error"
              message={error}
              onClose={() => setError('')}
            />
          </div>
        )}

        {step === 'phone' ? (
          <div className="space-y-6">
            <BFPhoneInput
              value={phone}
              onChange={setPhone}
              autoFocus
              disabled={loading}
            />

            <BFButton
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleSendCode}
              disabled={!isPhoneValid() || loading}
              loading={loading}
            >
              {loading ? 'Enviando...' : 'Enviar código'}
            </BFButton>
          </div>
        ) : (
          <div className="space-y-6">
            <button
              onClick={() => {
                setStep('phone');
                setOtp('');
                setError('');
              }}
              className="text-sm text-muted-foreground hover:text-foreground mb-4"
            >
              ← Voltar
            </button>

            <div className="text-center mb-4">
              <p className="text-sm text-muted-foreground">
                Código enviado para
              </p>
              <p className="text-[var(--bf-blue-primary)]">{phone}</p>
            </div>

            <BFOTPInput
              value={otp}
              onChange={setOtp}
              loading={loading}
              autoFocus
            />

            <BFButton
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleVerifyCode}
              disabled={otp.length !== 6 || loading}
              loading={loading}
            >
              {loading ? 'Verificando...' : 'Verificar código'}
            </BFButton>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * EXEMPLO 7: Form com Múltiplos Campos
 * Login com telefone e outros dados
 */
export const CompleteFormExample = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    acceptTerms: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name) {
      newErrors.name = 'Nome é obrigatório';
    }

    const phoneNumbers = formData.phone.replace(/\D/g, '');
    if (phoneNumbers.length < 10) {
      newErrors.phone = 'Telefone inválido';
    }

    if (!formData.acceptTerms) {
      newErrors.terms = 'Você deve aceitar os termos';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      alert('Formulário enviado com sucesso!');
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <h2 className="text-center mb-6">Cadastro</h2>

        {/* Nome */}
        <div>
          <label className="block mb-2 text-sm">Nome completo</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => {
              setFormData({ ...formData, name: e.target.value });
              setErrors({ ...errors, name: '' });
            }}
            className={`
              w-full h-14 px-4 border-2 rounded-xl
              ${errors.name ? 'border-destructive' : 'border-border'}
            `}
            placeholder="João Silva"
          />
          {errors.name && (
            <p className="mt-2 text-sm text-destructive">{errors.name}</p>
          )}
        </div>

        {/* Telefone */}
        <BFPhoneInput
          value={formData.phone}
          onChange={(value) => {
            setFormData({ ...formData, phone: value });
            setErrors({ ...errors, phone: '' });
          }}
          error={errors.phone}
        />

        {/* Termos */}
        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.acceptTerms}
              onChange={(e) => {
                setFormData({ ...formData, acceptTerms: e.target.checked });
                setErrors({ ...errors, terms: '' });
              }}
              className="w-4 h-4"
            />
            <span className="text-sm">Aceito os termos de uso</span>
          </label>
          {errors.terms && (
            <p className="mt-2 text-sm text-destructive">{errors.terms}</p>
          )}
        </div>

        <BFButton
          variant="primary"
          size="lg"
          fullWidth
          onClick={handleSubmit}
        >
          Cadastrar
        </BFButton>
      </div>
    </div>
  );
};

/**
 * EXEMPLO 8: OTP com Resend Timer
 * Mostrando countdown para reenvio
 */
export const OTPWithResendExample = () => {
  const [otp, setOtp] = useState('');
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(60);

  React.useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleResend = () => {
    setOtp('');
    setCountdown(60);
    setCanResend(false);
    alert('Código reenviado!');
  };

  return (
    <div className="p-8 max-w-md mx-auto space-y-6">
      <BFOTPInput
        value={otp}
        onChange={setOtp}
      />

      <div className="text-center">
        {canResend ? (
          <button
            onClick={handleResend}
            className="text-sm text-[var(--bf-blue-primary)] hover:underline"
          >
            Reenviar código
          </button>
        ) : (
          <p className="text-sm text-muted-foreground">
            Reenviar código em{' '}
            <span className="text-[var(--bf-blue-primary)]">
              {countdown}s
            </span>
          </p>
        )}
      </div>
    </div>
  );
};

/**
 * EXEMPLO 9: Playground Interativo
 * Permite testar todas as props dos componentes
 */
export const PlaygroundExample = () => {
  const [phoneValue, setPhoneValue] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [phoneDisabled, setPhoneDisabled] = useState(false);

  const [otpValue, setOtpValue] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h2 className="mb-8 text-center">Playground de Componentes</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* PhoneInput Playground */}
        <div className="space-y-6">
          <h3>PhoneInput</h3>

          <BFPhoneInput
            value={phoneValue}
            onChange={setPhoneValue}
            error={phoneError}
            disabled={phoneDisabled}
          />

          <div className="space-y-2">
            <button
              onClick={() => setPhoneError(phoneError ? '' : 'Número inválido')}
              className="block w-full p-2 bg-red-100 rounded"
            >
              Toggle Error
            </button>
            <button
              onClick={() => setPhoneDisabled(!phoneDisabled)}
              className="block w-full p-2 bg-gray-100 rounded"
            >
              Toggle Disabled
            </button>
            <button
              onClick={() => setPhoneValue('')}
              className="block w-full p-2 bg-blue-100 rounded"
            >
              Limpar
            </button>
          </div>
        </div>

        {/* OTPInput Playground */}
        <div className="space-y-6">
          <h3>OTPInput</h3>

          <BFOTPInput
            value={otpValue}
            onChange={setOtpValue}
            error={otpError}
            loading={otpLoading}
          />

          <div className="space-y-2">
            <button
              onClick={() => setOtpError(otpError ? '' : 'Código inválido')}
              className="block w-full p-2 bg-red-100 rounded"
            >
              Toggle Error
            </button>
            <button
              onClick={() => setOtpLoading(!otpLoading)}
              className="block w-full p-2 bg-yellow-100 rounded"
            >
              Toggle Loading
            </button>
            <button
              onClick={() => setOtpValue('')}
              className="block w-full p-2 bg-blue-100 rounded"
            >
              Limpar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Export all examples
export default {
  PhoneInputBasicExample,
  PhoneInputWithValidationExample,
  OTPInputBasicExample,
  OTPInputWithLoadingExample,
  AlertMessageVariantsExample,
  FullLoginFlowExample,
  CompleteFormExample,
  OTPWithResendExample,
  PlaygroundExample,
};
