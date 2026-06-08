import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { BottomNav } from "@/components/BottomNav";
import { SearchModal } from "@/components/SearchModal";
import { AppProviders } from "@/components/providers/AppProviders";
import { CategoryFilterProvider } from "@/components/providers/CategoryFilterContext";
import { SearchModalProvider } from "@/components/providers/SearchModalContext";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "EldenEle",
  description: "EldenEle — tersine kiralama pazaryeri",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={`${inter.variable} h-full`} suppressHydrationWarning>
      <body className="flex min-h-full flex-col bg-app-bg font-sans text-text antialiased">
        <SearchModalProvider>
          <CategoryFilterProvider>
            <AppProviders>
              {children}
              <BottomNav />
              <SearchModal />
            </AppProviders>
          </CategoryFilterProvider>
        </SearchModalProvider>
      </body>
    </html>
  );
}
