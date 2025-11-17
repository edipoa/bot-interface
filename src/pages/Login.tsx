/**
 * Login Page
 * 
 * Tela de autenticação com telefone + OTP
 * - Etapa 1: Entrada de telefone
 * - Etapa 2: Verificação de código OTP
 * - Estados de loading e erro
 * - Responsivo e acessível
 */

import React, { useState } from 'react';
import { BFPhoneInput } from '../components/BF-PhoneInput';
import { BFOTPInput } from '../components/BF-OTPInput';
import { BFButton } from '../components/BF-Button';
import { BFLogo } from '../components/BF-Logo';
import { BFAlertMessage } from '../components/BF-AlertMessage';
import { ArrowLeft, Smartphone } from 'lucide-react';

type LoginStep = 'phone' | 'otp';

interface LoginProps {
  onSuccess?: () => void;
}

export const Login: React.FC<LoginProps> = ({ onSuccess }) => {
  // Estado do formulário
  const [step, setStep] = useState<LoginStep>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  
  // Estados de UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(60);

  // Validação de telefone
  const isPhoneValid = (): boolean => {
    const numbers = phone.replace(/\D/g, '');
    return numbers.length === 10 || numbers.length === 11;
  };

  // Validação de OTP
  const isOtpValid = (): boolean => {
    return otp.length === 6;
  };

  // Simula envio de código
  const handleSendCode = async () => {
    setError('');

    if (!isPhoneValid()) {
      setError('Por favor, digite um número de telefone válido');
      return;
    }

    setLoading(true);

    // Simula chamada de API
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Simula sucesso (90% de chance)
    if (Math.random() > 0.1) {
      setStep('otp');
      startResendCountdown();
      setLoading(false);
    } else {
      // Simula erro
      setError('Erro ao enviar código. Tente novamente.');
      setLoading(false);
    }
  };

  // Simula verificação de código
  const handleVerifyCode = async () => {
    setError('');

    if (!isOtpValid()) {
      setError('Por favor, digite o código completo');
      return;
    }

    setLoading(true);

    // Simula chamada de API
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Simula verificação (90% de sucesso para melhor UX de teste)
    if (Math.random() > 0.1) {
      // Sucesso
      setLoading(false);
      setSuccess(true);
      
      // Mostra mensagem de sucesso por 1s antes de redirecionar
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        }
      }, 1000);
    } else {
      // Código inválido
      setError('Código inválido. Verifique e tente novamente.');
      setOtp('');
      setLoading(false);
    }
  };

  // Countdown para reenvio
  const startResendCountdown = () => {
    setCanResend(false);
    setResendCountdown(60);

    const interval = setInterval(() => {
      setResendCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Reenviar código
  const handleResendCode = async () => {
    if (!canResend) return;

    setError('');
    setLoading(true);
    setOtp('');

    // Simula reenvio
    await new Promise((resolve) => setTimeout(resolve, 1500));

    startResendCountdown();
    setLoading(false);
  };

  // Voltar para tela de telefone
  const handleBack = () => {
    setStep('phone');
    setOtp('');
    setError('');
    setCanResend(false);
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-[var(--bf-navy)] via-[var(--bf-navy-light)] to-[var(--bf-blue-primary)] flex items-center justify-center p-4"
      data-test="login-page"
    >
      {/* Card principal */}
      <div className="w-full max-w-md">
        {/* Logo e Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="bg-white p-4 rounded-2xl shadow-2xl">
              <BFLogo size="lg" />
            </div>
          </div>
          <h1 className="text-3xl text-white mb-2">
            Bem-vindo ao Bot Fut
          </h1>
          <p className="text-blue-200">
            {step === 'phone' 
              ? 'Entre com seu número de telefone' 
              : 'Digite o código de verificação'
            }
          </p>
        </div>

        {/* Card do formulário */}
        <div
          className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8"
          data-test="login-card"
        >
          {/* Indicador de etapa */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div
              className={`
                w-2 h-2 rounded-full transition-all
                ${step === 'phone' ? 'bg-[var(--bf-blue-primary)] w-8' : 'bg-border'}
              `}
            />
            <div
              className={`
                w-2 h-2 rounded-full transition-all
                ${step === 'otp' ? 'bg-[var(--bf-blue-primary)] w-8' : 'bg-border'}
              `}
            />
          </div>

          {/* Mensagens de status */}
          {error && (
            <div className="mb-6">
              <BFAlertMessage
                variant="error"
                message={error}
                onClose={() => setError('')}
              />
            </div>
          )}

          {success && (
            <div className="mb-6">
              <BFAlertMessage
                variant="success"
                title="Sucesso!"
                message="Login realizado com sucesso. Redirecionando..."
              />
            </div>
          )}

          {/* ETAPA 1: Telefone */}
          {step === 'phone' && (
            <div className="space-y-6" data-test="phone-step">
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
                data-test="send-code-button"
              >
                {loading ? 'Enviando...' : 'Enviar código'}
              </BFButton>

              {/* Informação de segurança */}
              <div className="flex items-start gap-3 p-4 bg-blue-50 border-2 border-blue-100 rounded-xl">
                <Smartphone className="w-5 h-5 text-[var(--bf-blue-primary)] flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-700">
                  Você receberá um código de verificação via SMS
                </p>
              </div>
            </div>
          )}

          {/* ETAPA 2: OTP */}
          {step === 'otp' && (
            <div className="space-y-6" data-test="otp-step">
              {/* Botão voltar */}
              <button
                onClick={handleBack}
                disabled={loading || success}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                data-test="back-button"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </button>

              {/* Info do telefone */}
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Código enviado para
                </p>
                <p className="text-[var(--bf-blue-primary)] mt-1">
                  {phone}
                </p>
              </div>

              <BFOTPInput
                value={otp}
                onChange={setOtp}
                loading={loading}
                disabled={success}
                autoFocus
              />

              <BFButton
                variant="primary"
                size="lg"
                fullWidth
                onClick={handleVerifyCode}
                disabled={!isOtpValid() || loading || success}
                loading={loading}
                data-test="verify-button"
              >
                {loading ? 'Verificando...' : success ? 'Redirecionando...' : 'Verificar código'}
              </BFButton>

              {/* Reenviar código */}
              {!success && (
                <div className="text-center">
                  {canResend ? (
                    <button
                      onClick={handleResendCode}
                      disabled={loading}
                      className="text-sm text-[var(--bf-blue-primary)] hover:underline disabled:opacity-50"
                      data-test="resend-button"
                    >
                      Reenviar código
                    </button>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Reenviar código em{' '}
                      <span className="text-[var(--bf-blue-primary)]">
                        {resendCountdown}s
                      </span>
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-blue-200 mt-6">
          Ao continuar, você concorda com nossos{' '}
          <button className="underline hover:text-white transition-colors">
            Termos de Uso
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
