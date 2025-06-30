import { useState, useEffect, useCallback } from 'react';
import { TodoItemType } from '@/utils/agents';

// Helper function to standardize day abbreviations
export const standardizeDayAbbreviation = (day: string): string => {
  const dayMap: { [key: string]: string } = {
    'Mon': 'Monday',
    'Tue': 'Tuesday',
    'Wed': 'Wednesday',
    'Thu': 'Thursday',
    'Fri': 'Friday',
    'Sat': 'Saturday',
    'Sun': 'Sunday',
    'Today': new Date().toLocaleDateString('en-US', { weekday: 'long' })
  };
  return dayMap[day] || day;
};

export interface Todo extends TodoItemType {
  status: 'not-started' | 'in-progress' | 'completed';
  date: string;
  projectId?: string;
  isSelected?: boolean;
}

// Simple AI suggestion interface
export interface AISuggestion {
  id: string;
  text: string;
}

// Database configuration
const DB_NAME = 'focilab-db';
const DB_VERSION = 2;
const TODOS_STORE = 'todos';
const AI_SUGGESTIONS_STORAGE_KEY = 'focilab-ai-suggestions';
const HAS_GENERATED_AI_KEY = 'focilab-has-generated-ai';

// Initialize the database
const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('Error opening IndexedDB:', event);
      reject('Error opening IndexedDB');
    };

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create the todos object store if it doesn't exist
      if (!db.objectStoreNames.contains(TODOS_STORE)) {
        const store = db.createObjectStore(TODOS_STORE, { keyPath: 'id' });
        
        // Create indexes for efficient querying
        store.createIndex('date', 'date', { unique: false });
        store.createIndex('projectId', 'projectId', { unique: false });
        store.createIndex('milestoneId', 'milestoneId', { unique: false });
        store.createIndex('status', 'status', { unique: false });
      }
    };
  });
};

// Load AI suggestions from localStorage
const loadAiSuggestionsFromStorage = (): AISuggestion[] => {
  try {
    const storedSuggestions = localStorage.getItem(AI_SUGGESTIONS_STORAGE_KEY);
    return storedSuggestions ? JSON.parse(storedSuggestions) : [];
  } catch (error) {
    console.error('Error loading AI suggestions from localStorage:', error);
    return [];
  }
};

// Save AI suggestions to localStorage
const saveAiSuggestionsToStorage = (suggestions: AISuggestion[]): void => {
  try {
    localStorage.setItem(AI_SUGGESTIONS_STORAGE_KEY, JSON.stringify(suggestions));
  } catch (error) {
    console.error('Error saving AI suggestions to localStorage:', error);
  }
};

// Check if AI suggestions have been generated
const hasGeneratedAI = (): boolean => {
  return localStorage.getItem(HAS_GENERATED_AI_KEY) === 'true';
};

// Mark that AI suggestions have been generated
const markAIGenerated = (): void => {
  localStorage.setItem(HAS_GENERATED_AI_KEY, 'true');
};

// Hook for managing todos
export const useTodos = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [aiSuggestions, setAISuggestions] = useState<AISuggestion[]>(() => loadAiSuggestionsFromStorage());
  const [loading, setLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(() => hasGeneratedAI());

  // Save AI suggestions to localStorage whenever they change
  useEffect(() => {
    saveAiSuggestionsToStorage(aiSuggestions);
  }, [aiSuggestions]);

  // Save hasGenerated state to localStorage
  useEffect(() => {
    if (hasGenerated) {
      markAIGenerated();
    }
  }, [hasGenerated]);

  // Load all todos from IndexedDB
  const loadTodos = useCallback(async () => {
    try {
      setLoading(true);
      const db = await initDB();
      
      return new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(TODOS_STORE, 'readonly');
        const store = transaction.objectStore(TODOS_STORE);
        const request = store.getAll();

        request.onsuccess = () => {
          setTodos(request.result);
          setLoading(false);
          resolve();
        };

        request.onerror = (event) => {
          console.error('Error loading todos:', event);
          setLoading(false);
          reject(event);
        };

        transaction.oncomplete = () => {
          db.close();
        };
      });
    } catch (err) {
      console.error('Error in loadTodos:', err);
      setLoading(false);
    }
  }, []);

  // Add a new todo
  const addTodo = useCallback(async (todo: Omit<Todo, 'id'>) => {
    const newTodo: Todo = {
      id: Math.random().toString(36).substr(2, 9),
      title: todo.title,
      status: todo.status,
      date: todo.date,
      projectId: todo.projectId,
      isSelected: todo.isSelected || false
    };
    setTodos(prev => [...prev, newTodo]);
    // Persist to IndexedDB
    try {
      const db = await initDB();
      const transaction = db.transaction(TODOS_STORE, 'readwrite');
      const store = transaction.objectStore(TODOS_STORE);
      store.add(newTodo);
      transaction.oncomplete = () => {
        db.close();
      };
    } catch (err) {
      console.error('Error saving todo to IndexedDB:', err);
    }
  }, []);

  // Add AI suggestions
  const addAISuggestions = useCallback((suggestions: string[]) => {
    const newSuggestions = suggestions.map(text => ({
      id: Math.random().toString(36).substr(2, 9),
      text
    }));
    
    // Limit to maximum 2 suggestions and replace existing ones
    const limitedSuggestions = newSuggestions.slice(0, 2);
    
    setAISuggestions(limitedSuggestions);
    setHasGenerated(true);
  }, []);

  // Update an existing todo
  const updateTodo = useCallback(async (id: string, updates: Partial<Todo>) => {
    setTodos(prev => prev.map(todo => 
      todo.id === id ? { ...todo, ...updates } : todo
    ));
    
    // Persist to IndexedDB
    try {
      const db = await initDB();
      const transaction = db.transaction(TODOS_STORE, 'readwrite');
      const store = transaction.objectStore(TODOS_STORE);
      
      // Get the current todo
      const getRequest = store.get(id);
      getRequest.onsuccess = () => {
        const currentTodo = getRequest.result;
        if (currentTodo) {
          const updatedTodo = { ...currentTodo, ...updates };
          store.put(updatedTodo);
        }
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    } catch (err) {
      console.error('Error updating todo in IndexedDB:', err);
    }
  }, []);

  // Update an AI suggestion
  const updateAISuggestion = useCallback((id: string, text: string) => {
    setAISuggestions(prev => prev.map(suggestion =>
      suggestion.id === id ? { ...suggestion, text } : suggestion
    ));
  }, []);

  // Delete a todo
  const deleteTodo = useCallback(async (id: string) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
    
    // Persist to IndexedDB
    try {
      const db = await initDB();
      const transaction = db.transaction(TODOS_STORE, 'readwrite');
      const store = transaction.objectStore(TODOS_STORE);
      store.delete(id);
      transaction.oncomplete = () => {
        db.close();
      };
    } catch (err) {
      console.error('Error deleting todo from IndexedDB:', err);
    }
  }, []);

  // Delete an AI suggestion
  const deleteAISuggestion = useCallback((id: string) => {
    setAISuggestions(prev => prev.filter(suggestion => suggestion.id !== id));
  }, []);

  // Approve an AI suggestion (convert to regular todo)
  const approveAiSuggestion = useCallback((id: string, day: string, projectId?: string) => {
    const suggestion = aiSuggestions.find(s => s.id === id);
    if (suggestion) {
      addTodo({
        title: suggestion.text,
        date: day,
        status: 'not-started',
        projectId
      });
      deleteAISuggestion(id);
    }
  }, [aiSuggestions, addTodo, deleteAISuggestion]);

  // Get todos for a specific day and project
  const getTodosByDay = useCallback((day: string, projectId?: string) => {
    return todos.filter(todo => todo.date === day && (!projectId || todo.projectId === projectId));
  }, [todos]);

  // Check if AI suggestions have been generated
  const hasAISuggestions = useCallback(() => {
    return aiSuggestions.length > 0;
  }, [aiSuggestions]);

  // Clear all AI suggestions
  const clearAISuggestions = useCallback(() => {
    setAISuggestions([]);
    setHasGenerated(false);
    localStorage.removeItem(HAS_GENERATED_AI_KEY);
  }, []);

  // Toggle selected state of a todo
  const toggleSelectedTodo = useCallback(async (id: string) => {
    setTodos(prev => prev.map(todo => 
      todo.id === id ? { ...todo, isSelected: !todo.isSelected } : todo
    ));
    
    // Persist to IndexedDB
    try {
      const db = await initDB();
      const transaction = db.transaction(TODOS_STORE, 'readwrite');
      const store = transaction.objectStore(TODOS_STORE);
      
      // Get the current todo
      const getRequest = store.get(id);
      getRequest.onsuccess = () => {
        const currentTodo = getRequest.result;
        if (currentTodo) {
          const updatedTodo = { ...currentTodo, isSelected: !currentTodo.isSelected };
          store.put(updatedTodo);
        }
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    } catch (err) {
      console.error('Error updating selected state in IndexedDB:', err);
    }
  }, []);

  // Get selected todos (regardless of date)
  const getSelectedTodos = useCallback(() => {
    return todos.filter(todo => todo.isSelected);
  }, [todos]);

  // Load todos on initial render
  useEffect(() => {
    loadTodos();
  }, [loadTodos]);

  return {
    todos,
    aiSuggestions,
    loading,
    addTodo,
    updateTodo,
    deleteTodo,
    addAISuggestions,
    updateAISuggestion,
    deleteAISuggestion,
    approveAiSuggestion,
    getTodosByDay,
    hasAISuggestions,
    hasGenerated,
    clearAISuggestions,
    toggleSelectedTodo,
    getSelectedTodos,
    loadTodos
  };
};
