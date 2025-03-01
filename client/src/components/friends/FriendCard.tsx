import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Friend } from '@/lib/types';

interface FriendCardProps {
  friend: Friend;
}

export function FriendCard({ friend }: FriendCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center mb-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={friend.avatar} alt={friend.name} />
          <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="ml-3 flex-1">
          <h3 className="font-medium">{friend.name}</h3>
          <p className="text-sm text-gray-500">
            {Math.floor(friend.progress / 10)} of {Math.ceil(friend.progress / 10) * 10} tasks
          </p>
        </div>
        <div className="ml-auto text-lg font-bold text-primary">{friend.progress}%</div>
      </div>
      
      <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
        <Progress value={friend.progress} className="h-full" />
      </div>
    </div>
  );
}
