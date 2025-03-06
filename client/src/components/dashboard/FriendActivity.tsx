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
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Friend Activity</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center mb-3">
                <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse"></div>
                <div className="ml-3 flex-1">
                  <div className="h-5 w-24 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mt-1"></div>
                </div>
                <div className="h-6 w-12 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="h-2 bg-gray-200 rounded-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (friends.length === 0) {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Friend Activity</h2>
        </div>
        
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">You haven't added any friends yet.</p>
          <Link href="/friends">
            <Button className="mt-4">Find Friends</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">Friend Activity</h2>
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
