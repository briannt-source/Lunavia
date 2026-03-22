"use client";
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Link } from '@/navigation';
import toast from 'react-hot-toast';
import { useTranslations } from 'next-intl';

type Role = 'TOUR_OPERATOR' | 'TOUR_GUIDE' | '';
type OperatorType = 'company' | 'agency' | 'sole' | '';
type GuideType = 'freelance' | 'association' | '';

function SignupContent() {
  const t = useTranslations('Auth.Signup');
  const searchParams = useSearchParams();
  const refCode = searchParams.get('ref') || '';
  const initialMode = searchParams.get('mode') === 'operations' ? 'INTERNAL_OPERATOR_MODE' : 'MARKETPLACE_MODE';
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<Role>('');
  const [systemMode, setSystemMode] = useState<'MARKETPLACE_MODE' | 'INTERNAL_OPERATOR_MODE'>(initialMode);
  const [loading, setLoading] = useState(false);

  // Operator metadata
  const [operatorType, setOperatorType] = useState<OperatorType>('');
  const [businessRegistrationNumber, setBusinessRegistrationNumber] = useState('');
  const [tourLicenseNumber, setTourLicenseNumber] = useState('');

  // Guide metadata
  const [guideType, setGuideType] = useState<GuideType>('');
  const [guideCardNumber, setGuideCardNumber] = useState('');
  const [inviteCode, setInviteCode] = useState('');

  const [proofOfAddressAcknowledged, setProofOfAddressAcknowledged] = useState(false);
  const router = useRouter();

  const passwordsMatch = password === confirmPassword;
  const passwordValid = password.length >= 8;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedName = fullName.trim();
    if (!trimmedName) return toast.error('Full name is required');
    if (!role) return toast.error("Please select how you'll use Lunavia");
    if (!passwordValid) return toast.error('Password must be at least 8 characters');
    if (!passwordsMatch) return toast.error('Passwords do not match');
    if (!proofOfAddressAcknowledged) return toast.error('Please acknowledge the verification requirement');

    let roleMetadata: Record<string, any> = { proofOfAddressProvided: false };

    if (role === 'TOUR_OPERATOR') {
      if (!operatorType) return toast.error('Please select your operator type');
      roleMetadata = { ...roleMetadata, operatorType, businessRegistrationNumber: businessRegistrationNumber || null, tourLicenseNumber: tourLicenseNumber || null };
    } else if (role === 'TOUR_GUIDE') {
      if (!guideType) return toast.error('Please select your guide type');
      roleMetadata = { ...roleMetadata, guideType, guideCardNumber: guideCardNumber || null };
    }

    setLoading(true);

    // Map frontend fields to V2 Backend Schema
    let backendRole: string = role;
    if (role === 'TOUR_OPERATOR' && operatorType === 'agency') {
      backendRole = 'TOUR_AGENCY';
    }

    const payload = {
      email,
      password,
      role: backendRole,
      name: trimmedName,
      licenseNumber: businessRegistrationNumber || tourLicenseNumber || undefined,
      companyName: trimmedName // Fallback since the UI doesn't explicitly capture companyName yet
    };

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    
    let data;
    try {
      data = await res.json();
    } catch (e) {
      data = { success: false, message: 'Server returned an invalid response (500 Error).' };
    }
    setLoading(false);

    if (data.success) {
      toast.success('Account created! Please log in.');
      router.push('/login');
    } else {
      toast.error(data.error || data.message || 'Signup failed');
    }
  }

  return (
    <main className="flex min-h-screen bg-white">
      {/* ── Left Side: Brand & Visuals (Hidden on Mobile) ── */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 flex-col justify-between p-12 relative overflow-hidden fixed top-0 bottom-0 left-0">
        <div className="absolute inset-0 z-0 opacity-20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-400 via-slate-900 to-slate-900 pt-32">
           <svg className="absolute right-0 top-0 h-[1000px] w-[1000px] translate-x-1/4 -translate-y-1/4 transform stroke-indigo-500/30" fill="none" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <path d="M 100, 100 m -75, 0 a 75,75 0 1,0 150,0 a 75,75 0 1,0 -150,0" strokeWidth="2" strokeDasharray="5,5" />
              <path d="M 100, 100 m -50, 0 a 50,50 0 1,0 100,0 a 50,50 0 1,0 -100,0" strokeWidth="1" />
           </svg>
        </div>
        <div className="relative z-10">
          <Link href="/" className="text-3xl font-black text-white tracking-widest uppercase">
            Lunavia.
          </Link>
        </div>
        <div className="relative z-10 max-w-md">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-tight leading-tight">{t('leftTitle')}</h2>
            <ul className="space-y-4 text-indigo-200">
              <li className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-lunavia-light0/20 text-indigo-300">✓</span>
                {t('feature1')}
              </li>
              <li className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-lunavia-light0/20 text-indigo-300">✓</span>
                {t('feature2')}
              </li>
              <li className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-lunavia-light0/20 text-indigo-300">✓</span>
                {t('feature3')}
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* ── Right Side: Scrollable Signup Form ── */}
      <div className="w-full lg:w-1/2 lg:ml-auto flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md animate-fade-in mx-auto">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-10 text-center">
            <Link href="/" className="text-3xl font-black text-[#5BA4CF] tracking-widest uppercase">
              Lunavia.
            </Link>
          </div>

          <div className="mb-8 text-center lg:text-left">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{t('title')}</h1>
            <p className="mt-2 text-sm text-gray-500">{t('subtitle')}</p>
          </div>

          {refCode && (
            <div className="mb-6 rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-800 flex items-start gap-3 shadow-sm">
              <span className="text-emerald-500 mt-0.5">✨</span>
              <span>{t('invitedMsg')}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Google OAuth Placeholder */}
            <button
              type="button"
              onClick={() => toast.error("Google Login is coming soon! Please use email to register.")}
              className="w-full border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-medium py-2.5 px-4 rounded-xl flex items-center justify-center gap-3 transition-colors mb-6 shadow-sm"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              {t('googleBtn')}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-4 text-gray-500">{t('orEmail')}</span>
              </div>
            </div>

            {/* 1. Account Details */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('fullName')}</label>
                <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder={t('fullNamePlaceholder')} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none" />
                <p className="mt-1 text-xs text-amber-600 font-medium">{t('fullNameWarning')}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('email')}</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('emailPlaceholder')} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none" />
              </div>
              <div className="pt-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('password')}</label>
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t('passwordPlaceholder')} className={`w-full rounded-xl border bg-white px-4 py-3 text-gray-900 outline-none transition-all ${password && !passwordValid ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' : 'border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'}`} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('confirmPassword')}</label>
                <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder={t('confirmPlaceholder')} className={`w-full rounded-xl border bg-white px-4 py-3 text-gray-900 outline-none transition-all ${confirmPassword && !passwordsMatch ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' : 'border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'}`} />
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* 2. Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-3">{t('roleQ')}</label>
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => setRole('TOUR_OPERATOR')} className={`p-4 rounded-xl border-2 text-left transition-all ${role === 'TOUR_OPERATOR' ? 'border-indigo-600 bg-lunavia-light/50 shadow-sm' : 'border-gray-100 bg-white hover:border-[#5BA4CF]/30 hover:bg-gray-50'}`}>
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-lg mb-2 ${role === 'TOUR_OPERATOR' ? 'bg-lunavia-muted/50' : 'bg-gray-100'}`}>🏢</div>
                  <div className="font-bold text-gray-900 text-sm">{t('roleOp')}</div>
                  <div className="text-xs text-gray-500 mt-1 line-clamp-2">{t('roleOpDesc')}</div>
                </button>
                <button type="button" onClick={() => setRole('TOUR_GUIDE')} className={`p-4 rounded-xl border-2 text-left transition-all ${role === 'TOUR_GUIDE' ? 'border-emerald-600 bg-emerald-50/50 shadow-sm' : 'border-gray-100 bg-white hover:border-emerald-200 hover:bg-gray-50'}`}>
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-lg mb-2 ${role === 'TOUR_GUIDE' ? 'bg-emerald-100' : 'bg-gray-100'}`}>🧭</div>
                  <div className="font-bold text-gray-900 text-sm">{t('roleGuide')}</div>
                  <div className="text-xs text-gray-500 mt-1 line-clamp-2">{t('roleGuideDesc')}</div>
                </button>
              </div>
            </div>

            {/* 3. Role Metadata */}
            {role === 'TOUR_OPERATOR' && (
              <div className="space-y-6">
                <div className="rounded-xl border border-[#5BA4CF]/20 bg-lunavia-light/30 p-5 shadow-sm">
                  <label className="block text-sm font-medium text-indigo-900 mb-3">{t('modeQ')}</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button type="button" onClick={() => setSystemMode('MARKETPLACE_MODE')} className={`p-4 rounded-xl border-2 text-left transition-all ${systemMode === 'MARKETPLACE_MODE' ? 'border-indigo-600 bg-lunavia-light/50 shadow-sm' : 'border-white bg-white hover:border-[#5BA4CF]/30'}`}>
                      <div className="font-bold text-gray-900 text-sm">{t('modeMp')}</div>
                      <div className="text-xs text-gray-500 mt-1">{t('modeMpDesc')}</div>
                    </button>
                    <button type="button" onClick={() => setSystemMode('INTERNAL_OPERATOR_MODE')} className={`p-4 rounded-xl border-2 text-left transition-all ${systemMode === 'INTERNAL_OPERATOR_MODE' ? 'border-indigo-600 bg-lunavia-light/50 shadow-sm' : 'border-white bg-white hover:border-[#5BA4CF]/30'}`}>
                      <div className="font-bold text-gray-900 text-sm">{t('modeOps')}</div>
                      <div className="text-xs text-gray-500 mt-1">{t('modeOpsDesc')}</div>
                    </button>
                  </div>
                </div>

                <div className="rounded-xl border border-[#5BA4CF]/20 bg-lunavia-light/30 p-5 space-y-4 shadow-sm">
                  <div>
                  <label className="block text-sm font-medium text-indigo-900 mb-1.5">{t('opType')}</label>
                  <select value={operatorType} onChange={(e) => setOperatorType(e.target.value as OperatorType)} className="w-full rounded-xl border border-[#5BA4CF]/30 bg-white px-4 py-3 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none text-sm">
                    <option value="">{t('opPlaceholder')}</option>
                    <option value="company">{t('opCompany')}</option>
                    <option value="agency">{t('opAgency')}</option>
                    <option value="sole">{t('opSole')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-indigo-900 mb-1.5">{t('opLicense')} <span className="text-gray-400 font-normal">{t('optional')}</span></label>
                  <input type="text" value={businessRegistrationNumber} onChange={(e) => setBusinessRegistrationNumber(e.target.value)} placeholder="e.g. 123456789" className="w-full rounded-xl border border-[#5BA4CF]/30 bg-white px-4 py-3 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none" />
                </div>
              </div>
            </div>
            )}

            {role === 'TOUR_GUIDE' && (
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/30 p-5 space-y-4 shadow-sm">
                <div>
                  <label className="block text-sm font-medium text-emerald-900 mb-1.5">{t('guideType')}</label>
                  <select value={guideType} onChange={(e) => setGuideType(e.target.value as GuideType)} className="w-full rounded-xl border border-emerald-200 bg-white px-4 py-3 text-gray-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none text-sm">
                    <option value="">{t('guidePlaceholder')}</option>
                    <option value="freelance">{t('guideFreelance')}</option>
                    <option value="association">{t('guideAssoc')}</option>
                  </select>
                </div>

                {/* Freelance: standard guide card */}
                {guideType === 'freelance' && (
                  <div>
                    <label className="block text-sm font-medium text-emerald-900 mb-1.5">{t('guideCard')} <span className="text-gray-400 font-normal">{t('optional')}</span></label>
                    <input type="text" value={guideCardNumber} onChange={(e) => setGuideCardNumber(e.target.value)} placeholder="e.g. G-12345" className="w-full rounded-xl border border-emerald-200 bg-white px-4 py-3 text-gray-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none" />
                  </div>
                )}

                {/* Associate: operator invite required */}
                {guideType === 'association' && (
                  <div className="space-y-4">
                    <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm">
                      <div className="flex items-start gap-2.5">
                        <span className="text-amber-500 text-base mt-0.5 shrink-0">⚠️</span>
                        <div>
                          <p className="font-semibold text-amber-900 mb-1">{t('assocWarning')}</p>
                          <p className="text-amber-700 leading-relaxed">
                            {t('assocDesc1')}
                          </p>
                          <ul className="mt-2 space-y-1.5 text-amber-700">
                            <li className="flex items-start gap-2">
                              <span className="text-emerald-500 font-bold mt-0.5">1.</span>
                              <span>{t('assocList1')}</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-emerald-500 font-bold mt-0.5">2.</span>
                              <span>{t('assocList2')}</span>
                            </li>
                          </ul>
                          <p className="text-amber-600 text-xs mt-3 italic">
                            {t('assocNote')}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-emerald-900 mb-1.5">{t('refCode')} <span className="text-gray-400 font-normal">{t('refRequired')}</span></label>
                      <input
                        type="text"
                        value={inviteCode}
                        onChange={(e) => setInviteCode(e.target.value)}
                        placeholder={t('refPlaceholder')}
                        className="w-full rounded-xl border border-emerald-200 bg-white px-4 py-3 text-gray-900 font-mono tracking-wider focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none"
                      />
                      <p className="mt-1.5 text-xs text-gray-500">{t('refHelp')}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Checkbox */}
            {role && (
              <div className="flex items-start gap-3 rounded-xl bg-gray-50 border border-gray-100 p-4">
                <input type="checkbox" id="poa" checked={proofOfAddressAcknowledged} onChange={(e) => setProofOfAddressAcknowledged(e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#5BA4CF] focus:ring-indigo-500 cursor-pointer" />
                <label htmlFor="poa" className="text-sm text-gray-600 leading-snug cursor-pointer">
                  {t('poaAccept')} <br />
                  {t('agreeTerms1')} <Link href="/terms" className="text-[#5BA4CF] underline hover:text-[#2E8BC0]">{t('agreeTermsLink1')}</Link> {t('agreeTerms2')} <Link href="/privacy" className="text-[#5BA4CF] underline hover:text-[#2E8BC0]">{t('agreeTermsLink2')}</Link>
                </label>
              </div>
            )}

            <button type="submit" disabled={!role || !proofOfAddressAcknowledged || loading || !passwordsMatch || !passwordValid} className="w-full rounded-xl bg-gray-900 px-4 py-3.5 font-semibold text-white hover:bg-black disabled:opacity-50 transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2">
              {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
              {loading ? t('loading') : t('submit')}
            </button>

            <p className="text-center text-sm text-gray-500">
              {t('hasAccount')}{' '}
              <Link href="/login" className="font-semibold text-gray-900 hover:underline">
                {t('loginLink')}
              </Link>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<main className="flex min-h-screen bg-white" />}>
      <SignupContent />
    </Suspense>
  );
}
