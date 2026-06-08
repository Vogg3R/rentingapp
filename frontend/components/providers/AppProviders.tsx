"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { ThemeProvider } from "next-themes";

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim() ?? "";

export function AppProviders({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const themed = (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </ThemeProvider>
  );

  if (!googleClientId) {
    return themed;
  }

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      {themed}
    </GoogleOAuthProvider>
  );
}
