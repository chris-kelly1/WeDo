import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTaskSchema, insertUserSchema } from "@shared/schema";
import { z } from "zod";
import { format } from "date-fns";

export async function registerRoutes(app: Express): Promise<Server> {
  // API prefix
  const apiRouter = app.route('/api');

  // User routes
  app.get('/api/users/:id', async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Remove password before sending
      const { password, ...userWithoutPassword } = user;
      return res.json(userWithoutPassword);
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching user' });
    }
  });

  app.post('/api/users', async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      
      // Remove password before sending
      const { password, ...userWithoutPassword } = user;
      return res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid user data', errors: error.errors });
      }
      return res.status(500).json({ message: 'Error creating user' });
    }
  });

  // Task routes
  app.get('/api/tasks', async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: 'User ID is required' });
      }
      
      const tasks = await storage.getTasks(userId);
      return res.json(tasks);
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching tasks' });
    }
  });

  app.get('/api/tasks/today', async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: 'User ID is required' });
      }
      
      const today = new Date();
      const tasks = await storage.getTasksByDate(userId, today);
      return res.json(tasks);
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching today\'s tasks' });
    }
  });

  app.get('/api/tasks/:id', async (req, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const task = await storage.getTask(taskId);
      
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }
      
      return res.json(task);
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching task' });
    }
  });

  app.post('/api/tasks', async (req, res) => {
    try {
      // Parse the body first to get a clean object
      const rawData = req.body;
      
      // Convert the string date to a Date object if it's a string
      if (rawData.dueDate && typeof rawData.dueDate === 'string') {
        rawData.dueDate = new Date(rawData.dueDate);
      }
      
      const taskData = insertTaskSchema.parse(rawData);
      const task = await storage.createTask(taskData);
      return res.status(201).json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid task data', errors: error.errors });
      }
      console.error('Error creating task:', error);
      return res.status(500).json({ message: 'Error creating task' });
    }
  });

  app.patch('/api/tasks/:id', async (req, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const taskUpdate = req.body;
      
      // Convert the string date to a Date object if it's a string
      if (taskUpdate.dueDate && typeof taskUpdate.dueDate === 'string') {
        taskUpdate.dueDate = new Date(taskUpdate.dueDate);
      }
      
      const updatedTask = await storage.updateTask(taskId, taskUpdate);
      
      if (!updatedTask) {
        return res.status(404).json({ message: 'Task not found' });
      }
      
      return res.json(updatedTask);
    } catch (error) {
      console.error('Error updating task:', error);
      return res.status(500).json({ message: 'Error updating task' });
    }
  });

  app.delete('/api/tasks/:id', async (req, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const success = await storage.deleteTask(taskId);
      
      if (!success) {
        return res.status(404).json({ message: 'Task not found' });
      }
      
      return res.json({ success: true });
    } catch (error) {
      return res.status(500).json({ message: 'Error deleting task' });
    }
  });

  // Friend routes
  app.get('/api/friends', async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: 'User ID is required' });
      }
      
      const friends = await storage.getFriends(userId);
      return res.json(friends);
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching friends' });
    }
  });

  // Notification routes
  app.get('/api/notifications', async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: 'User ID is required' });
      }
      
      const notifications = await storage.getNotifications(userId);
      return res.json(notifications);
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching notifications' });
    }
  });

  app.patch('/api/notifications/:id/read', async (req, res) => {
    try {
      const notificationId = parseInt(req.params.id);
      const updatedNotification = await storage.markNotificationAsRead(notificationId);
      
      if (!updatedNotification) {
        return res.status(404).json({ message: 'Notification not found' });
      }
      
      return res.json(updatedNotification);
    } catch (error) {
      return res.status(500).json({ message: 'Error marking notification as read' });
    }
  });

  // Stats routes for dashboard
  app.get('/api/stats/today', async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: 'User ID is required' });
      }
      
      const today = new Date();
      const tasks = await storage.getTasksByDate(userId, today);
      const totalTasks = tasks.length;
      const completedTasks = tasks.filter(task => task.completed).length;
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      
      const user = await storage.getUser(userId);
      
      return res.json({
        date: format(today, 'EEEE, MMMM d'),
        totalTasks,
        completedTasks,
        progress,
        streak: user?.streak || 0
      });
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching stats' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
