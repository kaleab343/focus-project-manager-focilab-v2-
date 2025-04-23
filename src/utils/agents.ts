import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from 'zod';
import { todoGenerationPrompt, quarterlyGoalsGenerationPrompt, weeklyGoalsGenerationPrompt, projectMilestoneGenerationPrompt } from './prompts';
import { config, validateConfig } from '@/config';

export interface TodoItemType {
  id: string;
  title: string;
}

export interface GenerateContext {
  vision: string;
  yearlyGoals: string[];
  quarterlyGoals: string[];
  weeklyGoals: string[];
}

// Project milestone and task interfaces
export interface TaskType {
  id: string;
  title: string;
  description?: string;
}

export interface MilestoneType {
  id: string;
  name: string;
  description?: string;
  dueDate?: string;
  tasks: TaskType[];
}

export interface ProjectMilestonesResponse {
  milestones: MilestoneType[];
}

// Validate environment variables
validateConfig();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: config.openai.apiKey,
  dangerouslyAllowBrowser: true // Required for browser usage
});

// Define the Todo item schema
export const TodoItem = z.object({
  id: z.string(),
  title: z.string()
});

// Wrap the todo list in an object
export const TodoResponse = z.object({
  todos: z.array(TodoItem)
});

// Define the Goal item schema
export const GoalItem = z.object({
  id: z.string(),
  text: z.string()
});

// Wrap the quarterly goals list in an object
export const QuarterlyGoalsResponse = z.object({
  goals: z.array(GoalItem)
});

// Wrap the weekly goals list in an object
export const WeeklyGoalsResponse = z.object({
  goals: z.array(GoalItem)
});

// Define the Task schema
export const Task = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional()
});

// Define the Milestone schema
export const Milestone = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  tasks: z.array(Task)
});

// Wrap the milestones list in an object
export const ProjectMilestonesSchema = z.object({
  milestones: z.array(Milestone)
});

/**
 * Generates a structured todo list using OpenAI's completion API
 * @param {GenerateContext} context - Context for todo list generation
 * @returns {Promise<TodoItemType[]>} Array of structured todo items
 */
export async function generateTodoList(context: GenerateContext = {
  vision: '',
  yearlyGoals: [],
  quarterlyGoals: [],
  weeklyGoals: []
}): Promise<TodoItemType[]> {
  try {
    const completion = await openai.beta.chat.completions.parse({
      model: "gpt-4o-2024-08-06",
      messages: [
        {
          role: "system",
          content: todoGenerationPrompt
        },
        {
          role: "user",
          content: `Generate daily todo items based on the following context:
Vision: ${context.vision}
Yearly Goals: ${context.yearlyGoals.join(', ')}
Quarterly Goals: ${context.quarterlyGoals.join(', ')}
Weekly Goals: ${context.weeklyGoals.join(', ')}`
        }
      ],
      response_format: zodResponseFormat(TodoResponse, "response"),
      temperature: 0.7,
      max_tokens: 500,
    });

    if (!completion.choices[0].message.parsed) {
      return [];
    }

    return completion.choices[0].message.parsed.todos;
  } catch (error) {
    console.error('Error generating todo list:', error);
    throw error;
  }
}

/**
 * Generates structured quarterly goals using OpenAI's completion API
 * @param {Object} context - Context for quarterly goals generation
 * @param {string} context.vision - User's vision statement
 * @param {string[]} context.yearlyGoals - User's yearly goals
 * @returns {Promise<{id: string, text: string}[]>} Array of structured quarterly goals
 */
export async function generateQuarterlyGoals({
  vision = '',
  yearlyGoals = []
}: Pick<GenerateContext, 'vision' | 'yearlyGoals'>): Promise<{id: string, text: string}[]> {
  try {
    const completion = await openai.beta.chat.completions.parse({
      model: "gpt-4o-2024-08-06",
      messages: [
        {
          role: "system",
          content: quarterlyGoalsGenerationPrompt
        },
        {
          role: "user",
          content: `Generate quarterly goals based on the following context:
Vision: ${vision}
Yearly Goals: ${yearlyGoals.join(', ')}`
        }
      ],
      response_format: zodResponseFormat(QuarterlyGoalsResponse, "response"),
      temperature: 0.7,
      max_tokens: 800,
    });

    if (!completion.choices[0].message.parsed) {
      return [];
    }

    return completion.choices[0].message.parsed.goals;
  } catch (error) {
    console.error('Error generating quarterly goals:', error);
    throw error;
  }
}

/**
 * Generates structured weekly goals using OpenAI's completion API
 * @param {Object} context - Context for weekly goals generation
 * @param {string} context.vision - User's vision statement
 * @param {string[]} context.yearlyGoals - User's yearly goals
 * @param {string[]} context.quarterlyGoals - User's quarterly goals
 * @returns {Promise<{id: string, text: string}[]>} Array of structured weekly goals
 */
export async function generateWeeklyGoals({
  vision = '',
  yearlyGoals = [],
  quarterlyGoals = []
}: Pick<GenerateContext, 'vision' | 'yearlyGoals' | 'quarterlyGoals'>): Promise<{id: string, text: string}[]> {
  try {
    const completion = await openai.beta.chat.completions.parse({
      model: "gpt-4o-2024-08-06",
      messages: [
        {
          role: "system",
          content: weeklyGoalsGenerationPrompt
        },
        {
          role: "user",
          content: `Generate weekly goals based on the following context:
Vision: ${vision}
Yearly Goals: ${yearlyGoals.join(', ')}
Quarterly Goals: ${quarterlyGoals.join(', ')}`
        }
      ],
      response_format: zodResponseFormat(WeeklyGoalsResponse, "response"),
      temperature: 0.7,
      max_tokens: 600,
    });

    if (!completion.choices[0].message.parsed) {
      return [];
    }

    return completion.choices[0].message.parsed.goals;
  } catch (error) {
    console.error('Error generating weekly goals:', error);
    throw error;
  }
}

/**
 * Generates structured project milestones and tasks using OpenAI's completion API
 * @param {Object} projectInfo - Information about the project
 * @param {string} projectInfo.title - Project title
 * @param {string} projectInfo.description - Project description
 * @param {string} projectInfo.status - Project status
 * @param {string} [projectInfo.startDate] - Project start date (optional)
 * @param {string} [projectInfo.prompt] - Custom prompt for milestone generation (optional)
 * @returns {Promise<MilestoneType[]>} Array of structured milestones with tasks
 */
export async function generateProjectMilestones({
  title = '',
  description = '',
  status = '',
  startDate = '',
  prompt = ''
}: {
  title: string;
  description: string;
  status: string;
  startDate?: string;
  prompt?: string;
}): Promise<MilestoneType[]> {
  try {
    // Use the predefined prompt or a custom one if provided
    const systemPrompt = prompt || projectMilestoneGenerationPrompt;

    const completion = await openai.beta.chat.completions.parse({
      model: "gpt-4o-2024-08-06",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: `Generate milestones and tasks for the following project:
Title: ${title}
Description: ${description}
Status: ${status}
Start Date: ${startDate || 'Not specified'}`
        }
      ],
      response_format: zodResponseFormat(ProjectMilestonesSchema, "response"),
      temperature: 0.7,
      max_tokens: 1500,
    });

    if (!completion.choices[0].message.parsed) {
      return [];
    }

    // Process the milestones to ensure we're not relying on AI-generated IDs
    const milestones = completion.choices[0].message.parsed.milestones;
    
    // Store the tasks in localStorage for future use
    try {
      // For each milestone, store its tasks in localStorage with a key based on the milestone name
      milestones.forEach((milestone, index) => {
        if (milestone.tasks && milestone.tasks.length > 0) {
          const tasksKey = `project_tasks_${title.replace(/\s+/g, '_').toLowerCase()}_milestone_${index}`;
          localStorage.setItem(tasksKey, JSON.stringify(milestone.tasks));
        }
      });
    } catch (storageError) {
      console.error('Error storing tasks in localStorage:', storageError);
      // Continue even if localStorage fails
    }
    
    // Return the milestones but let the application assign IDs
    return milestones;
  } catch (error) {
    console.error('Error generating project milestones:', error);
    throw error;
  }
}

// Helper function to get context from localStorage
export function getContextFromLocalStorage(): GenerateContext {
  try {
    const vision = localStorage.getItem('visionText') || '';
    const yearlyGoals = JSON.parse(localStorage.getItem('yearlyGoals') || '[]')
      .filter((goal: { completed: boolean }) => !goal.completed)
      .map((goal: { text: string }) => goal.text);
    const quarterlyGoals = JSON.parse(localStorage.getItem('quarterlyGoals') || '[]')
      .filter((goal: { completed: boolean }) => !goal.completed)
      .map((goal: { text: string }) => goal.text);
    const weeklyGoals = JSON.parse(localStorage.getItem('weeklyTodos') || '[]')
      .filter((todo: { completed: boolean }) => !todo.completed)
      .map((todo: { text: string }) => todo.text);

    return { vision, yearlyGoals, quarterlyGoals, weeklyGoals };
  } catch (error) {
    console.error('Error getting context from localStorage:', error);
    return { vision: '', yearlyGoals: [], quarterlyGoals: [], weeklyGoals: [] };
  }
}

// Export the schema for use in other parts of the application
export const todoSchema = {
  TodoItem,
  TodoResponse,
  GoalItem,
  QuarterlyGoalsResponse,
  WeeklyGoalsResponse,
  Task,
  Milestone,
  ProjectMilestonesSchema
}; 