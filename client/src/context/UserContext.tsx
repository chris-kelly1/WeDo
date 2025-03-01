import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { User } from '@/lib/types';
import { useQuery } from '@tanstack/react-query';

interface UserContextType {
  currentUser: User | null;
  isLoading: boolean;
  error: Error | null;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  // Default user ID for the demo (Sophia)
  const defaultUserId = 1;
  
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: [`/api/users/${defaultUserId}`],
    refetchOnWindowFocus: false,
  });

  return (
    <UserContext.Provider value={{ 
      currentUser: user || null, 
      isLoading,
      error: error as Error | null
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
