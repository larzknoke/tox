"use client";
import { useRouter } from "next/navigation";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { formatDate } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import UserListDropdown from "./userListDropdown";
import UserDeleteDialog from "./userDeleteDialog";
import UserEditDialog from "./userEditDialog";

function UserTable({ users, session }) {
  const router = useRouter();
  const [deleteDialogState, setDeleteDialogState] = useState({
    open: false,
    user: null,
  });
  const [editDialogState, setEditDialogState] = useState({
    open: false,
    user: null,
  });
  const [searchTerm, setSearchTerm] = useState("");

  const openDeleteDialog = (user) => setDeleteDialogState({ open: true, user });
  const closeDeleteDialog = () =>
    setDeleteDialogState({ open: false, user: null });

  const openEditDialog = (user) => setEditDialogState({ open: true, user });
  const closeEditDialog = () => setEditDialogState({ open: false, user: null });

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const getRoleBadge = (role) => {
    if (!role) return "-";
    const roleMap = {
      CUSTOMER: "Customer",
      ADMIN: "Admin",
    };
    return roleMap[role] || role;
  };

  const getStatusBadge = (user) => {
    if (user.banned) return "Banned";
    if (user.emailVerified) return "Active";
    return "Unverified";
  };

  return (
    <>
      <div className="w-full flex flex-row gap-6 justify-between">
        <InputGroup className="max-w-sm">
          <InputGroupInput
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              variant="secondary"
              onClick={() => setSearchTerm("")}
            >
              {searchTerm ? "Reset" : "Search"}
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </div>
      <Table>
        <TableCaption>All Users</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Last Login</TableHead>
            <TableHead className="text-right"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredUsers.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{getRoleBadge(user.role)}</TableCell>
              <TableCell>{getStatusBadge(user)}</TableCell>
              <TableCell>{formatDate(user.createdAt)}</TableCell>
              <TableCell>
                {user.sessions?.[0]
                  ? formatDate(user.sessions[0].createdAt)
                  : "-"}
              </TableCell>
              <TableCell className="text-right">
                <UserListDropdown
                  onDeleteClick={() => openDeleteDialog(user)}
                  onEditClick={() => openEditDialog(user)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <UserDeleteDialog
        open={deleteDialogState.open}
        user={deleteDialogState.user}
        onClose={() => {
          setDeleteDialogState({ open: false, user: null });
          router.refresh();
        }}
      />
      <UserEditDialog
        open={editDialogState.open}
        user={editDialogState.user}
        onClose={() => {
          setEditDialogState({ open: false, user: null });
          router.refresh();
        }}
      />
    </>
  );
}

export default UserTable;
