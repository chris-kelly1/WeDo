import { Switch, Route, Router as WouterRouter } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import MyTasks from "@/pages/MyTasks";
import Progress from "@/pages/Progress";
import Friends from "@/pages/Friends";
import Settings from "@/pages/Settings";
import Groups from "@/pages/Groups";
import GroupView from "@/pages/GroupView";
import { TaskProvider } from "@/context/TaskContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { UserProvider } from "@/context/UserContext";
import { AppLayout } from "@/components/layout/AppLayout";

// Custom route components that use the layout
const HomePage = () => (
  <AppLayout>
    <Home />
  </AppLayout>
);
const TasksPage = () => (
  <AppLayout>
    <MyTasks />
  </AppLayout>
);
const ProgressPage = () => (
  <AppLayout>
    <Progress />
  </AppLayout>
);
const FriendsPage = () => (
  <AppLayout>
    <Friends />
  </AppLayout>
);
const GroupsPage = () => (
  <AppLayout>
    <Groups />
  </AppLayout>
);
const GroupViewPage = ({ params }: { params: { id: string } }) => (
  <AppLayout>
    <GroupView />
  </AppLayout>
);
const SettingsPage = () => (
  <AppLayout>
    <Settings />
  </AppLayout>
);
const NotFoundPage = () => (
  <AppLayout>
    <NotFound />
  </AppLayout>
);

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/tasks" component={TasksPage} />
      <Route path="/progress" component={ProgressPage} />
      <Route path="/friends" component={FriendsPage} />
      <Route path="/groups" component={GroupsPage} />
      <Route path="/groups/:id" component={GroupViewPage} />
      <Route path="/settings" component={SettingsPage} />
      <Route component={NotFoundPage} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <TaskProvider>
          <NotificationProvider>
            <Router />
            <Toaster />
          </NotificationProvider>
        </TaskProvider>
      </UserProvider>
    </QueryClientProvider>
  );
}

export default App;
