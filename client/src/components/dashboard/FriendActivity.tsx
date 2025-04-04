import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { ChevronRight } from 'lucide-react';
import { Friend } from '@/lib/types';
import { useUser } from '@/context/UserContext';
import { FriendCard } from '@/components/friends/FriendCard';
import { Button } from '@/components/ui/button';

export function FriendActivity() {
  const { currentUser } = useUser();
  const userId = currentUser?.id || 1;
  const [showAllFriends, setShowAllFriends] = useState(false);

  const { data: friends = [], isLoading } = useQuery<Friend[]>({
    queryKey: [`/api/friends?userId=${userId}`],
    enabled: !!userId,
  });

  const displayFriends = showAllFriends ? friends : friends.slice(0, 3);

  if (isLoading) {
    return (
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-blue-700 bg-clip-text text-transparent">Friend Activity</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-md p-5 border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-gray-200 animate-pulse ring-2 ring-blue-50"></div>
                <div className="ml-4 flex-1">
                  <div className="h-5 w-24 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mt-1"></div>
                </div>
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="h-3 bg-gray-100 rounded-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (friends.length === 0) {
    return (
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-blue-700 bg-clip-text text-transparent">Friend Activity</h2>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-8 text-center border border-gray-100">
          <p className="text-gray-600 mb-3">You haven't added any friends yet.</p>
          <p className="text-gray-500 mb-4">Connect with friends to see their progress and stay motivated together!</p>
          <Link href="/friends">
            <Button className="mt-2 px-6">Find Friends</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-blue-700 bg-clip-text text-transparent">Friend Activity</h2>
        <Link href="/friends">
          <Button variant="outline" className="font-medium border-primary hover:bg-primary/10">
            View all <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayFriends.map((friend) => (
          <FriendCard key={friend.id} friend={friend} />
        ))}
      </div>
      
      {friends.length > 3 && !showAllFriends && (
        <div className="mt-6 text-center">
          <Button 
            variant="outline"
            className="font-medium border-primary hover:bg-primary/10"
            onClick={() => setShowAllFriends(true)}
          >
            Show more friends
          </Button>
        </div>
      )}
    </div>
  );
}
