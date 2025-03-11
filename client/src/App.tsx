import { Switch, Route } from "wouter";
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

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/tasks" component={MyTasks} />
      <Route path="/progress" component={Progress} />
      <Route path="/friends" component={Friends} />
      <Route path="/groups" component={Groups} />
      <Route path="/groups/:id" component={GroupView} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
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
