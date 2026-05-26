"use client";

import { usePathname } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { CartProvider } from "@/lib/cart-context";
import { SupportTicketButton } from "@/components/support-ticket-button";
import { LanguageSwitcher } from "@/components/language-switcher";

export function LayoutWrapper({ children }) {
  const pathname = usePathname();

  // Don't show sidebar on auth pages
  const isAuthPage = [
    "/signin",
    "/signup",
    "/forgot-password",
    "/reset-password",
    "/auth/verify-email",
    "/auth/verify-email-pending",
    "/privacy",
  ].includes(pathname);

  if (isAuthPage) {
    return (
      <>
        <div className="fixed right-4 top-4 z-50">
          <LanguageSwitcher compact />
        </div>
        {children}
      </>
    );
  }

  return (
    <CartProvider>
      <SidebarProvider>
        <AppSidebar />
        <main className="flex flex-1 flex-col p-6 overflow-x-hidden bg-gray-50/20">
          {children}
        </main>
        <SupportTicketButton />
      </SidebarProvider>
    </CartProvider>
  );
}
