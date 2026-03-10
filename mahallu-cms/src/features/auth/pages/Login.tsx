import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { FiLock, FiPhone, FiRefreshCw, FiUser, FiHome, FiBookOpen, FiClipboard, FiChevronRight } from 'react-icons/fi';
import { authService, AccountOption } from '@/services/authService';
import { initAndSubscribe } from '@/services/oneSignalService';
import { useAuthStore } from '@/store/authStore';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { BRAND_NAME, LOGO_PATH } from '@/constants/theme';
import { ROUTES } from '@/constants/routes';

const phoneSchema = z.object({
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
});

const otpSchema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

type PhoneFormData = z.infer<typeof phoneSchema>;
type OTPFormData = z.infer<typeof otpSchema>;

export default function Login() {
  const navigate = useNavigate();
  const { setUser, setToken } = useAuthStore();
  const [step, setStep] = useState<'phone' | 'otp' | 'select'>('phone');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [devOTP, setDevOTP] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<AccountOption[]>([]);
  const [preAuthToken, setPreAuthToken] = useState('');

  const phoneForm = useForm<PhoneFormData>({
    resolver: zodResolver(phoneSchema),
  });

  const otpForm = useForm<OTPFormData>({
    resolver: zodResolver(otpSchema),
  });

  // Countdown timer for OTP resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendOTP = async (data: PhoneFormData) => {
    try {
      setIsSendingOTP(true);
      setError('');
      const response = await authService.sendOTP(data.phone);
      setPhone(data.phone);
      setOtpSent(true);
      setStep('otp');
      setCountdown(60); // 60 seconds cooldown
      
      // Show OTP in development mode
      if (response.otp) {
        setDevOTP(response.otp);
        console.log('OTP (dev mode):', response.otp);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsSendingOTP(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    await handleSendOTP({ phone });
  };

  const handleVerifyOTP = async (data: OTPFormData) => {
    try {
      setIsLoading(true);
      setError('');
      const response = await authService.verifyOTP({
        phone,
        otp: data.otp,
      });

      if ('requiresRoleSelection' in response && response.requiresRoleSelection) {
        setAccounts(response.accounts);
        setPreAuthToken(response.preAuthToken);
        setStep('select');
        return;
      }

      setUser(response.user);
      setToken(response.token);

      // Subscribe this browser to OneSignal push (fire-and-forget, non-blocking)
      if (response.user.role !== 'member') {
        initAndSubscribe()
          .then((playerId) => {
            if (playerId) {
              authService.registerDevice(playerId).catch(() => {});
            }
          })
          .catch(() => {});
      }

      navigate(response.user.role === 'member' ? ROUTES.MEMBER.OVERVIEW : ROUTES.DASHBOARD);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToPhone = () => {
    setStep('phone');
    setOtpSent(false);
    setError('');
    setDevOTP(null);
    setAccounts([]);
    setPreAuthToken('');
    otpForm.reset();
  };

  const handleSelectAccount = async (userId: string) => {
    try {
      setIsLoading(true);
      setError('');
      const response = await authService.selectAccount(preAuthToken, userId);
      setUser(response.user);
      setToken(response.token);

      if (response.user.role !== 'member') {
        initAndSubscribe()
          .then((playerId) => {
            if (playerId) {
              authService.registerDevice(playerId).catch(() => {});
            }
          })
          .catch(() => {});
      }

      navigate(response.user.role === 'member' ? ROUTES.MEMBER.OVERVIEW : ROUTES.DASHBOARD);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to select account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleLabel = (role: string, instituteName?: string | null) => {
    switch (role) {
      case 'member': return 'Community Member';
      case 'mahall': return 'Mahallu Admin';
      case 'survey': return 'Survey Admin';
      case 'institute': return instituteName ? `Institute Admin — ${instituteName}` : 'Institute Admin';
      case 'super_admin': return 'Super Admin';
      default: return role;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'member': return <FiUser className="h-5 w-5 text-primary-600 dark:text-primary-400" />;
      case 'mahall': return <FiHome className="h-5 w-5 text-primary-600 dark:text-primary-400" />;
      case 'survey': return <FiClipboard className="h-5 w-5 text-primary-600 dark:text-primary-400" />;
      case 'institute': return <FiBookOpen className="h-5 w-5 text-primary-600 dark:text-primary-400" />;
      default: return <FiUser className="h-5 w-5 text-primary-600 dark:text-primary-400" />;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary-50 to-gray-50 dark:from-gray-900 dark:to-gray-950" />
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-primary-200/20 blur-3xl dark:bg-primary-900/10" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-200/20 blur-3xl dark:bg-blue-900/10" />
      </div>

      <Card className="w-full max-w-md relative z-10 border-white/50 dark:border-gray-800 shadow-xl" padding="lg">
        <div className="text-center mb-8">
          <div className="inline-flex mb-4">
            <img 
              src={LOGO_PATH} 
              alt={BRAND_NAME}
              className="h-16 w-16 object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2 tracking-tight">
            {BRAND_NAME}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Sign in to your account to continue
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50/50 backdrop-blur-sm border border-red-200 rounded-xl text-red-600 text-sm dark:bg-red-900/20 dark:border-red-800 dark:text-red-200 animate-in fade-in slide-in-from-top-2">
            {error}
          </div>
        )}

        {step === 'phone' ? (
          <form onSubmit={phoneForm.handleSubmit(handleSendOTP)} className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
            <Input
              label="Phone Number"
              type="tel"
              {...phoneForm.register('phone')}
              error={phoneForm.formState.errors.phone?.message}
              placeholder="Enter your phone number"
              required
              icon={<FiPhone className="h-5 w-5" />}
              className="bg-gray-50/50 dark:bg-gray-900/50"
            />

            <Button type="submit" className="w-full h-11 text-base shadow-lg shadow-primary-500/20" isLoading={isSendingOTP}>
              <FiLock className="h-4 w-4 mr-2" />
              Send OTP
            </Button>
          </form>
        ) : step === 'select' ? (
          <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="mb-4 p-4 bg-blue-50/50 backdrop-blur-sm border border-blue-200 rounded-xl text-blue-700 text-sm dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200">
              <p className="font-semibold text-base">Multiple Accounts Found</p>
              <p className="text-blue-600/80 dark:text-blue-300/80 mt-1">
                Select the account you want to sign in with.
              </p>
            </div>

            {accounts.map((account) => (
              <button
                key={account.userId}
                type="button"
                onClick={() => handleSelectAccount(account.userId)}
                disabled={isLoading}
                className="w-full text-left p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-primary-400 hover:bg-primary-50/50 dark:hover:border-primary-600 dark:hover:bg-primary-900/20 transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-primary-100 dark:bg-primary-900/40 rounded-lg group-hover:bg-primary-200 dark:group-hover:bg-primary-900/60 transition-colors flex-shrink-0">
                    {getRoleIcon(account.role)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      {getRoleLabel(account.role, account.instituteName)}
                    </p>
                    {account.tenantName && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-0.5">
                        {account.tenantName}
                      </p>
                    )}
                  </div>
                  <FiChevronRight className="h-5 w-5 text-gray-400 group-hover:text-primary-500 flex-shrink-0 transition-colors" />
                </div>
              </button>
            ))}

            <button
              type="button"
              onClick={handleBackToPhone}
              className="w-full text-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors font-medium pt-2"
            >
              ← Back to login
            </button>
          </div>
        ) : (
          <form onSubmit={otpForm.handleSubmit(handleVerifyOTP)} className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="mb-4 p-4 bg-blue-50/50 backdrop-blur-sm border border-blue-200 rounded-xl text-blue-700 text-sm dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200">
              <p className="font-semibold text-base">OTP Sent!</p>
              <p className="text-blue-600/80 dark:text-blue-300/80 mt-1">We've sent a 6-digit verification code to <span className="font-mono font-medium">{phone}</span></p>
            </div>

            {/* Development OTP Display */}
            {devOTP && (
              <div className="mb-4 p-4 bg-green-50 border-2 border-green-300 rounded-xl text-green-800 dark:bg-green-900/20 dark:border-green-700 dark:text-green-200 animate-in fade-in slide-in-from-top-2 duration-300">
                <p className="font-bold text-base mb-1">🔓 Development Mode</p>
                <p className="text-sm mb-2">Your OTP code is:</p>
                <div className="flex items-center justify-center">
                  <p className="text-3xl font-bold font-mono tracking-widest bg-white dark:bg-gray-800 px-6 py-3 rounded-lg border-2 border-green-400 dark:border-green-600">
                    {devOTP}
                  </p>
                </div>
              </div>
            )}

            <Input
              label="Verification Code"
              type="text"
              inputMode="numeric"
              maxLength={6}
              {...otpForm.register('otp', {
                pattern: {
                  value: /^\d{6}$/,
                  message: 'OTP must be 6 digits',
                },
              })}
              error={otpForm.formState.errors.otp?.message}
              placeholder="000000"
              required
              icon={<FiLock className="h-5 w-5" />}
              className="text-center text-3xl tracking-[0.5em] font-mono h-14 bg-gray-50/50 dark:bg-gray-900/50"
            />

            <div className="flex items-center justify-between text-sm pt-2">
              <button
                type="button"
                onClick={handleBackToPhone}
                className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors font-medium"
              >
                ← Change number
              </button>
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={countdown > 0 || isSendingOTP}
                className="text-primary-600 hover:text-primary-700 dark:text-primary-400 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center gap-1.5 font-medium transition-colors"
              >
                {countdown > 0 ? (
                  <>Resend in {countdown}s</>
                ) : (
                  <>
                    <FiRefreshCw className="h-4 w-4" />
                    Resend Code
                  </>
                )}
              </button>
            </div>

            <Button type="submit" className="w-full h-11 text-base shadow-lg shadow-primary-500/20" isLoading={isLoading}>
              <FiLock className="h-4 w-4 mr-2" />
              Verify & Sign In
            </Button>
          </form>
        )}

        <div className="mt-8 text-center">
        <p className="text-xs text-gray-400 dark:text-gray-600 font-medium">
          Powered by{" "}
          <a
            href="https://d4dx.co/"   // put your actual website link here
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline text-primary-600 dark:text-primary-400"
          >
            D4DX Innovations LLP
          </a>
        </p>

        </div>
      </Card>
    </div>
  );
}

