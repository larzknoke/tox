"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

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
          <AvatarImage src={user.image || ""} alt={user.name || "User"} />
          <AvatarFallback className="text-2xl">
            {getUserInitials(user.name)}
          </AvatarFallback>
        </Avatar>
        <div className="space-y-1">
          <h3 className="text-2xl font-semibold">{user.name}</h3>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          {user.emailVerified && (
            <p className="text-xs text-green-600">✓ Email verified</p>
          )}
        </div>
      </div>

      <div className="border-t pt-6">
        <h4 className="text-sm font-medium mb-4">Session</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">User ID:</span>
            <span className="font-mono">...{user.id.slice(-10)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Session ID:</span>
            <span className="font-mono">...{session.id.slice(-10)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Role:</span>
            <span>{user.role.toLocaleUpperCase() || "No role"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Created:</span>
            <span>{new Date(user.createdAt).toLocaleDateString("en-GB")}</span>
          </div>
        </div>
      </div>

      <div className="border-t pt-6 flex justify-between">
        <Button variant="outline" onClick={onChangePassword}>
          Change Password
        </Button>
        <Button variant="destructive" onClick={handleLogout}>
          Sign Out
        </Button>
      </div>
    </div>
  );
}
