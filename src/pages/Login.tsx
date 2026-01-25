import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BFPhoneInput } from '../components/BF-PhoneInput';
import { BFOTPInput } from '../components/BF-OTPInput';
import { BFButton } from '../components/BF-Button';
import { BFLogo } from '../components/BF-Logo';
import { BFAlertMessage } from '../components/BF-AlertMessage';
import { ArrowLeft, Smartphone } from 'lucide-react';
import { authAPI, tokenService } from '../lib/axios';
import { useAuthContext } from '../contexts/AuthContext';

type LoginStep = 'phone' | 'otp';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { signIn } = useAuthContext();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [step, setStep] = useState<LoginStep>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [canResend, setCanResend] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(60);

  useEffect(() => {
    const checkAuth = async () => {
      if (authAPI.isAuthenticated()) {
        try {
          const user = await authAPI.getMe();
          tokenService.setUser(user);

          // Check if workspace is selected
          const storedWorkspaceId = localStorage.getItem('workspaceId');
          if (!storedWorkspaceId && user.workspaces && user.workspaces.length > 1) {
            navigate('/select-workspace', { replace: true });
            return;
          }

          if (user.role === 'admin') {
            navigate('/admin/dashboard', { replace: true });
          } else {
            navigate('/user/dashboard', { replace: true });
          }
        } catch (error) {
          console.error('Token validation failed:', error);
          tokenService.clearTokens();
          setIsCheckingAuth(false);
        }
      } else {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const isPhoneValid = (): boolean => {
    const numbers = phone.replace(/\D/g, '');
    return numbers.length === 10 || numbers.length === 11;
  };

  const isOtpValid = (): boolean => {
    return otp.length === 6;
  };

  const handleSendCode = async () => {
    setError('');

    if (!isPhoneValid()) {
      setError('Por favor, digite um número de telefone válido');
      return;
    }

    setLoading(true);
    try {
      let numbers = phone.replace(/\D/g, '');

      // Smart normalization: only remove mobile '9' if DDD doesn't start with '9'
      if (numbers.length === 11 && numbers.charAt(2) === '9') {
        const ddd = numbers.substring(0, 2);
        // Only remove the '9' if DDD doesn't start with '9' (e.g., DDD 11, 21, 85)
        // Keep the '9' for DDDs like 49, 91, 92, etc.
        if (!ddd.startsWith('9')) {
          numbers = numbers.slice(0, 2) + numbers.slice(3);
        }
      }

      const phoneWithCountryCode = numbers.startsWith('55') ? numbers : `55${numbers}`;
      await authAPI.requestOTP(phoneWithCountryCode);
      setStep('otp');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Erro ao enviar código. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    setError('');

    if (!isOtpValid()) {
      setError('Por favor, digite o código completo');
      return;
    }

    setLoading(true);

    try {
      let numbers = phone.replace(/\D/g, '');

      if (numbers.length === 11 && numbers.charAt(2) === '9') {
        const ddd = numbers.substring(0, 2);
        if (!ddd.startsWith('9')) {
          numbers = numbers.slice(0, 2) + numbers.slice(3);
        }
      }

      const phoneWithCountryCode = numbers.startsWith('55') ? numbers : `55${numbers}`;

      // Use AuthContext signIn instead of direct API call
      await signIn(phoneWithCountryCode, otp);

      // Wait a bit for state to update
      await new Promise(resolve => setTimeout(resolve, 100));

      const savedToken = localStorage.getItem('accessToken');

      if (!savedToken) {
        setError('Erro ao salvar credenciais. Tente novamente.');
        setLoading(false);
        return;
      }

      // Get user data from localStorage (set by signIn)
      const userData = tokenService.getUser();

      // Check workspace selection logic
      if (userData?.workspaces) {
        if (userData.workspaces.length === 0) {
          // No workspaces - show message or redirect to create workspace
          setError('Você não pertence a nenhum grupo ainda.');
          setLoading(false);
          return;
        } else if (userData.workspaces.length === 1) {
          // Auto-selected by signIn, proceed to dashboard
          const workspace = userData.workspaces[0];
          const wsRole = (workspace.role || '').toLowerCase();

          if (wsRole === 'admin' || wsRole === 'owner' || userData.role === 'admin') {
            navigate('/admin/dashboard');
          } else {
            navigate('/user/dashboard');
          }
        } else {
          // Multiple workspaces - redirect to selection
          navigate('/select-workspace');
        }
      } else {
        // Fallback to old behavior if no workspaces in response
        const userRole = userData?.role || 'user';
        if (userRole === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/user/dashboard');
        }
      }
    } catch (error: any) {
      console.error('Verify OTP error:', error);
      setError(error.response?.data?.message || 'Código inválido. Tente novamente.');
      setLoading(false);
    }
  };

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

  const handleResendCode = async () => {
    if (!canResend) return;

    setError('');
    setLoading(true);
    setOtp('');

    try {
      let numbers = phone.replace(/\D/g, '');

      // Smart normalization: only remove mobile '9' if DDD doesn't start with '9'
      if (numbers.length === 11 && numbers.charAt(2) === '9') {
        const ddd = numbers.substring(0, 2);
        // Only remove the '9' if DDD doesn't start with '9' (e.g., DDD 11, 21, 85)
        // Keep the '9' for DDDs like 49, 91, 92, etc.
        if (!ddd.startsWith('9')) {
          numbers = numbers.slice(0, 2) + numbers.slice(3);
        }
      }

      const phoneWithCountryCode = numbers.startsWith('55') ? numbers : `55${numbers}`;
      await authAPI.requestOTP(phoneWithCountryCode);
      setStep('otp');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Erro ao enviar código. Tente novamente.');
    } finally {
      setLoading(false);
    }
    startResendCountdown();
    setLoading(false);
  };

  const handleBack = () => {
    setStep('phone');
    setOtp('');
    setError('');
    setCanResend(false);
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--bf-navy)] via-[var(--bf-navy-light)] to-[var(--bf-blue-primary)] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-white border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-2 text-white">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

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
                  Você receberá um código de verificação via WhatsApp
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
                disabled={loading}
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
                autoFocus
              />

              <BFButton
                variant="primary"
                size="lg"
                fullWidth
                onClick={handleVerifyCode}
                disabled={!isOtpValid() || loading}
                loading={loading}
                data-test="verify-button"
              >
                {loading ? 'Verificando...' : 'Verificar código'}
              </BFButton>

              {/* Reenviar código */}
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
