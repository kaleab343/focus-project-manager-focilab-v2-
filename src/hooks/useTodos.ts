import { useState, useEffect, useCallback } from 'react';

// Helper function to standardize day abbreviations
export const standardizeDayAbbreviation = (day: string): string => {
  // If it's already a 3-letter abbreviation like "Mon", "Tue", etc., return as is
  if (day.length === 3) {
    return day;
  }
  
  // If it's "Today", convert to current day's abbreviation
  if (day === "Today") {
    return new Date().toLocaleDateString('en-US', { weekday: 'short' });
  }
  
  // If it's a full day name, convert to abbreviation
  const fullDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const abbrevs = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  const index = fullDays.findIndex(d => d.startsWith(day));
  if (index !== -1) {
    return abbrevs[index];
  }
  
  // Default case, return as is
  return day;
};

export interface Todo {
  id: string;
  name: string;
  date: string;
  projectId?: string;
  milestoneId?: string;
  status: 'not-started' | 'in-progress' | 'completed';
  isAISuggestion?: boolean;
}

// Simple AI suggestion interface
export interface AISuggestion {
  id: string;
  text: string;
}

// Database configuration
const DB_NAME = 'focilab-db';
const DB_VERSION = 1;
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
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>(loadAiSuggestionsFromStorage());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasGenerated, setHasGenerated] = useState<boolean>(hasGeneratedAI());

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
          setError('Failed to load todos');
          setLoading(false);
          reject(event);
        };

        transaction.oncomplete = () => {
          db.close();
        };
      });
    } catch (err) {
      console.error('Error in loadTodos:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setLoading(false);
    }
  }, []);

  // Add a new todo
  const addTodo = useCallback(async (todo: Omit<Todo, 'id'>) => {
    const newTodo: Todo = {
      ...todo,
      id: Date.now().toString(),
      date: standardizeDayAbbreviation(todo.date)
    };

    // Regular todos go to IndexedDB
    try {
      const db = await initDB();

      return new Promise<Todo>((resolve, reject) => {
        const transaction = db.transaction(TODOS_STORE, 'readwrite');
        const store = transaction.objectStore(TODOS_STORE);
        const request = store.add(newTodo);

        request.onsuccess = () => {
          setTodos(prev => [...prev, newTodo]);
          resolve(newTodo);
        };

        request.onerror = (event) => {
          console.error('Error adding todo:', event);
          reject(event);
        };

        transaction.oncomplete = () => {
          db.close();
        };
      });
    } catch (err) {
      console.error('Error in addTodo:', err);
      throw err;
    }
  }, []);

  // Add AI suggestions
  const addAISuggestions = useCallback((suggestions: string[]) => {
    const newSuggestions = suggestions.map(text => ({
      id: Date.now() + Math.random().toString(36).substring(2, 9),
      text
    }));
    
    setAiSuggestions(prev => [...prev, ...newSuggestions]);
    setHasGenerated(true);
    
    return newSuggestions;
  }, []);

  // Update an existing todo
  const updateTodo = useCallback(async (id: string, updates: Partial<Todo>) => {
    try {
      const db = await initDB();

      return new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(TODOS_STORE, 'readwrite');
        const store = transaction.objectStore(TODOS_STORE);
        const getRequest = store.get(id);

        getRequest.onsuccess = () => {
          const todo = getRequest.result;
          if (!todo) {
            reject(new Error('Todo not found'));
            return;
          }

          const updatedTodo = { ...todo, ...updates };
          const updateRequest = store.put(updatedTodo);

          updateRequest.onsuccess = () => {
            setTodos(prev => 
              prev.map(t => t.id === id ? updatedTodo : t)
            );
            resolve();
          };

          updateRequest.onerror = (event) => {
            console.error('Error updating todo:', event);
            reject(event);
          };
        };

        getRequest.onerror = (event) => {
          console.error('Error getting todo for update:', event);
          reject(event);
        };

        transaction.oncomplete = () => {
          db.close();
        };
      });
    } catch (err) {
      console.error('Error in updateTodo:', err);
      throw err;
    }
  }, []);

  // Update an AI suggestion
  const updateAISuggestion = useCallback((id: string, text: string) => {
    setAiSuggestions(prev => 
      prev.map(suggestion => 
        suggestion.id === id ? { ...suggestion, text } : suggestion
      )
    );
  }, []);

  // Delete a todo
  const deleteTodo = useCallback(async (id: string) => {
    try {
      const db = await initDB();

      return new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(TODOS_STORE, 'readwrite');
        const store = transaction.objectStore(TODOS_STORE);
        const request = store.delete(id);

        request.onsuccess = () => {
          setTodos(prev => prev.filter(todo => todo.id !== id));
          resolve();
        };

        request.onerror = (event) => {
          console.error('Error deleting todo:', event);
          reject(event);
        };

        transaction.oncomplete = () => {
          db.close();
        };
      });
    } catch (err) {
      console.error('Error in deleteTodo:', err);
      throw err;
    }
  }, []);

  // Delete an AI suggestion
  const deleteAISuggestion = useCallback((id: string) => {
    setAiSuggestions(prev => prev.filter(suggestion => suggestion.id !== id));
  }, []);

  // Approve an AI suggestion (convert to regular todo)
  const approveAiSuggestion = useCallback(async (id: string, date: string) => {
    // Find the AI suggestion
    const aiSuggestion = aiSuggestions.find(suggestion => suggestion.id === id);
    
    if (!aiSuggestion) {
      console.error('AI suggestion not found');
      return;
    }

    // Create a regular todo from the AI suggestion
    const regularTodo: Todo = {
      id: Date.now().toString(),
      name: aiSuggestion.text,
      date: standardizeDayAbbreviation(date),
      status: 'not-started'
    };

    // Add the regular todo to IndexedDB
    try {
      const db = await initDB();

      return new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(TODOS_STORE, 'readwrite');
        const store = transaction.objectStore(TODOS_STORE);
        const request = store.add(regularTodo);

        request.onsuccess = () => {
          // Remove from AI suggestions
          setAiSuggestions(prev => prev.filter(s => s.id !== id));
          // Add to regular todos
          setTodos(prev => [...prev, regularTodo]);
          resolve();
        };

        request.onerror = (event) => {
          console.error('Error approving AI todo:', event);
          reject(event);
        };

        transaction.oncomplete = () => {
          db.close();
        };
      });
    } catch (err) {
      console.error('Error in approveAiSuggestion:', err);
      throw err;
    }
  }, [aiSuggestions]);

  // Get todos for a specific day
  const getTodosByDay = useCallback((day: string) => {
    const standardizedDay = standardizeDayAbbreviation(day);
    return todos.filter(todo => todo.date === standardizedDay);
  }, [todos]);

  // Check if AI suggestions have been generated
  const hasAISuggestions = useCallback(() => {
    return aiSuggestions.length > 0;
  }, [aiSuggestions]);

  // Clear all AI suggestions
  const clearAISuggestions = useCallback(() => {
    setAiSuggestions([]);
    localStorage.removeItem(HAS_GENERATED_AI_KEY);
    setHasGenerated(false);
  }, []);

  // Load todos on initial render
  useEffect(() => {
    loadTodos();
  }, [loadTodos]);

  return {
    todos,
    aiSuggestions,
    loading,
    error,
    addTodo,
    addAISuggestions,
    updateTodo,
    updateAISuggestion,
    deleteTodo,
    deleteAISuggestion,
    approveAiSuggestion,
    getTodosByDay,
    hasAISuggestions,
    hasGenerated,
    clearAISuggestions,
    loadTodos
  };
}; 