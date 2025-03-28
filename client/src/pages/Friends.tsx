import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Friend } from '@/lib/types';
import { useUser } from '@/context/UserContext';
import { FriendCard } from '@/components/friends/FriendCard';
import { FindFriendsModal } from '@/components/friends/FindFriendsModal';
import { 
  Card, 
  CardContent 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Medal, UserPlus } from 'lucide-react';

export default function Friends() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFindFriendsModalOpen, setIsFindFriendsModalOpen] = useState(false);
  const { currentUser } = useUser();
  const userId = currentUser?.id || 1;

  const { data: friends = [], isLoading } = useQuery<Friend[]>({
    queryKey: [`/api/friends?userId=${userId}`],
    enabled: !!userId,
  });
  
  const openFindFriendsModal = () => {
    setIsFindFriendsModalOpen(true);
  };
  
  const closeFindFriendsModal = () => {
    setIsFindFriendsModalOpen(false);
  };
  
  // Get top performers
  const topPerformers = [...friends].sort((a, b) => b.progress - a.progress).slice(0, 3);
  
  // Filter friends by search query
  const filteredFriends = friends.filter(friend => 
    friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl font-bold mb-4 sm:mb-0">My Friends</h1>
        <div className="flex items-center">
          <div className="relative w-full sm:w-64">
            <Input
              type="text"
              placeholder="Search friends..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
          <Button 
            className="ml-2"
            onClick={openFindFriendsModal}
          >
            <UserPlus className="h-4 w-4 mr-1" /> Find Friends
          </Button>
        </div>
      </div>
      
      {/* Find Friends Modal */}
      <FindFriendsModal
        isOpen={isFindFriendsModalOpen}
        onClose={closeFindFriendsModal}
      />
      
      {!isLoading && topPerformers.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Medal className="mr-2 h-5 w-5 text-yellow-400" />
            Top Performers
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {topPerformers.map(friend => (
              <FriendCard key={friend.id} friend={friend} />
            ))}
          </div>
        </div>
      )}
      
      <div>
        <h2 className="text-xl font-semibold mb-4">All Friends</h2>
        
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
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
        ) : filteredFriends.length === 0 ? (
          searchQuery ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-gray-500">No friends match your search</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-gray-500 mb-4">You haven't added any friends yet</p>
                <Button onClick={openFindFriendsModal}>
                  <UserPlus className="h-4 w-4 mr-1" /> Find Friends
                </Button>
              </CardContent>
            </Card>
          )
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFriends.map(friend => (
              <FriendCard key={friend.id} friend={friend} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
