import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { MobileNavigation } from '@/components/layout/MobileNavigation';
import { useQuery } from '@tanstack/react-query';
import { Friend } from '@/lib/types';
import { useUser } from '@/context/UserContext';
import { FriendCard } from '@/components/friends/FriendCard';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Medal } from 'lucide-react';

export default function Friends() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { currentUser } = useUser();
  const userId = currentUser?.id || 1;

  const { data: friends = [], isLoading } = useQuery<Friend[]>({
    queryKey: [`/api/friends?userId=${userId}`],
    enabled: !!userId,
  });
  
  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };
  
  // Get top performers
  const topPerformers = [...friends].sort((a, b) => b.progress - a.progress).slice(0, 3);
  
  // Filter friends by search query
  const filteredFriends = friends.filter(friend => 
    friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen">
      {/* Main sidebar - desktop only */}
      <Sidebar />
      
      {/* Mobile sidebar */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-gray-600 bg-opacity-75" 
            onClick={toggleMobileSidebar}
          ></div>
          
          {/* Sidebar */}
          <div className="relative flex flex-col w-full max-w-xs bg-white h-full">
            <Sidebar className="relative z-50" />
          </div>
        </div>
      )}
      
      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1 h-full">
        <TopBar onMenuClick={toggleMobileSidebar} />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-20 lg:pb-6">
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
              <Button className="ml-2">Find Friends</Button>
            </div>
          </div>
          
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
                    <Button>Find Friends</Button>
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
        </main>
        
        <MobileNavigation />
      </div>
    </div>
  );
}
