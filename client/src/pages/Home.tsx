import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { MobileNavigation } from '@/components/layout/MobileNavigation';
import { DailyOverview } from '@/components/dashboard/DailyOverview';
import { TodayTasks } from '@/components/dashboard/TodayTasks';
import { FriendActivity } from '@/components/dashboard/FriendActivity';

export default function Home() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

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
          <DailyOverview />
          <FriendActivity />
          <TodayTasks />
        </main>
        
        <MobileNavigation />
      </div>
    </div>
  );
}
