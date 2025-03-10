import { 
  users, tasks, friends, notifications,
  type User, type Task, type Friend, type Notification,
  type InsertUser, type InsertTask, type InsertFriend, type InsertNotification
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
  
  // Notification operations
  getNotifications(userId: number): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<Notification | undefined>;
  deleteNotification(id: number): Promise<boolean>;
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
  
  private userIdCounter: number;
  private taskIdCounter: number;
  private friendIdCounter: number;
  private notificationIdCounter: number;

  constructor() {
    this.users = new Map();
    this.tasks = new Map();
    this.friends = new Map();
    this.notifications = new Map();
    
    this.userIdCounter = 1;
    this.taskIdCounter = 1;
    this.friendIdCounter = 1;
    this.notificationIdCounter = 1;
    
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
  }
}

export const storage = new MemStorage();
