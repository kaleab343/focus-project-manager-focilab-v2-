import { z } from 'zod';

export interface TodoItemType {
  id: string;
  title: string;
}

export interface GenerateContext {
  vision: string;
  yearlyGoals: string[];
  weeklyGoals: string[];
}

export const TodoItem: z.ZodObject<{
  id: z.ZodString;
  title: z.ZodString;
}>;

export const TodoList: z.ZodArray<typeof TodoItem>;

export function generateTodoList(context?: GenerateContext): Promise<TodoItemType[]>;
export function getContextFromLocalStorage(): GenerateContext;

export const todoSchema: {
  TodoItem: typeof TodoItem;
  TodoList: typeof TodoList;
}; 