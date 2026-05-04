"use client";

import { EldenEleLogoLink } from "@/components/branding/EldenEleLogoLink";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import {
  loginWithIdentifierPassword,
  registerWithContactPassword,
} from "@/services/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Smartphone } from "lucide-react";
import type { FormEvent, ReactNode } from "react";
import { useMemo, useState } from "react";

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

  const MIN_PASSWORD_LEN = 6;

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

    try {
      sessionStorage.setItem("elden_ele_token", result.data.access_token);
    } catch {
      /* yok say */
    }
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

    try {
      sessionStorage.setItem("elden_ele_token", result.data.access_token);
    } catch {
      /* ignore */
    }
    router.push("/");
  }

  function handlePhoneLoginClick() {
    setActiveTab("register");
  }

  const inputBaseClasses =
    "w-full rounded-full border bg-gray-100 px-4 py-3 text-sm font-normal text-[var(--color-text)] outline-none transition-[box-shadow,border-color] placeholder:text-gray-400 focus-visible:ring-[3px] focus-visible:ring-primary/25 dark:bg-slate-800/70 dark:border-slate-600 dark:placeholder:text-slate-400";

  return (
    <div className="relative flex min-h-screen flex-col bg-[var(--color-app-bg)] font-sans text-[var(--color-text)]">
      <div className="absolute left-4 top-4 z-10 sm:left-6 sm:top-5 md:left-8 md:top-6">
        <EldenEleLogoLink variant="standalone" className="shrink-0" />
      </div>
      <div className="absolute right-4 top-4 z-10 flex sm:right-6 sm:top-5 md:right-8 md:top-6">
        <ThemeToggle />
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

                <div className="relative py-6">
                  <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-gray-200 dark:bg-slate-600" aria-hidden />
                  <p className="relative mx-auto w-max bg-card px-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-slate-500">
                    Sosyal hesabın ile giriş yap
                  </p>
                </div>

                <div className="flex justify-center gap-3">
                  <SocialIconButton
                    ariaLabel="Apple ile giriş yap"
                    icon={<AppleGlyph />}
                  />
                  <SocialIconButton
                    ariaLabel="Google ile giriş yap"
                    icon={<GoogleGlyph />}
                  />
                  <SocialIconButton
                    ariaLabel="Facebook ile giriş yap"
                    icon={<FacebookGlyph />}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <SiteFooter className="mt-auto" />
    </div>
  );
}

function SocialIconButton({
  ariaLabel,
  icon,
}: {
  ariaLabel: string;
  icon: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      className="flex size-12 shrink-0 items-center justify-center rounded-lg border border-gray-300 bg-card shadow-sm transition-colors hover:border-gray-400 hover:bg-gray-50 dark:border-slate-600 dark:hover:border-slate-500 dark:hover:bg-slate-800/80"
    >
      {icon}
    </button>
  );
}

/** Lucide’da marka logoları olmadığı için minimal renkli SVG’ler. */

function AppleGlyph() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className="text-[var(--color-text)]"
    >
      <path d="M17.05 20.28c-.98.95-2.05.88-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}

function GoogleGlyph() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function FacebookGlyph() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path
        fill="#1877F2"
        d="M9.101 23.691v-9.18H6.127V11.59h2.974v-2.59c0-4.084 1.849-5.335 5.342-5.335 1.566 0 2.714.124 3.36.18v3.277h-2.305c-1.435 0-1.711.683-1.711 1.688v2.19h3.402l-.443 3.92h-3.041v9.191z"
      />
    </svg>
  );
}
