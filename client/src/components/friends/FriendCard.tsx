import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Friend } from '@/lib/types';

interface FriendCardProps {
  friend: Friend;
}

export function FriendCard({ friend }: FriendCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-5 border border-gray-100 hover:shadow-lg transition-shadow">
      <div className="flex items-center mb-4">
        <Avatar className="h-12 w-12 ring-2 ring-blue-100">
          <AvatarImage src={friend.avatar} alt={friend.name} />
          <AvatarFallback className="bg-blue-50 text-blue-700">{friend.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="ml-4 flex-1">
          <h3 className="font-semibold text-gray-800">{friend.name}</h3>
          <p className="text-sm text-gray-500">
            {Math.floor(friend.progress / 10)} of {Math.ceil(friend.progress / 10) * 10} tasks
          </p>
        </div>
        <div className="ml-auto text-xl font-bold bg-gradient-to-r from-blue-500 to-blue-700 bg-clip-text text-transparent">
          {friend.progress}%
        </div>
      </div>
      
      <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
        <Progress value={friend.progress} className="h-full" />
      </div>
    </div>
  );
}
