import { 
  users, tasks, friends, notifications, groups, groupMembers,
  type User, type Task, type Friend, type Notification, type Group, type GroupMember,
  type InsertUser, type InsertTask, type InsertFriend, type InsertNotification, 
  type InsertGroup, type InsertGroupMember
} from "@shared/schema";
import { format } from "date-fns";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Task operations
  getTasks(userId: number): Promise<Task[]>;
  getTasksByDate(userId: number, date: Date): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<Task>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;
  
  // Friend operations
  getFriends(userId: number): Promise<(User & { progress: number })[]>;
  addFriend(friend: InsertFriend): Promise<Friend>;
  removeFriend(userId: number, friendId: number): Promise<boolean>;
  getFriendComparison(userId: number, friendId: number): Promise<{
    user: User;
    friend: User;
    userTasks: Task[];
    friendTasks: Task[];
    userStats: { completed: number; total: number; byPriority: Record<string, number> };
    friendStats: { completed: number; total: number; byPriority: Record<string, number> };
  }>;
  
  // Notification operations
  getNotifications(userId: number): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<Notification | undefined>;
  deleteNotification(id: number): Promise<boolean>;
  
  // Group operations
  getGroups(userId: number): Promise<Group[]>;
  getGroup(id: number): Promise<Group | undefined>;
  getGroupMembers(groupId: number): Promise<(User & { role: string })[]>;
  getGroupTasks(groupId: number): Promise<Task[]>;
  createGroup(group: InsertGroup): Promise<Group>;
  addGroupMember(member: InsertGroupMember): Promise<GroupMember>;
  removeGroupMember(groupId: number, userId: number): Promise<boolean>;
  getGroupProgress(groupId: number): Promise<{
    group: Group;
    totalTasks: number;
    completedTasks: number;
    memberProgress: { userId: number; username: string; name: string; completed: number; total: number }[];
  }>;
}

function formatDate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

function sameDay(d1: Date, d2: Date): boolean {
  return formatDate(d1) === formatDate(d2);
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tasks: Map<number, Task>;
  private friends: Map<number, Friend>;
  private notifications: Map<number, Notification>;
  private groups: Map<number, Group>;
  private groupMembers: Map<number, GroupMember>;
  
  private userIdCounter: number;
  private taskIdCounter: number;
  private friendIdCounter: number;
  private notificationIdCounter: number;
  private groupIdCounter: number;
  private groupMemberIdCounter: number;

  constructor() {
    this.users = new Map();
    this.tasks = new Map();
    this.friends = new Map();
    this.notifications = new Map();
    this.groups = new Map();
    this.groupMembers = new Map();
    
    this.userIdCounter = 1;
    this.taskIdCounter = 1;
    this.friendIdCounter = 1;
    this.notificationIdCounter = 1;
    this.groupIdCounter = 1;
    this.groupMemberIdCounter = 1;
    
    // Seed with sample data
    this.seedData();
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id, streak: 0 };
    this.users.set(id, user);
    return user;
  }
  
  // Task operations
  async getTasks(userId: number): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      (task) => task.userId === userId
    );
  }
  
  async getTasksByDate(userId: number, date: Date): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      (task) => task.userId === userId && sameDay(new Date(task.dueDate), date)
    );
  }
  
  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }
  
  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = this.taskIdCounter++;
    const task: Task = { 
      ...insertTask, 
      id, 
      completed: false,
      private: insertTask.private || false,
      createdAt: new Date()
    };
    this.tasks.set(id, task);
    return task;
  }
  
  async updateTask(id: number, taskUpdate: Partial<Task>): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;
    
    const updatedTask = { ...task, ...taskUpdate };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }
  
  async deleteTask(id: number): Promise<boolean> {
    return this.tasks.delete(id);
  }
  
  // Friend operations
  async getFriends(userId: number): Promise<(User & { progress: number })[]> {
    const friendRelations = Array.from(this.friends.values()).filter(
      (friend) => friend.userId === userId
    );
    
    return Promise.all(
      friendRelations.map(async (relation) => {
        const friend = await this.getUser(relation.friendId);
        if (!friend) throw new Error("Friend not found");
        
        const friendTasks = await this.getTasks(relation.friendId);
        // For demo purposes, we'll fix this to show 10 tasks total (as requested by user)
        // This keeps the progress calculation real but with a fixed denominator
        const completedTasks = friendTasks.filter((task) => task.completed).length;
        
        // Calculate progress as completed tasks out of 10 (fixed denominator), capped at 100%
        const progress = Math.min(Math.round((completedTasks / 10) * 100), 100);
        
        return {
          ...friend,
          progress
        };
      })
    );
  }
  
  async addFriend(insertFriend: InsertFriend): Promise<Friend> {
    const id = this.friendIdCounter++;
    const friend: Friend = { ...insertFriend, id };
    this.friends.set(id, friend);
    return friend;
  }
  
  async removeFriend(userId: number, friendId: number): Promise<boolean> {
    const friendRelation = Array.from(this.friends.values()).find(
      (friend) => friend.userId === userId && friend.friendId === friendId
    );
    
    if (!friendRelation) return false;
    return this.friends.delete(friendRelation.id);
  }
  
  async getFriendComparison(userId: number, friendId: number): Promise<{
    user: User;
    friend: User;
    userTasks: Task[];
    friendTasks: Task[];
    userStats: { completed: number; total: number; byPriority: Record<string, number> };
    friendStats: { completed: number; total: number; byPriority: Record<string, number> };
  }> {
    const user = await this.getUser(userId);
    const friend = await this.getUser(friendId);
    
    if (!user || !friend) {
      throw new Error("User or friend not found");
    }
    
    // Get all user tasks (private and public)
    const userTasks = await this.getTasks(userId);
    
    // Get only friend's public tasks (exclude private ones)
    const allFriendTasks = await this.getTasks(friendId);
    const friendTasks = allFriendTasks.filter(task => !task.private);
    
    // Calculate user stats
    const userCompletedTasks = userTasks.filter(task => task.completed);
    const userTotalTasks = userTasks.length;
    
    // Calculate tasks by priority for user
    const userTasksByPriority: Record<string, number> = {
      low: userTasks.filter(task => task.priority === 'low' && task.completed).length,
      medium: userTasks.filter(task => task.priority === 'medium' && task.completed).length,
      high: userTasks.filter(task => task.priority === 'high' && task.completed).length,
      urgent: userTasks.filter(task => task.priority === 'urgent' && task.completed).length
    };
    
    // Calculate friend stats
    const friendCompletedTasks = friendTasks.filter(task => task.completed);
    const friendTotalTasks = friendTasks.length;
    
    // Calculate tasks by priority for friend
    const friendTasksByPriority: Record<string, number> = {
      low: friendTasks.filter(task => task.priority === 'low' && task.completed).length,
      medium: friendTasks.filter(task => task.priority === 'medium' && task.completed).length,
      high: friendTasks.filter(task => task.priority === 'high' && task.completed).length,
      urgent: friendTasks.filter(task => task.priority === 'urgent' && task.completed).length
    };
    
    return {
      user,
      friend,
      userTasks,
      friendTasks,
      userStats: {
        completed: userCompletedTasks.length,
        total: userTotalTasks,
        byPriority: userTasksByPriority
      },
      friendStats: {
        completed: friendCompletedTasks.length,
        total: friendTotalTasks,
        byPriority: friendTasksByPriority
      }
    };
  }
  
  // Notification operations
  async getNotifications(userId: number): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter((notification) => notification.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const id = this.notificationIdCounter++;
    const notification: Notification = { 
      ...insertNotification, 
      id,
      read: false, 
      createdAt: new Date()
    };
    this.notifications.set(id, notification);
    return notification;
  }
  
  async markNotificationAsRead(id: number): Promise<Notification | undefined> {
    const notification = this.notifications.get(id);
    if (!notification) return undefined;
    
    const updatedNotification = { ...notification, read: true };
    this.notifications.set(id, updatedNotification);
    return updatedNotification;
  }
  
  async deleteNotification(id: number): Promise<boolean> {
    return this.notifications.delete(id);
  }
  
  // Group operations
  async getGroups(userId: number): Promise<Group[]> {
    // Get all groups where the user is a member
    const memberGroups = Array.from(this.groupMembers.values())
      .filter(member => member.userId === userId)
      .map(member => member.groupId);
    
    // Get all groups the user created
    const createdGroups = Array.from(this.groups.values())
      .filter(group => group.createdBy === userId)
      .map(group => group.id);
    
    // Combine both lists and remove duplicates
    const uniqueGroupIds = [...new Set([...memberGroups, ...createdGroups])];
    
    // Return the group objects
    return uniqueGroupIds.map(groupId => this.groups.get(groupId)!).filter(Boolean);
  }
  
  async getGroup(id: number): Promise<Group | undefined> {
    return this.groups.get(id);
  }
  
  async getGroupMembers(groupId: number): Promise<(User & { role: string })[]> {
    const members = Array.from(this.groupMembers.values())
      .filter(member => member.groupId === groupId);
    
    return Promise.all(
      members.map(async member => {
        const user = await this.getUser(member.userId);
        if (!user) throw new Error("User not found");
        
        return {
          ...user,
          role: member.role
        };
      })
    );
  }
  
  async getGroupTasks(groupId: number): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      (task) => task.groupId === groupId
    );
  }
  
  async createGroup(group: InsertGroup): Promise<Group> {
    const id = this.groupIdCounter++;
    const newGroup: Group = {
      ...group,
      id,
      createdAt: new Date()
    };
    this.groups.set(id, newGroup);
    
    // Automatically add the creator as an admin
    await this.addGroupMember({
      groupId: id,
      userId: group.createdBy,
      role: "admin"
    });
    
    return newGroup;
  }
  
  async addGroupMember(member: InsertGroupMember): Promise<GroupMember> {
    const id = this.groupMemberIdCounter++;
    const newMember: GroupMember = {
      ...member,
      id,
      joinedAt: new Date()
    };
    this.groupMembers.set(id, newMember);
    return newMember;
  }
  
  async removeGroupMember(groupId: number, userId: number): Promise<boolean> {
    const member = Array.from(this.groupMembers.values()).find(
      m => m.groupId === groupId && m.userId === userId
    );
    
    if (!member) return false;
    return this.groupMembers.delete(member.id);
  }
  
  async getGroupProgress(groupId: number): Promise<{
    group: Group;
    totalTasks: number;
    completedTasks: number;
    memberProgress: { userId: number; username: string; name: string; completed: number; total: number }[];
  }> {
    const group = await this.getGroup(groupId);
    if (!group) throw new Error("Group not found");
    
    const groupTasks = await this.getGroupTasks(groupId);
    const totalTasks = groupTasks.length;
    const completedTasks = groupTasks.filter(task => task.completed).length;
    
    const members = await this.getGroupMembers(groupId);
    
    const memberProgress = await Promise.all(
      members.map(async member => {
        // Get tasks assigned to this member in this group
        const memberTasks = groupTasks.filter(task => task.userId === member.id);
        const memberCompletedTasks = memberTasks.filter(task => task.completed);
        
        return {
          userId: member.id,
          username: member.username,
          name: member.name,
          completed: memberCompletedTasks.length,
          total: memberTasks.length
        };
      })
    );
    
    return {
      group,
      totalTasks,
      completedTasks,
      memberProgress
    };
  }
  
  // Seed data for development
  private seedData() {
    // Create users
    const user1: User = {
      id: this.userIdCounter++,
      username: "sophia",
      password: "password123",
      email: "sophia@example.com",
      name: "Sophia Chen",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      streak: 4
    };
    
    const user2: User = {
      id: this.userIdCounter++,
      username: "alex",
      password: "password123",
      email: "alex@example.com",
      name: "Alex Johnson",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      streak: 7
    };
    
    const user3: User = {
      id: this.userIdCounter++,
      username: "maria",
      password: "password123",
      email: "maria@example.com",
      name: "Maria Garcia",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      streak: 3
    };
    
    const user4: User = {
      id: this.userIdCounter++,
      username: "tyrone",
      password: "password123",
      email: "tyrone@example.com",
      name: "Tyrone Williams",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      streak: 5
    };
    
    this.users.set(user1.id, user1);
    this.users.set(user2.id, user2);
    this.users.set(user3.id, user3);
    this.users.set(user4.id, user4);
    
    // Create friend relationships
    this.friends.set(this.friendIdCounter++, { id: this.friendIdCounter, userId: user1.id, friendId: user2.id });
    this.friends.set(this.friendIdCounter++, { id: this.friendIdCounter, userId: user1.id, friendId: user3.id });
    this.friends.set(this.friendIdCounter++, { id: this.friendIdCounter, userId: user1.id, friendId: user4.id });
    
    // Create tasks for Sophia
    const today = new Date();
    
    // Task 1: Completed
    this.tasks.set(this.taskIdCounter++, {
      id: this.taskIdCounter,
      userId: user1.id,
      title: "Review team updates",
      description: "Go through daily updates from all team members",
      dueDate: today,
      dueTime: "11:00",
      priority: "medium",
      completed: true,
      createdAt: new Date(today.getTime() - 24 * 60 * 60 * 1000)
    });
    
    // Task 2: Incomplete, high priority
    this.tasks.set(this.taskIdCounter++, {
      id: this.taskIdCounter,
      userId: user1.id,
      title: "Finish project presentation",
      description: "Prepare slides and talking points for tomorrow's client meeting",
      dueDate: today,
      dueTime: "17:00",
      priority: "high",
      completed: false,
      createdAt: new Date(today.getTime() - 48 * 60 * 60 * 1000)
    });
    
    // Task 3: Incomplete, urgent
    this.tasks.set(this.taskIdCounter++, {
      id: this.taskIdCounter,
      userId: user1.id,
      title: "Schedule weekly planning session",
      description: "Send calendar invites for next Monday's team planning",
      dueDate: today,
      dueTime: "15:30",
      priority: "urgent",
      completed: false,
      createdAt: new Date(today.getTime() - 12 * 60 * 60 * 1000)
    });
    
    // Additional tasks to match the 5 of 8 tasks completed status
    for (let i = 0; i < 5; i++) {
      this.tasks.set(this.taskIdCounter++, {
        id: this.taskIdCounter,
        userId: user1.id,
        title: `Completed task ${i + 1}`,
        description: `This is a completed task ${i + 1}`,
        dueDate: today,
        dueTime: `${10 + i}:00`,
        priority: "medium",
        completed: true,
        createdAt: new Date(today.getTime() - (i + 1) * 60 * 60 * 1000)
      });
    }
    
    // Create a couple more incomplete tasks
    for (let i = 0; i < 1; i++) {
      this.tasks.set(this.taskIdCounter++, {
        id: this.taskIdCounter,
        userId: user1.id,
        title: `Pending task ${i + 1}`,
        description: `This is an incomplete task ${i + 1}`,
        dueDate: today,
        dueTime: `${14 + i}:00`,
        priority: "low",
        completed: false,
        createdAt: new Date(today.getTime() - (i + 1) * 30 * 60 * 1000)
      });
    }
    
    // Create tasks for friends (Alex)
    for (let i = 0; i < 10; i++) {
      this.tasks.set(this.taskIdCounter++, {
        id: this.taskIdCounter,
        userId: user2.id,
        title: `Alex's task ${i + 1}`,
        description: `This is Alex's task ${i + 1}`,
        dueDate: today,
        dueTime: `${9 + i}:00`,
        priority: i % 4 === 0 ? "high" : i % 3 === 0 ? "medium" : "low",
        completed: i < 8, // 8 of 10 completed
        createdAt: new Date(today.getTime() - (i + 1) * 60 * 60 * 1000)
      });
    }
    
    // Create tasks for Maria
    for (let i = 0; i < 12; i++) {
      this.tasks.set(this.taskIdCounter++, {
        id: this.taskIdCounter,
        userId: user3.id,
        title: `Maria's task ${i + 1}`,
        description: `This is Maria's task ${i + 1}`,
        dueDate: today,
        dueTime: `${9 + i % 8}:00`,
        priority: i % 4 === 0 ? "high" : i % 3 === 0 ? "medium" : "low",
        completed: i < 6, // 6 of 12 completed
        createdAt: new Date(today.getTime() - (i + 1) * 60 * 60 * 1000)
      });
    }
    
    // Create tasks for Tyrone
    for (let i = 0; i < 7; i++) {
      this.tasks.set(this.taskIdCounter++, {
        id: this.taskIdCounter,
        userId: user4.id,
        title: `Tyrone's task ${i + 1}`,
        description: `This is Tyrone's task ${i + 1}`,
        dueDate: today,
        dueTime: `${10 + i % 6}:00`,
        priority: i % 4 === 0 ? "high" : i % 3 === 0 ? "medium" : "low",
        completed: i < 3, // 3 of 7 completed
        createdAt: new Date(today.getTime() - (i + 1) * 60 * 60 * 1000)
      });
    }
    
    // Create notifications
    this.notifications.set(this.notificationIdCounter++, {
      id: this.notificationIdCounter,
      userId: user1.id,
      title: "Upcoming Task: Finish project presentation",
      message: "Due in 30 minutes",
      type: "reminder",
      read: false,
      createdAt: new Date(today.getTime() - 30 * 60 * 1000)
    });
    
    this.notifications.set(this.notificationIdCounter++, {
      id: this.notificationIdCounter,
      userId: user1.id,
      title: "Maria completed 100% of her tasks today!",
      message: "Great job Maria!",
      type: "friend_activity",
      read: false,
      createdAt: new Date(today.getTime() - 2 * 60 * 60 * 1000)
    });
    
    this.notifications.set(this.notificationIdCounter++, {
      id: this.notificationIdCounter,
      userId: user1.id,
      title: "Reminder: Schedule weekly planning session",
      message: "Task is due today",
      type: "reminder",
      read: false,
      createdAt: new Date(today.getTime() - 4 * 60 * 60 * 1000)
    });
    
    // Create groups
    const projectGroup = {
      id: this.groupIdCounter++,
      name: "Website Redesign",
      description: "Collaborative project to redesign company website",
      goalDate: new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
      createdBy: user1.id,
      createdAt: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      avatar: null
    };
    
    const studyGroup = {
      id: this.groupIdCounter++,
      name: "Coding Study Group",
      description: "Group for learning and practicing coding together",
      goalDate: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      createdBy: user2.id,
      createdAt: new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      avatar: null
    };
    
    this.groups.set(projectGroup.id, projectGroup);
    this.groups.set(studyGroup.id, studyGroup);
    
    // Add members to groups
    // Website Redesign group - Sophia is already the admin as creator
    this.groupMembers.set(this.groupMemberIdCounter++, {
      id: this.groupMemberIdCounter,
      groupId: projectGroup.id,
      userId: user1.id,
      role: "admin",
      joinedAt: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000)
    });
    
    this.groupMembers.set(this.groupMemberIdCounter++, {
      id: this.groupMemberIdCounter,
      groupId: projectGroup.id,
      userId: user2.id,
      role: "member",
      joinedAt: new Date(today.getTime() - 4 * 24 * 60 * 60 * 1000)
    });
    
    this.groupMembers.set(this.groupMemberIdCounter++, {
      id: this.groupMemberIdCounter,
      groupId: projectGroup.id,
      userId: user3.id,
      role: "member",
      joinedAt: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000)
    });
    
    // Coding Study Group
    this.groupMembers.set(this.groupMemberIdCounter++, {
      id: this.groupMemberIdCounter,
      groupId: studyGroup.id,
      userId: user2.id,
      role: "admin",
      joinedAt: new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000)
    });
    
    this.groupMembers.set(this.groupMemberIdCounter++, {
      id: this.groupMemberIdCounter,
      groupId: studyGroup.id,
      userId: user1.id,
      role: "member",
      joinedAt: new Date(today.getTime() - 8 * 24 * 60 * 60 * 1000)
    });
    
    this.groupMembers.set(this.groupMemberIdCounter++, {
      id: this.groupMemberIdCounter,
      groupId: studyGroup.id,
      userId: user4.id,
      role: "member",
      joinedAt: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    });
    
    // Create group tasks
    // Tasks for Website Redesign group
    this.tasks.set(this.taskIdCounter++, {
      id: this.taskIdCounter,
      userId: user1.id,
      title: "Define website requirements",
      description: "Create a document with all website requirements and objectives",
      dueDate: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000),
      dueTime: "14:00",
      priority: "high",
      completed: true,
      private: false,
      groupId: projectGroup.id,
      createdAt: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000)
    });
    
    this.tasks.set(this.taskIdCounter++, {
      id: this.taskIdCounter,
      userId: user2.id,
      title: "Design homepage mockup",
      description: "Create a mockup for the new homepage design",
      dueDate: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000),
      dueTime: "17:00",
      priority: "medium",
      completed: false,
      private: false,
      groupId: projectGroup.id,
      createdAt: new Date(today.getTime() - 4 * 24 * 60 * 60 * 1000)
    });
    
    this.tasks.set(this.taskIdCounter++, {
      id: this.taskIdCounter,
      userId: user3.id,
      title: "Database schema design",
      description: "Design the database schema for the new website",
      dueDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000),
      dueTime: "16:00",
      priority: "high",
      completed: false,
      private: false,
      groupId: projectGroup.id,
      createdAt: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000)
    });
    
    // Tasks for Coding Study Group
    this.tasks.set(this.taskIdCounter++, {
      id: this.taskIdCounter,
      userId: user2.id,
      title: "Prepare JavaScript exercises",
      description: "Create a set of JavaScript exercises for the next study session",
      dueDate: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000),
      dueTime: "10:00",
      priority: "medium",
      completed: true,
      private: false,
      groupId: studyGroup.id,
      createdAt: new Date(today.getTime() - 9 * 24 * 60 * 60 * 1000)
    });
    
    this.tasks.set(this.taskIdCounter++, {
      id: this.taskIdCounter,
      userId: user1.id,
      title: "Research React hooks",
      description: "Research and prepare a presentation on React hooks",
      dueDate: new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000),
      dueTime: "12:00",
      priority: "low",
      completed: false,
      private: false,
      groupId: studyGroup.id,
      createdAt: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    });
    
    this.tasks.set(this.taskIdCounter++, {
      id: this.taskIdCounter,
      userId: user4.id,
      title: "Organize coding challenge",
      description: "Organize a coding challenge for the group",
      dueDate: new Date(today.getTime() + 15 * 24 * 60 * 60 * 1000),
      dueTime: "18:00",
      priority: "urgent",
      completed: false,
      private: false,
      groupId: studyGroup.id,
      createdAt: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000)
    });
  }
}

export const storage = new MemStorage();
