"use client";

import { usePathname } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { CartProvider } from "@/lib/cart-context";
import { SupportTicketButton } from "@/components/support-ticket-button";

export function LayoutWrapper({ children }) {
  const pathname = usePathname();

  // Don't show sidebar on auth pages
  const isAuthPage =
    pathname === "/signin" ||
    pathname === "/signup" ||
    pathname === "/auth/verify-email-pending";

  if (isAuthPage) {
    return <>{children}</>;
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
