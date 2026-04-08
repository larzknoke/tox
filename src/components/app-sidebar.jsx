"use client";

import {
  Calendar,
  Coins,
  Users,
  MessageCircleQuestionMark,
  Settings,
  Ticket,
  UserStar,
  FileSpreadsheet,
  CakeSlice,
  User,
  UserCog,
  Car,
  PackageSearch,
  ShoppingBasket,
  HouseIcon,
  ShoppingBag,
  ShoppingCart,
  ClipboardList,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { ChevronUp, User2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { hasRole } from "@/lib/roles";
import { useCart } from "@/lib/cart-context";

// Menu items.
const items = [
  {
    title: "Abrechnung",
    url: "/abrechnung",
    icon: Coins,
  },
  {
    title: "Trainer",
    url: "/trainer",
    icon: UserStar,
  },
  {
    title: "Teams",
    url: "/team",
    icon: Users,
  },
  {
    title: "Spieler",
    url: "/player",
    icon: User,
  },
  {
    title: "Fahrkosten (in Arbeit)",
    url: "/fahrtkosten",
    icon: Car,
  },
  {
    title: "Verkauf",
    url: "#",
    icon: CakeSlice,
    disabled: true,
  },
  {
    title: "Protokolle",
    url: "#",
    icon: FileSpreadsheet,
    disabled: true,
  },
];

const shopItems = [
  {
    title: "Home",
    url: "/",
    icon: HouseIcon,
  },
  {
    title: "Shop",
    url: "/shop",
    icon: Ticket,
  },
];

const userItems = [
  {
    title: "My Account",
    url: "/account",
    icon: User,
  },
  {
    title: "My Orders",
    url: "/account/orders",
    icon: ShoppingBag,
  },
  {
    title: "Support",
    url: "/support",
    icon: MessageCircleQuestionMark,
    disabled: true,
  },
];

export function AppSidebar() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/signin");
        },
      },
    });
  };

  const getUserInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const isAdmin = session && hasRole(session, "ADMIN");

  const { cartCount } = useCart();

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <a href="/">
                <Ticket />
                <span className="text-base font-semibold">TOX</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          {/* <SidebarGroupLabel>Shop</SidebarGroupLabel> */}
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/cart" aria-label={`Cart (${cartCount} Products)`}>
                    <div className="relative">
                      <ShoppingCart className="h-4 w-4" />
                      {cartCount > 0 && (
                        <span className="absolute -right-1.5 -top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground leading-none">
                          {cartCount > 99 ? "99+" : cartCount}
                        </span>
                      )}
                    </div>
                    <span>Shopping-Cart</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {shopItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a
                      href={item.url}
                      className={
                        item.disabled ? "pointer-events-none opacity-30" : ""
                      }
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {userItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a
                      href={item.url}
                      className={
                        item.disabled ? "pointer-events-none opacity-30" : ""
                      }
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarGroupLabel>Admin</SidebarGroupLabel>
        <SidebarMenu>
          {isAdmin && (
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <a href="/user">
                  <UserCog />
                  <span>Users</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          {isAdmin && (
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <a href="/admin/products">
                  <PackageSearch />
                  <span>Products</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          {isAdmin && (
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <a href="/admin/orders">
                  <ClipboardList />
                  <span>Orders</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          <SidebarMenuItem>
            {isPending ? (
              <SidebarMenuButton variant="default" size="lg" disabled>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
                  <div className="flex flex-col gap-1">
                    <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                    <div className="h-3 w-32 bg-muted rounded animate-pulse" />
                  </div>
                </div>
              </SidebarMenuButton>
            ) : session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton variant="default" size="lg">
                    <Avatar>
                      <AvatarImage
                        src={session.user.image || ""}
                        alt={session.user.name || "User"}
                      />
                      <AvatarFallback>
                        {getUserInitials(session.user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start gap-0">
                      <span>{session.user.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {session.user.email}
                      </span>
                    </div>
                    <ChevronUp className="ml-auto" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="top"
                  className="w-[--radix-popper-anchor-width]"
                >
                  <DropdownMenuItem asChild>
                    <a href="/account">Account Details</a>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <SidebarMenuButton asChild variant="default" size="lg">
                <a href="/signin">
                  <User2 />
                  <span>Login</span>
                </a>
              </SidebarMenuButton>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
