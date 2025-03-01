import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@/lib/types";

interface UserProfileProps {
  user: User | null;
  isLoading?: boolean;
}

export function UserProfile({ user, isLoading = false }: UserProfileProps) {
  if (isLoading) {
    return (
      <div className="flex items-center px-4 py-3">
        <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse"></div>
        <div className="ml-3">
          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-3 w-32 bg-gray-200 rounded mt-2 animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex items-center px-4 py-3">
      <Avatar className="h-10 w-10">
        <AvatarImage src={user.avatar} alt={user.name} />
        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="ml-3">
        <p className="text-sm font-medium">{user.name}</p>
        <p className="text-xs text-gray-500">{user.email}</p>
      </div>
    </div>
  );
}
