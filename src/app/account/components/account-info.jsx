"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/lib/locale-context";

function getUserInitials(name) {
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function AccountInfo({ user, session, onChangePassword }) {
  const router = useRouter();
  const { locale, t } = useLocale();

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/signin");
        },
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Avatar className="h-20 w-20">
          <AvatarImage
            src={user.image || ""}
            alt={user.name || t("account.info.userFallback")}
          />
          <AvatarFallback className="text-2xl">
            {getUserInitials(user.name)}
          </AvatarFallback>
        </Avatar>
        <div className="space-y-1">
          <h3 className="text-2xl font-semibold">{user.name}</h3>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          {user.emailVerified && (
            <p className="text-xs text-green-600">
              {t("account.info.emailVerified")}
            </p>
          )}
        </div>
      </div>

      <div className="border-t pt-6">
        <h4 className="text-sm font-medium mb-4">
          {t("account.info.session")}
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {t("account.info.userId")}
            </span>
            <span className="font-mono">...{user.id.slice(-10)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {t("account.info.sessionId")}
            </span>
            <span className="font-mono">...{session.id.slice(-10)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {t("account.info.role")}
            </span>
            <span>
              {user.role?.toLocaleUpperCase() || t("account.info.noRole")}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {t("account.info.created")}
            </span>
            <span>{new Date(user.createdAt).toLocaleDateString(locale)}</span>
          </div>
        </div>
      </div>

      <div className="border-t pt-6 flex justify-between">
        <Button variant="outline" onClick={onChangePassword}>
          {t("account.password.change")}
        </Button>
        <Button variant="destructive" onClick={handleLogout}>
          {t("account.info.signOut")}
        </Button>
      </div>
    </div>
  );
}
