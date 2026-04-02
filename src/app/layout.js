import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { LayoutWrapper } from "@/components/layout-wrapper";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sigma } from "lucide-react";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "tox | France Billet Ticket Order Extranet",
  description: "France Billet Ticket Order Extranet",
  icons: {
    icon: "/favicon.ico",
  },
};

export default async function RootLayout({ children }) {
  // const session = await auth.api.getSession({
  //   headers: await headers(),
  // });
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  // if (!session) redirect("/signin");

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Toaster position="top-center" />
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}
