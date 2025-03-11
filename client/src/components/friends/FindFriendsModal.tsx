import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User } from "@/lib/types";
import { apiRequest } from "@/lib/queryClient";
import { useUser } from "@/context/UserContext";
import { cn } from "@/lib/utils";
import { X, Search, UserPlus, Check } from "lucide-react";
import { 
  Sheet, SheetContent, SheetHeader, 
  SheetTitle, SheetDescription, SheetClose 
} from "@/components/ui/sheet";
import { 
  Avatar, AvatarFallback, AvatarImage 
} from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface FindFriendsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FindFriendsModal({ isOpen, onClose }: FindFriendsModalProps) {
  const { currentUser } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [addedFriendIds, setAddedFriendIds] = useState<number[]>([]);
  
  // Fetch potential friends
  const { data: potentialFriends, isLoading } = useQuery({
    queryKey: ['/api/friends/potential', currentUser?.id],
    enabled: isOpen && !!currentUser?.id,
    queryFn: async () => {
      const response = await fetch(`/api/friends/potential?userId=${currentUser?.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch potential friends');
      }
      return response.json() as Promise<User[]>;
    },
  });
  
  // Search users query
  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ['/api/users/search', searchQuery],
    enabled: isOpen && searchQuery.length > 0,
    queryFn: async () => {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) {
        throw new Error('Search failed');
      }
      return response.json() as Promise<User[]>;
    },
  });
  
  // Add friend mutation
  const addFriendMutation = useMutation({
    mutationFn: async (friendId: number) => {
      const result = await apiRequest('/api/friends', 'POST', { 
        userId: currentUser?.id, 
        friendId 
      });
      return result;
    },
    onSuccess: (_, friendId) => {
      setAddedFriendIds(prev => [...prev, friendId]);
      
      queryClient.invalidateQueries({ queryKey: ['/api/friends', currentUser?.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/friends/potential', currentUser?.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications', currentUser?.id] });
      
      // Show success toast
      toast({
        title: "Friend added!",
        description: "You can now compare your progress with this friend.",
      });
    },
    onError: (error) => {
      console.error("Error adding friend:", error);
      toast({
        title: "Failed to add friend",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });
  
  const handleAddFriend = (friendId: number) => {
    if (!currentUser?.id) return;
    addFriendMutation.mutate(friendId);
  };
  
  // Filter search results to show only users who aren't already friends
  const filteredSearchResults = searchResults?.filter(user => 
    user.id !== currentUser?.id && 
    !potentialFriends?.some(f => f.id === user.id)
  ) || [];
  
  // Determine which users to display
  const usersToDisplay = searchQuery.length > 0 
    ? filteredSearchResults 
    : potentialFriends || [];
  
  return (
    <Sheet open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle>Find Friends</SheetTitle>
          <SheetDescription>
            Connect with other users to compare progress and motivate each other
          </SheetDescription>
        </SheetHeader>
        
        <div className="relative mb-6">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search by name or username"
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {isLoading || isSearching ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center p-4 rounded-md border animate-pulse">
                <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                <div className="ml-3 flex-1">
                  <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 w-32 bg-gray-200 rounded"></div>
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-200"></div>
              </div>
            ))}
          </div>
        ) : usersToDisplay.length === 0 ? (
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            {searchQuery.length > 0 ? (
              <p className="text-gray-500">No users found matching "{searchQuery}"</p>
            ) : (
              <p className="text-gray-500">No suggested users at this time</p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-500">
              {searchQuery.length > 0 ? 'Search Results' : 'Suggested Friends'}
            </h3>
            
            {usersToDisplay.map((user) => (
              <div 
                key={user.id} 
                className="flex items-center justify-between p-3 rounded-md border hover:border-gray-300 transition-colors"
              >
                <div className="flex items-center">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar || ""} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="ml-3">
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-gray-500">@{user.username}</p>
                  </div>
                </div>
                
                {addedFriendIds.includes(user.id) ? (
                  <Button variant="outline" className="text-green-600" disabled>
                    <Check className="h-4 w-4 mr-1" />
                    Added
                  </Button>
                ) : (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleAddFriend(user.id)}
                    disabled={addFriendMutation.isPending}
                  >
                    <UserPlus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
        
        <SheetClose className="absolute top-4 right-4">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </SheetClose>
      </SheetContent>
    </Sheet>
  );
}