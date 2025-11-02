import type { User } from "@supabase/supabase-js";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronDown, LogOut, User as UserIcon } from "lucide-react";

interface UserDropdownProps {
  user: User;
}

export default function UserDropdown({ user }: UserDropdownProps) {
  const getInitials = (email: string) => {
    if (!email) return "??";
    const parts = email.split("@");
    if (parts.length > 0 && parts[0].length > 0) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-x-2">
        <Avatar>
          <AvatarImage src={user.user_metadata?.avatar_url} />
          <AvatarFallback>{getInitials(user.email!)}</AvatarFallback>
        </Avatar>
        <ChevronDown className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel>
          <div className="flex items-center gap-x-2">
            <UserIcon className="h-4 w-4" />
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.user_metadata?.full_name || "Użytkownik"}</p>
              <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <a href="/dashboard/profile">
          <DropdownMenuItem>
            <UserIcon className="mr-2 h-4 w-4" />
            <span>Mój profil</span>
          </DropdownMenuItem>
        </a>
        <DropdownMenuSeparator />
        <a href="/api/auth/signout">
          <DropdownMenuItem>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Wyloguj</span>
          </DropdownMenuItem>
        </a>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
