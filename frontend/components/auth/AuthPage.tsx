"use client";

import { EldenEleLogoLink } from "@/components/branding/EldenEleLogoLink";
import { InteractivePageShell } from "@/components/layout/InteractivePageShell";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { persistAuthSession } from "@/lib/session";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
import {
  loginWithGoogle,
  loginWithIdentifierPassword,
  registerWithContactPassword,
} from "@/services/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Smartphone } from "lucide-react";
import type { FormEvent } from "react";
import { useCallback, useMemo, useState } from "react";

type AuthTab = "login" | "register";

function isLikelyEmail(value: string): boolean {
  const v = value.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function isLikelyGsmOrTurkish(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 11;
}

/**
 * Hepsiburada tarzı tam ekran giriş / üye ol; primary #2563EB, Inter (`font-sans`).
 */
export function AuthPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AuthTab>("login");
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginIdentifierInvalid, setLoginIdentifierInvalid] = useState(false);
  const [loginPasswordInvalid, setLoginPasswordInvalid] = useState(false);
  const [loginApiError, setLoginApiError] = useState<string | null>(null);
  const [loginSubmitting, setLoginSubmitting] = useState(false);
  const [registerContact, setRegisterContact] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerPasswordRepeat, setRegisterPasswordRepeat] = useState("");
  const [showRegisterPasswords, setShowRegisterPasswords] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [registerContactError, setRegisterContactError] = useState(false);
  const [registerTermsError, setRegisterTermsError] = useState(false);
  const [registerPasswordError, setRegisterPasswordError] = useState(false);
  const [registerPasswordMismatch, setRegisterPasswordMismatch] =
    useState(false);
  const [registerApiError, setRegisterApiError] = useState<string | null>(null);
  const [registerSubmitting, setRegisterSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
  const [googleApiError, setGoogleApiError] = useState<string | null>(null);

  const MIN_PASSWORD_LEN = 6;

  const handleGoogleCredential = useCallback(
    async (credential: string, requireTerms: boolean) => {
      setGoogleApiError(null);
      setLoginApiError(null);
      setRegisterApiError(null);

      if (requireTerms && !acceptedTerms) {
        setRegisterTermsError(true);
        setGoogleApiError("Google ile üye olmak için onay kutusunu işaretleyin.");
        return;
      }

      setGoogleSubmitting(true);
      const result = await loginWithGoogle(credential);
      setGoogleSubmitting(false);

      if (!result.ok) {
        setGoogleApiError(result.message);
        return;
      }

      persistAuthSession(result.data);
      router.push("/");
    },
    [acceptedTerms, router]
  );

  const loginIdentifierErrorMessage = useMemo(() => {
    if (!loginIdentifierInvalid) return null;
    if (!loginIdentifier.trim()) return "E-posta veya telefon gerekli.";
    return "Geçerli bir e-posta veya en az 10 haneli cep telefonu girin.";
  }, [loginIdentifier, loginIdentifierInvalid]);

  async function handleLoginSubmit(e: FormEvent) {
    e.preventDefault();
    setLoginApiError(null);
    const rawId = loginIdentifier.trim();
    const okId =
      rawId &&
      (isLikelyEmail(rawId) || isLikelyGsmOrTurkish(rawId));
    setLoginIdentifierInvalid(!okId);
    const pwdOk = loginPassword.trim().length > 0;
    setLoginPasswordInvalid(!pwdOk);
    if (!okId || !pwdOk) return;

    setLoginSubmitting(true);
    const result = await loginWithIdentifierPassword(
      rawId,
      loginPassword
    );
    setLoginSubmitting(false);

    if (!result.ok) {
      setLoginApiError(result.message);
      return;
    }

    persistAuthSession(result.data);
    router.push("/");
  }

  async function handleRegisterSubmit(e: FormEvent) {
    e.preventDefault();
    setRegisterTermsError(false);
    setRegisterContactError(false);
    setRegisterPasswordError(false);
    setRegisterPasswordMismatch(false);
    setRegisterApiError(null);

    const raw = registerContact.trim();
    if (!raw) {
      setRegisterContactError(true);
      return;
    }
    const okEmail = isLikelyEmail(raw);
    const okGsm = isLikelyGsmOrTurkish(raw);
    if (!okEmail && !okGsm) {
      setRegisterContactError(true);
      return;
    }
    if (!acceptedTerms) {
      setRegisterTermsError(true);
      return;
    }

    const pw = registerPassword;
    const pwLenOk = pw.length >= MIN_PASSWORD_LEN;
    setRegisterPasswordError(!pwLenOk);
    const matchOk = pwLenOk && pw === registerPasswordRepeat;
    setRegisterPasswordMismatch(pwLenOk && pw !== registerPasswordRepeat);
    if (!pwLenOk || !matchOk) return;

    setRegisterSubmitting(true);
    const result = await registerWithContactPassword(raw, pw);
    setRegisterSubmitting(false);

    if (!result.ok) {
      setRegisterApiError(result.message);
      return;
    }

    persistAuthSession(result.data);
    router.push("/");
  }

  function handlePhoneLoginClick() {
    setActiveTab("register");
  }

  const inputBaseClasses =
    "w-full rounded-full border bg-gray-100 px-4 py-3 text-sm font-normal text-[var(--color-text)] outline-none transition-[box-shadow,border-color] placeholder:text-gray-400 focus-visible:ring-[3px] focus-visible:ring-primary/25 dark:bg-slate-800/70 dark:border-slate-600 dark:placeholder:text-slate-400";

  return (
    <InteractivePageShell
      className="flex flex-col bg-[var(--color-app-bg)] font-sans text-[var(--color-text)]"
      contentClassName="relative flex min-h-screen flex-1 flex-col"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[11] flex items-start justify-between px-4 pt-4 sm:px-6 sm:pt-5 md:px-8 md:pt-6">
        <div className="pointer-events-auto">
          <EldenEleLogoLink variant="standalone" className="shrink-0" />
        </div>
        <div className="pointer-events-auto flex">
          <ThemeToggle />
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 py-10 pb-24 pt-14 sm:pt-16 md:pb-28 md:pt-12">
        <div className="w-full max-w-md rounded-lg bg-[var(--color-card)] shadow-md ring-1 ring-black/5 dark:ring-white/10">
          <div role="tablist" aria-label="Kimlik doğrulama">
            <div className="grid grid-cols-2">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "login"}
                onClick={() => {
                  setActiveTab("login");
                  setLoginIdentifierInvalid(false);
                  setLoginPasswordInvalid(false);
                  setLoginApiError(null);
                  setRegisterApiError(null);
                  setGoogleApiError(null);
                }}
                className={`py-4 text-center text-base font-semibold transition-colors ${
                  activeTab === "login"
                    ? "border-b-2 border-primary text-[var(--color-text)]"
                    : "border-b border-gray-300 text-gray-500 hover:text-gray-700 dark:border-slate-600 dark:text-slate-400 dark:hover:text-slate-300"
                }`}
              >
                Giriş yap
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "register"}
                onClick={() => {
                  setActiveTab("register");
                  setLoginIdentifierInvalid(false);
                  setLoginPasswordInvalid(false);
                  setLoginApiError(null);
                  setRegisterApiError(null);
                  setGoogleApiError(null);
                }}
                className={`py-4 text-center text-base font-semibold transition-colors ${
                  activeTab === "register"
                    ? "border-b-2 border-primary text-[var(--color-text)]"
                    : "border-b border-gray-300 text-gray-500 hover:text-gray-700 dark:border-slate-600 dark:text-slate-400 dark:hover:text-slate-300"
                }`}
              >
                Üye ol
              </button>
            </div>
          </div>

          <div className="px-6 py-8">
            {activeTab === "login" ? (
              <form className="space-y-4" noValidate onSubmit={handleLoginSubmit}>
                <div>
                  <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                    E-posta veya cep telefonu
                  </label>
                  <input
                    type="text"
                    autoComplete="username"
                    inputMode="email"
                    placeholder="örnek@sirket.com veya 5xx xxx xx xx"
                    value={loginIdentifier}
                    onChange={(event) => {
                      setLoginIdentifier(event.target.value);
                      if (loginApiError) setLoginApiError(null);
                      const v = event.target.value.trim();
                      if (
                        loginIdentifierInvalid &&
                        v &&
                        (isLikelyEmail(v) || isLikelyGsmOrTurkish(v))
                      ) {
                        setLoginIdentifierInvalid(false);
                      }
                    }}
                    aria-invalid={loginIdentifierInvalid || undefined}
                    className={`${inputBaseClasses} ${
                      loginIdentifierInvalid
                        ? "border border-red-500 focus-visible:border-red-500 focus-visible:ring-red-200"
                        : "border-transparent focus-visible:border-primary"
                    }`}
                  />
                  {loginIdentifierErrorMessage ? (
                    <p className="mt-1.5 text-sm font-normal text-red-600" role="alert">
                      {loginIdentifierErrorMessage}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                    Şifre
                  </label>
                  <div className="relative">
                    <input
                      type={showLoginPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      value={loginPassword}
                    onChange={(e) => {
                      setLoginPassword(e.target.value);
                      if (loginApiError) setLoginApiError(null);
                      if (loginPasswordInvalid && e.target.value.trim()) {
                        setLoginPasswordInvalid(false);
                      }
                    }}
                    aria-invalid={loginPasswordInvalid || undefined}
                    className={`${inputBaseClasses} pr-11 ${
                      loginPasswordInvalid
                        ? "border border-red-500 focus-visible:border-red-500 focus-visible:ring-red-200"
                        : "border-transparent focus-visible:border-primary"
                    }`}
                  />
                    <button
                      type="button"
                      aria-label={
                        showLoginPassword ? "Şifreyi gizle" : "Şifreyi göster"
                      }
                      onClick={() => setShowLoginPassword((v) => !v)}
                      className="absolute right-3 top-1/2 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-200/80 hover:text-[var(--color-text)] dark:text-slate-400 dark:hover:bg-slate-700/70"
                    >
                      {showLoginPassword ? (
                        <EyeOff className="size-5 shrink-0" aria-hidden />
                      ) : (
                        <Eye className="size-5 shrink-0" aria-hidden />
                      )}
                    </button>
                  </div>
                  {loginPasswordInvalid ? (
                    <p className="mt-1.5 text-sm font-normal text-red-600" role="alert">
                      Şifre gerekli.
                    </p>
                  ) : null}
                  <div className="mt-2 flex justify-start">
                    <Link
                      href="/"
                      prefetch={false}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      Şifremi unuttum
                    </Link>
                  </div>
                </div>

                {loginApiError ? (
                  <p
                    className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200"
                    role="alert"
                  >
                    {loginApiError}
                  </p>
                ) : null}

                <button
                  type="submit"
                  disabled={loginSubmitting}
                  className="mt-2 w-full rounded-full bg-primary py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-primary/90 active:bg-primary/85 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loginSubmitting ? "Giriş yapılıyor..." : "Giriş yap"}
                </button>

                <button
                  type="button"
                  onClick={handlePhoneLoginClick}
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-[var(--color-app-bg)] py-3 text-sm font-semibold text-[var(--color-text)] transition-colors hover:bg-gray-50 dark:border-slate-600 dark:hover:bg-slate-800/50"
                >
                  <Smartphone className="size-5 shrink-0 text-gray-600 dark:text-slate-400" aria-hidden />
                  Telefon numarası ile giriş yap
                </button>

                <div className="relative py-2">
                  <div
                    className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-gray-200 dark:bg-slate-600"
                    aria-hidden
                  />
                  <p className="relative mx-auto w-max bg-[var(--color-card)] px-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-slate-500">
                    veya
                  </p>
                </div>

                {googleApiError ? (
                  <p
                    className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200"
                    role="alert"
                  >
                    {googleApiError}
                  </p>
                ) : null}

                <GoogleAuthButton
                  context="signin"
                  disabled={googleSubmitting || loginSubmitting}
                  onCredential={(credential) => void handleGoogleCredential(credential, false)}
                  onError={() =>
                    setGoogleApiError("Google girişi iptal edildi veya başarısız oldu.")
                  }
                />
              </form>
            ) : (
              <div className="space-y-5">
                <form className="space-y-4" noValidate onSubmit={handleRegisterSubmit}>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                      E-posta adresi veya GSM numarası
                    </label>
                    <input
                      type="text"
                      autoComplete="username"
                      placeholder="E-postanız veya cep telefonu"
                      value={registerContact}
                      onChange={(e) => {
                        setRegisterContact(e.target.value);
                        if (registerContactError) setRegisterContactError(false);
                        if (registerApiError) setRegisterApiError(null);
                      }}
                      className={`${inputBaseClasses} ${
                        registerContactError
                          ? "border border-red-500 focus-visible:border-red-500 focus-visible:ring-red-200"
                          : "border-transparent focus-visible:border-primary"
                      }`}
                    />
                    {registerContactError ? (
                      <p className="mt-1.5 text-sm text-red-600" role="alert">
                        Geçerli bir e-posta veya en az 10 haneli telefon girin.
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                      Şifre (en az {MIN_PASSWORD_LEN} karakter)
                    </label>
                    <div className="relative">
                      <input
                        type={showRegisterPasswords ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder="Şifrenizi oluşturun"
                        value={registerPassword}
                        onChange={(e) => {
                          setRegisterPassword(e.target.value);
                          if (registerPasswordError) setRegisterPasswordError(false);
                          if (registerPasswordMismatch)
                            setRegisterPasswordMismatch(false);
                          if (registerApiError) setRegisterApiError(null);
                        }}
                        aria-invalid={
                          registerPasswordError || undefined
                        }
                        className={`${inputBaseClasses} pr-11 ${
                          registerPasswordError
                            ? "border border-red-500 focus-visible:border-red-500 focus-visible:ring-red-200"
                            : "border-transparent focus-visible:border-primary"
                        }`}
                      />
                      <button
                        type="button"
                        aria-label={
                          showRegisterPasswords ? "Şifreleri gizle" : "Şifreleri göster"
                        }
                        onClick={() => setShowRegisterPasswords((v) => !v)}
                        className="absolute right-3 top-1/2 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-200/80 hover:text-[var(--color-text)] dark:text-slate-400 dark:hover:bg-slate-700/70"
                      >
                        {showRegisterPasswords ? (
                          <EyeOff className="size-5 shrink-0" aria-hidden />
                        ) : (
                          <Eye className="size-5 shrink-0" aria-hidden />
                        )}
                      </button>
                    </div>
                    {registerPasswordError ? (
                      <p className="mt-1.5 text-sm text-red-600" role="alert">
                        Şifre en az {MIN_PASSWORD_LEN} karakter olmalı.
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                      Şifre tekrarı
                    </label>
                    <input
                      type={showRegisterPasswords ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Şifrenizi tekrar yazın"
                      value={registerPasswordRepeat}
                      onChange={(e) => {
                        setRegisterPasswordRepeat(e.target.value);
                        if (registerPasswordMismatch)
                          setRegisterPasswordMismatch(false);
                        if (registerApiError) setRegisterApiError(null);
                      }}
                      aria-invalid={
                        registerPasswordMismatch || undefined
                      }
                      className={`${inputBaseClasses} ${
                        registerPasswordMismatch
                          ? "border border-red-500 focus-visible:border-red-500 focus-visible:ring-red-200"
                          : "border-transparent focus-visible:border-primary"
                      }`}
                    />
                    {registerPasswordMismatch ? (
                      <p className="mt-1.5 text-sm text-red-600" role="alert">
                        Şifreler eşleşmiyor.
                      </p>
                    ) : null}
                  </div>

                  <p className="text-xs font-normal leading-relaxed text-gray-500 dark:text-slate-400">
                    Kayıt olduğunda{" "}
                    <Link
                      prefetch={false}
                      href="/"
                      className="font-semibold text-slate-700 underline decoration-slate-300 underline-offset-2 hover:text-primary"
                    >
                      Gizlilik Politikası
                    </Link>{" "}
                    ve{" "}
                    <Link
                      prefetch={false}
                      href="/"
                      className="font-semibold text-primary underline decoration-primary/35 underline-offset-2 hover:text-primary/90"
                    >
                      Üyelik ve Kullanım Koşulları
                    </Link>
                    metinlerini kabul etmiş sayılırsın. İsteğe bağlı ücretsiz bildirimler için
                    ileti izni ayrıca yönetilebilir.
                  </p>

                  <label className="flex cursor-pointer items-start gap-2 text-xs font-normal text-gray-600 dark:text-slate-400">
                    <input
                      type="checkbox"
                      checked={acceptedTerms}
                      onChange={(e) => {
                        setAcceptedTerms(e.target.checked);
                        if (registerTermsError) setRegisterTermsError(false);
                      }}
                      className="mt-0.5 size-4 shrink-0 rounded border-gray-300 accent-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary dark:border-slate-500"
                    />
                    <span>
                      Yukarıdaki metinleri okudum ve e-posta / telefon kaydım için onaylıyorum.
                    </span>
                  </label>
                  {registerTermsError ? (
                    <p className="text-sm font-normal text-red-600" role="alert">
                      Hesap oluşturmak için onay kutusunu işaretleyin.
                    </p>
                  ) : null}

                  {registerApiError ? (
                    <p
                      className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200"
                      role="alert"
                    >
                      {registerApiError}
                    </p>
                  ) : null}

                  <button
                    type="submit"
                    disabled={registerSubmitting}
                    className="w-full rounded-full bg-primary py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-primary/90 active:bg-primary/85 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {registerSubmitting ? "Hesap oluşturuluyor..." : "Hesap oluştur"}
                  </button>
                </form>

                <div className="relative py-4">
                  <div
                    className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-gray-200 dark:bg-slate-600"
                    aria-hidden
                  />
                  <p className="relative mx-auto w-max bg-[var(--color-card)] px-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-slate-500">
                    veya Google ile üye ol
                  </p>
                </div>

                {googleApiError ? (
                  <p
                    className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200"
                    role="alert"
                  >
                    {googleApiError}
                  </p>
                ) : null}

                <GoogleAuthButton
                  context="signup"
                  disabled={googleSubmitting || registerSubmitting}
                  onCredential={(credential) => void handleGoogleCredential(credential, true)}
                  onError={() =>
                    setGoogleApiError("Google kaydı iptal edildi veya başarısız oldu.")
                  }
                />
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="mt-auto w-full">
        <SiteFooter />
      </div>
    </InteractivePageShell>
  );
}
