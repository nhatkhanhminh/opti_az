// app/Providers.tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { ThirdwebProvider } from "thirdweb/react";
import { Navbar } from "@/components/Navbar-v2";
import { MobileBottomNav } from "@/components/mobile-bottom";


const queryClient = new QueryClient();
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem
    disableTransitionOnChange>
      <ThirdwebProvider>
        <QueryClientProvider client={queryClient}>
          {/* <TransactionToastProvider /> */}
          <Navbar />
          {children}
          <MobileBottomNav />
        </QueryClientProvider>
      </ThirdwebProvider>
    </ThemeProvider>
  );
}