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
 * @param {Object} project - Project information (optional)
 * @param {string} project.title - Project title
 * @param {string} project.description - Project description
 * @returns {Promise<TodoItemType[]>} Array of structured todo items
 */
export async function generateTodoList(context: GenerateContext = {
  vision: '',
  yearlyGoals: [],
  quarterlyGoals: [],
  weeklyGoals: []
}, project?: { title: string; description?: string }): Promise<TodoItemType[]> {
  try {
    let userPrompt = '';
    let systemPrompt = todoGenerationPrompt;
    if (project) {
      systemPrompt = `You are a helpful assistant specialized in creating daily todo lists for a specific project. Only generate todos that are directly related to the project below. Do not include generic or unrelated tasks.\n\nProject Title: ${project.title}\nProject Description: ${project.description || ''}`;
      userPrompt = `Generate daily todo items for the following project. Only include tasks that are directly related to this project.\nProject Title: ${project.title}\nProject Description: ${project.description || ''}`;
    } else {
      userPrompt = `Generate daily todo items based on the following context:\nVision: ${context.vision}\nYearly Goals: ${context.yearlyGoals.join(', ')}\nQuarterly Goals: ${context.quarterlyGoals.join(', ')}\nWeekly Goals: ${context.weeklyGoals.join(', ')}`;
    }
    const completion = await openai.beta.chat.completions.parse({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: userPrompt
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
 * Generates a structured todo list specifically for a selected weekly todo using OpenAI's completion API
 * @param {string} weeklyTodoText - The specific weekly todo to break down into daily tasks
 * @param {GenerateContext} context - Context for todo list generation
 * @param {Object} project - Project information (optional)
 * @param {string} project.title - Project title
 * @param {string} project.description - Project description
 * @returns {Promise<TodoItemType[]>} Array of structured todo items
 */
export async function generateSpecificDailyTodos(
  weeklyTodoText: string,
  context: GenerateContext = {
    vision: '',
    yearlyGoals: [],
    quarterlyGoals: [],
    weeklyGoals: []
  },
  project?: { title: string; description?: string }
): Promise<TodoItemType[]> {
  try {
    let systemPrompt = `You are a helpful assistant specialized in creating daily todo lists that break down a specific weekly goal into actionable daily tasks.

Your task is to use the weekly goal as a SEARCH KEY to find and generate 3-5 specific daily todo items that will help accomplish this goal. Think of the weekly goal as a search term - find the most relevant, specific, and actionable daily tasks that directly relate to this goal.

IMPORTANT: Use the weekly goal text as your primary search key. Do NOT rely on project context or general goals. Focus entirely on what the weekly goal is asking for and break it down into logical daily steps.

Each daily todo item should:
- Be directly related to the weekly goal (use it as your search key)
- Be specific and immediately actionable
- Start with an action verb
- Be achievable within a day
- Be a logical step toward completing the weekly goal
- Be clear and concise
- Vary in approach and focus areas

Search Strategy:
1. Analyze the weekly goal text carefully
2. Identify the key components and requirements
3. Break it down into logical daily steps
4. Ensure each step directly advances the weekly goal
5. Make each step specific and actionable

Return the response as a JSON object with a "todos" array, where each todo item in the array has:
- id: a unique string identifier
- title: the task description

Example response format:
{
  "todos": [
    {
      "id": "1",
      "title": "Research key topics for chapter 1"
    },
    {
      "id": "2",
      "title": "Create outline for first 1000 words"
    }
  ]
}

Focus on practical steps that can be completed today to make progress on the selected weekly goal.`;

    let userPrompt = `SEARCH KEY (Weekly Goal): "${weeklyTodoText}"

Using this weekly goal as your search key, generate 3-5 specific daily todo items that will help accomplish this goal. 

Break down "${weeklyTodoText}" into actionable daily tasks. Each task should be directly related to this specific goal and represent a logical step toward its completion.`;

    // Add minimal project context only if it directly relates to the weekly goal
    if (project && (weeklyTodoText.toLowerCase().includes(project.title.toLowerCase()) || 
                   (project.description && weeklyTodoText.toLowerCase().includes(project.description.toLowerCase())))) {
      userPrompt += `\n\nNote: This goal is part of project "${project.title}". Ensure tasks align with project context.`;
    }

    // Add general context only if it's relevant to the specific weekly goal
    if (context.vision && weeklyTodoText.toLowerCase().includes(context.vision.toLowerCase())) {
      userPrompt += `\n\nVision Context: ${context.vision}`;
    }

    const completion = await openai.beta.chat.completions.parse({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: userPrompt
        }
      ],
      response_format: zodResponseFormat(TodoResponse, "response"),
      temperature: 0.8, // Slightly higher temperature for more varied results
      max_tokens: 500,
    });
    if (!completion.choices[0].message.parsed) {
      return [];
    }
    return completion.choices[0].message.parsed.todos;
  } catch (error) {
    console.error('Error generating specific daily todos:', error);
    throw error;
  }
}

/**
 * Generates structured quarterly goals using OpenAI's completion API
 * @param {Object} context - Context for quarterly goals generation
 * @param {string} context.vision - User's vision statement
 * @param {string[]} context.yearlyGoals - User's yearly goals
 * @param {number} [context.quarter] - Specific quarter (1-4) for targeted goals
 * @returns {Promise<{id: string, text: string}[]>} Array of structured quarterly goals
 */
export async function generateQuarterlyGoals({
  vision = '',
  yearlyGoals = [],
  quarter
}: Pick<GenerateContext, 'vision' | 'yearlyGoals'> & { quarter?: number }): Promise<{id: string, text: string}[]> {
  try {
    const quarterNames = ['Q1 (January-March)', 'Q2 (April-June)', 'Q3 (July-September)', 'Q4 (October-December)'];
    const quarterContext = quarter ? `Focus on ${quarterNames[quarter - 1]} specifically. ` : '';
    
    const completion = await openai.beta.chat.completions.parse({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: quarterlyGoalsGenerationPrompt
        },
        {
          role: "user",
          content: `Generate quarterly goals based on the following context:
${quarterContext}Vision: ${vision}
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
 * @param {Object} project - Project information (optional)
 * @param {string} project.title - Project title
 * @param {string} project.description - Project description
 * @returns {Promise<{id: string, text: string}[]>} Array of structured weekly goals
 */
export async function generateWeeklyGoals({
  vision = '',
  yearlyGoals = [],
  quarterlyGoals = []
}: Pick<GenerateContext, 'vision' | 'yearlyGoals' | 'quarterlyGoals'>, project?: { title: string; description?: string }): Promise<{id: string, text: string}[]> {
  try {
    let userPrompt = '';
    let systemPrompt = weeklyGoalsGenerationPrompt;
    if (project) {
      systemPrompt = `You are a helpful assistant specialized in creating weekly goals for a specific project. Only generate goals that are directly related to the project below. Do not include generic or unrelated goals.\n\nProject Title: ${project.title}\nProject Description: ${project.description || ''}`;
      userPrompt = `Generate weekly goals for the following project. Only include goals that are directly related to this project.\nProject Title: ${project.title}\nProject Description: ${project.description || ''}`;
    } else {
      userPrompt = `Generate weekly goals based on the following context:\nVision: ${vision}\nYearly Goals: ${yearlyGoals.join(', ')}\nQuarterly Goals: ${quarterlyGoals.join(', ')}`;
    }
    const completion = await openai.beta.chat.completions.parse({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: userPrompt
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
      model: "gpt-4o-mini",
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

/**
 * Generates structured daily todos specifically for a current work project
 * @param {Object} project - Current work project information
 * @param {string} project.title - Project title
 * @param {string} project.description - Project description
 * @returns {Promise<TodoItemType[]>} Array of structured daily todos for the project
 */
export async function generateProjectDailyTodos(
  project: { title: string; description?: string }
): Promise<TodoItemType[]> {
  try {
    const systemPrompt = `You are a helpful assistant specialized in creating daily todo lists specifically for a current work project.

Your task is to generate 3-5 specific daily todo items that will help make progress on the current work project. Focus entirely on the project's specific needs and requirements.

Each daily todo item should:
- Be directly related to the current work project
- Be specific and immediately actionable
- Start with an action verb
- Be achievable within a day
- Be a logical step toward advancing the project
- Be clear and concise
- Focus on the most important next steps for the project

Project Context:
- Title: ${project.title}
- Description: ${project.description || 'No description provided'}

Return the response as a JSON object with a "todos" array, where each todo item in the array has:
- id: a unique string identifier
- title: the task description

Example response format:
{
  "todos": [
    {
      "id": "1",
      "title": "Review project requirements and create task breakdown"
    },
    {
      "id": "2",
      "title": "Set up development environment for ${project.title}"
    }
  ]
}

Focus on practical steps that can be completed today to make progress on the current work project.`;

    const userPrompt = `Generate 3-5 daily todo items specifically for the current work project:

Project Title: ${project.title}
Project Description: ${project.description || 'No description provided'}

Create actionable daily tasks that will help advance this specific project. Each task should be directly related to the project and represent a logical next step.`;

    const completion = await openai.beta.chat.completions.parse({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: userPrompt
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
    console.error('Error generating project daily todos:', error);
    throw error;
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