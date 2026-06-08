"use client";

import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { useEffect, useRef, useState } from "react";

interface GoogleAuthButtonProps {
  context: "signin" | "signup";
  disabled?: boolean;
  onCredential: (credential: string) => void;
  onError: () => void;
}

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim() ?? "";

/** Google Identity Services — tam genişlikte giriş butonu */
export function GoogleAuthButton({
  context,
  disabled = false,
  onCredential,
  onError,
}: GoogleAuthButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [buttonWidth, setButtonWidth] = useState(360);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateWidth = () => {
      const width = Math.max(280, Math.floor(el.offsetWidth));
      setButtonWidth(width);
    };

    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (!googleClientId) {
    return (
      <p
        className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200"
        role="alert"
      >
        NEXT_PUBLIC_GOOGLE_CLIENT_ID ortam değişkeni tanımlı değil.
      </p>
    );
  }

  if (disabled) {
    return (
      <button
        type="button"
        disabled
        className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-[var(--color-app-bg)] py-3 text-sm font-semibold text-gray-400 dark:border-slate-600"
      >
        Google ile {context === "signup" ? "üye ol" : "giriş yap"}
      </button>
    );
  }

  return (
    <div ref={containerRef} className="w-full overflow-hidden rounded-full">
      <GoogleLogin
        onSuccess={(response: CredentialResponse) => {
          if (response.credential) onCredential(response.credential);
          else onError();
        }}
        onError={onError}
        useOneTap={false}
        theme="outline"
        size="large"
        text={context === "signup" ? "signup_with" : "signin_with"}
        shape="pill"
        width={buttonWidth}
      />
    </div>
  );
}
