import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from 'zod';
import { todoGenerationPrompt, quarterlyGoalsGenerationPrompt, weeklyGoalsGenerationPrompt } from './prompts';
import { config, validateConfig } from '../src/config';

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
  WeeklyGoalsResponse
}; 