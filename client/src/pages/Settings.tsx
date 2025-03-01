import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { MobileNavigation } from '@/components/layout/MobileNavigation';
import { useUser } from '@/context/UserContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  Bell, 
  Clock, 
  Moon, 
  Edit2, 
  Shield, 
  LogOut,
  Lock
} from 'lucide-react';

export default function Settings() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { currentUser, isLoading } = useUser();
  const { toast } = useToast();
  
  // State for notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    taskReminders: true,
    friendActivity: true,
    dailySummary: false,
    weeklyReport: true
  });
  
  // State for app preferences
  const [appPreferences, setAppPreferences] = useState({
    darkMode: false,
    compactView: false,
    autoArchive: true
  });

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const handleNotificationChange = (setting: keyof typeof notificationSettings) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));

    toast({
      title: "Settings updated",
      description: "Your notification preferences have been saved.",
    });
  };

  const handlePreferenceChange = (preference: keyof typeof appPreferences) => {
    setAppPreferences(prev => ({
      ...prev,
      [preference]: !prev[preference]
    }));

    toast({
      title: "Preference updated",
      description: "Your app preferences have been saved.",
    });
  };

  const handleSaveProfile = () => {
    toast({
      title: "Profile updated",
      description: "Your profile changes have been saved successfully.",
    });
  };

  const handleChangePassword = () => {
    toast({
      title: "Password updated",
      description: "Your password has been changed successfully.",
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="lg:pl-64 flex flex-col flex-1 h-full">
          <TopBar onMenuClick={toggleMobileSidebar} />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-20 lg:pb-6">
            <div className="text-center p-8">Loading settings...</div>
          </main>
          <MobileNavigation />
        </div>
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold mb-6">Settings</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile</CardTitle>
                    <CardDescription>Manage your personal information</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="flex justify-center mb-4">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src={currentUser?.avatar} alt={currentUser?.name} />
                        <AvatarFallback className="text-2xl">{currentUser?.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </div>
                    <h3 className="text-lg font-medium">{currentUser?.name}</h3>
                    <p className="text-sm text-gray-500">{currentUser?.email}</p>
                    <p className="text-sm text-gray-500 mt-1">@{currentUser?.username}</p>
                    <div className="mt-4">
                      <Button variant="outline" size="sm" className="gap-1">
                        <Edit2 className="h-4 w-4" /> Edit Photo
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Account</CardTitle>
                    <CardDescription>Manage your account settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <Shield className="h-4 w-4" /> Account Security
                    </Button>
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <Lock className="h-4 w-4" /> Change Password
                    </Button>
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <LogOut className="h-4 w-4 text-red-500" /> Sign Out
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                  <CardDescription>Update your personal details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input id="fullName" defaultValue={currentUser?.name} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input id="username" defaultValue={currentUser?.username} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue={currentUser?.email} />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleSaveProfile}>Save Changes</Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Notification Settings
                  </CardTitle>
                  <CardDescription>Customize how you receive notifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Task Reminders</p>
                      <p className="text-sm text-gray-500">Get notified when tasks are due</p>
                    </div>
                    <Switch 
                      checked={notificationSettings.taskReminders}
                      onCheckedChange={() => handleNotificationChange('taskReminders')}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Friend Activity</p>
                      <p className="text-sm text-gray-500">Get notified about friend's progress</p>
                    </div>
                    <Switch 
                      checked={notificationSettings.friendActivity}
                      onCheckedChange={() => handleNotificationChange('friendActivity')}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Daily Summary</p>
                      <p className="text-sm text-gray-500">Receive a daily summary of your tasks</p>
                    </div>
                    <Switch 
                      checked={notificationSettings.dailySummary}
                      onCheckedChange={() => handleNotificationChange('dailySummary')}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Weekly Report</p>
                      <p className="text-sm text-gray-500">Get a weekly progress report</p>
                    </div>
                    <Switch 
                      checked={notificationSettings.weeklyReport}
                      onCheckedChange={() => handleNotificationChange('weeklyReport')}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    App Preferences
                  </CardTitle>
                  <CardDescription>Customize your app experience</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Dark Mode</p>
                      <p className="text-sm text-gray-500">Use dark theme for the app</p>
                    </div>
                    <Switch 
                      checked={appPreferences.darkMode}
                      onCheckedChange={() => handlePreferenceChange('darkMode')}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Compact View</p>
                      <p className="text-sm text-gray-500">Show more tasks in a compact layout</p>
                    </div>
                    <Switch 
                      checked={appPreferences.compactView}
                      onCheckedChange={() => handlePreferenceChange('compactView')}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Auto-archive Completed Tasks</p>
                      <p className="text-sm text-gray-500">Move completed tasks to archive automatically</p>
                    </div>
                    <Switch 
                      checked={appPreferences.autoArchive}
                      onCheckedChange={() => handlePreferenceChange('autoArchive')}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Password
                  </CardTitle>
                  <CardDescription>Change your password</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input id="currentPassword" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input id="newPassword" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input id="confirmPassword" type="password" />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleChangePassword}>Update Password</Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </main>
        
        <MobileNavigation />
      </div>
    </div>
  );
}
