import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { GroupDetails } from "@/components/groups/GroupDetails";
import { GroupTaskList } from "@/components/groups/GroupTaskList";
import { ArrowLeft } from "lucide-react";
import { Priority } from "@/lib/types";

// Mock data for a detailed group view
const getGroupData = (groupId: string) => {
  // This would normally be a fetch call to your API
  const id = parseInt(groupId);
  
  return {
    group: {
      id,
      name: id === 1 ? "Website Redesign" : "Coding Study Group",
      description: id === 1 
        ? "Collaborative project to redesign company website" 
        : "Group for learning and practicing coding together",
      goalDate: new Date(new Date().getTime() + (id === 1 ? 14 : 30) * 24 * 60 * 60 * 1000),
      totalTasks: id === 1 ? 8 : 6, 
      completedTasks: id === 1 ? 3 : 1,
      progress: id === 1 ? 37 : 16
    },
    members: [
      { 
        id: 1, 
        name: "Sophia Chen", 
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80", 
        role: id === 1 ? "admin" : "member",
        completed: id === 1 ? 2 : 0,
        total: id === 1 ? 4 : 2
      },
      { 
        id: 2, 
        name: "Alex Johnson", 
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80", 
        role: id === 1 ? "member" : "admin",
        completed: id === 1 ? 1 : 1,
        total: id === 1 ? 2 : 3
      },
      { 
        id: 3, 
        name: "Maria Garcia", 
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80", 
        role: "member",
        completed: 0,
        total: id === 1 ? 2 : 0
      }
    ].filter(m => id === 1 || m.id !== 3), // Only include Maria in group 1
    tasks: [
      {
        id: 1,
        title: "Set up project structure",
        description: "Create initial file structure and basic configurations",
        dueDate: new Date(new Date().getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        priority: "high" as Priority,
        completed: true,
        assignedTo: 2,
        createdBy: id === 1 ? 1 : 2
      },
      {
        id: 2,
        title: "Create wireframes",
        description: "Design initial wireframes for main pages",
        dueDate: new Date(new Date().getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        priority: "urgent" as Priority,
        completed: false,
        assignedTo: 1,
        createdBy: id === 1 ? 1 : 2
      },
      {
        id: 3,
        title: id === 1 ? "Implement homepage design" : "Complete Chapter 3 exercises",
        description: id === 1 
          ? "Develop the layout and components for the homepage" 
          : "Finish practice problems from Chapter 3",
        dueDate: new Date(), // Today
        priority: "medium" as Priority,
        completed: false,
        assignedTo: id === 1 ? 3 : 1,
        createdBy: id === 1 ? 1 : 2
      },
      {
        id: 4,
        title: id === 1 ? "Backend API integration" : "Research authentication methods",
        description: id === 1 
          ? "Connect frontend to backend APIs" 
          : "Research and present different authentication approaches",
        dueDate: new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        priority: "high" as Priority,
        completed: id === 1 ? true : false,
        assignedTo: 2,
        createdBy: id === 1 ? 1 : 2
      },
      {
        id: 5,
        title: id === 1 ? "User testing" : "Create mini-project",
        description: id === 1 
          ? "Conduct usability tests with potential users" 
          : "Develop a small application using learned skills",
        dueDate: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        priority: "medium" as Priority,
        completed: false,
        assignedTo: id === 1 ? 1 : 2,
        createdBy: id === 1 ? 1 : 2
      },
      {
        id: 6,
        title: id === 1 ? "Bug fixing" : "Code review session",
        description: id === 1 
          ? "Address issues from user testing" 
          : "Review code and provide feedback to group members",
        dueDate: new Date(new Date().getTime() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        priority: "low" as Priority,
        completed: false,
        assignedTo: id === 1 ? 3 : 1,
        createdBy: id === 1 ? 1 : 2
      }
    ].filter((_, i) => id === 1 || i < 5) // Group 2 has fewer tasks
  };
};

export default function GroupView() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const [activeView, setActiveView] = useState<"overview" | "tasks">("overview");
  
  // In a real app, you would fetch this data from your API
  const { group, members, tasks } = getGroupData(params.id);
  
  const handleCompleteTask = (taskId: number) => {
    // In a real app, you would make an API call to update the task
    console.log(`Marking task ${taskId} as complete`);
  };
  
  const handleDeleteTask = (taskId: number) => {
    // In a real app, you would make an API call to delete the task
    console.log(`Deleting task ${taskId}`);
  };
  
  const handleReassignTask = (taskId: number, userId: number) => {
    // In a real app, you would make an API call to reassign the task
    console.log(`Reassigning task ${taskId} to user ${userId}`);
  };
  
  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex items-center gap-1" 
          onClick={() => setLocation("/groups")}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Groups
        </Button>
      </div>
      
      <div className="flex flex-wrap gap-4 mb-6">
        <Button
          variant={activeView === "overview" ? "default" : "outline"}
          onClick={() => setActiveView("overview")}
          className={activeView === "overview" ? "bg-gradient-to-r from-blue-500 to-blue-600" : ""}
        >
          Group Overview
        </Button>
        <Button
          variant={activeView === "tasks" ? "default" : "outline"} 
          onClick={() => setActiveView("tasks")}
          className={activeView === "tasks" ? "bg-gradient-to-r from-blue-500 to-blue-600" : ""}
        >
          Group Tasks
        </Button>
      </div>
      
      {activeView === "overview" ? (
        <GroupDetails 
          group={group} 
          members={members}
          tasks={tasks}
        />
      ) : (
        <GroupTaskList 
          tasks={tasks}
          members={members}
          onComplete={handleCompleteTask}
          onDelete={handleDeleteTask}
          onReassign={handleReassignTask}
        />
      )}
    </div>
  );
}