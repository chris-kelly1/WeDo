import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, UserPlus } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Contact {
  id: number;
  name: string;
  email: string;
  avatar?: string;
}

// Sample contacts data
const SAMPLE_CONTACTS: Contact[] = [
  {
    id: 101,
    name: "Jessica Lee",
    email: "jessica@example.com",
    avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
  },
  {
    id: 102,
    name: "Michael Torres",
    email: "michael@example.com",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
  },
  {
    id: 103,
    name: "Aisha Johnson",
    email: "aisha@example.com",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
  },
  {
    id: 104,
    name: "Ryan Garcia",
    email: "ryan@example.com",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
  },
  {
    id: 105,
    name: "Olivia Chen",
    email: "olivia@example.com",
    avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
  },
  {
    id: 106,
    name: "James Wilson",
    email: "james@example.com",
    avatar: "https://images.unsplash.com/photo-1531384441138-2736e62e0919?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
  }
];

interface FindFriendsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FindFriendsModal({ isOpen, onClose }: FindFriendsModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [contacts] = useState<Contact[]>(SAMPLE_CONTACTS);
  
  // Filter contacts by search query
  const filteredContacts = contacts.filter(contact => 
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddFriend = (contactId: number) => {
    // This would normally send a friend request or add the friend
    console.log(`Adding friend with ID: ${contactId}`);
    // For now, just show a success message
    alert(`Friend request sent to ${contacts.find(c => c.id === contactId)?.name}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Find Friends</DialogTitle>
          <DialogDescription>
            Connect with friends who are using WeDo
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input 
              placeholder="Search by name or email"
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="overflow-y-auto max-h-80">
            {filteredContacts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No contacts found matching your search
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {filteredContacts.map(contact => (
                  <li key={contact.id} className="py-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={contact.avatar} alt={contact.name} />
                        <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{contact.name}</p>
                        <p className="text-sm text-gray-500">{contact.email}</p>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleAddFriend(contact.id)}
                    >
                      <UserPlus className="h-4 w-4 mr-1" /> Add
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}