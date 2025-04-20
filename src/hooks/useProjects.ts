import { useState, useEffect, useCallback } from 'react';

export interface Milestone {
  id: string;
  name: string;
  status: 'Not Started' | 'In Progress' | 'Completed';
  dueDate: string;
  projectId: string; // Reference to parent project
}

export interface Project {
  id: string;
  title: string;
  description: string;
  status: 'Not Started' | 'In Progress' | 'Completed';
  startDate: string;
}

// Database configuration
const DB_NAME = 'focilab_db';
const DB_VERSION = 1;
const PROJECTS_STORE = 'projects';
const MILESTONES_STORE = 'milestones';

// Initialize the database
const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('IndexedDB error:', request.error);
      reject(request.error);
    };

    request.onsuccess = (event) => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = request.result;
      
      // Create projects store
      if (!db.objectStoreNames.contains(PROJECTS_STORE)) {
        const projectsStore = db.createObjectStore(PROJECTS_STORE, { keyPath: 'id' });
        projectsStore.createIndex('status', 'status', { unique: false });
        projectsStore.createIndex('startDate', 'startDate', { unique: false });
      }
      
      // Create milestones store
      if (!db.objectStoreNames.contains(MILESTONES_STORE)) {
        const milestonesStore = db.createObjectStore(MILESTONES_STORE, { keyPath: 'id' });
        milestonesStore.createIndex('projectId', 'projectId', { unique: false });
        milestonesStore.createIndex('status', 'status', { unique: false });
        milestonesStore.createIndex('dueDate', 'dueDate', { unique: false });
      }
    };
  });
};

// Generic function to perform database operations
const dbOperation = async <T>(
  storeName: string,
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, mode);
    const store = transaction.objectStore(storeName);
    const request = operation(store);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load all projects and milestones
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Load projects
      const loadedProjects = await dbOperation<Project[]>(
        PROJECTS_STORE,
        'readonly',
        (store) => store.getAll()
      );
      
      // Load milestones
      const loadedMilestones = await dbOperation<Milestone[]>(
        MILESTONES_STORE,
        'readonly',
        (store) => store.getAll()
      );
      
      setProjects(loadedProjects);
      setMilestones(loadedMilestones);
      setError(null);
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Add a new project
  const addProject = async (projectData: Omit<Project, 'id'>) => {
    try {
      const newProject: Project = {
        ...projectData,
        id: Date.now().toString(),
      };
      
      await dbOperation(
        PROJECTS_STORE,
        'readwrite',
        (store) => store.add(newProject)
      );
      
      setProjects(prev => [...prev, newProject]);
    } catch (err) {
      console.error('Error adding project:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  };

  // Update an existing project
  const updateProject = async (id: string, projectData: Partial<Project>) => {
    try {
      const project = projects.find(p => p.id === id);
      if (!project) return;
      
      const updatedProject = { ...project, ...projectData };
      
      await dbOperation(
        PROJECTS_STORE,
        'readwrite',
        (store) => store.put(updatedProject)
      );
      
      setProjects(prev => 
        prev.map(p => p.id === id ? updatedProject : p)
      );
    } catch (err) {
      console.error('Error updating project:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  };

  // Delete a project and its milestones
  const deleteProject = async (id: string) => {
    try {
      // Delete the project
      await dbOperation(
        PROJECTS_STORE,
        'readwrite',
        (store) => store.delete(id)
      );
      
      // Delete associated milestones
      const projectMilestones = milestones.filter(m => m.projectId === id);
      
      for (const milestone of projectMilestones) {
        await dbOperation(
          MILESTONES_STORE,
          'readwrite',
          (store) => store.delete(milestone.id)
        );
      }
      
      setProjects(prev => prev.filter(p => p.id !== id));
      setMilestones(prev => prev.filter(m => m.projectId !== id));
    } catch (err) {
      console.error('Error deleting project:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  };

  // Add a milestone to a project
  const addMilestone = async (projectId: string, milestoneData: Omit<Milestone, 'id' | 'projectId'>) => {
    try {
      // Generate a more unique ID by combining timestamp with a random string
      const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      
      const newMilestone: Milestone = {
        ...milestoneData,
        id: uniqueId,
        projectId
      };
      
      await dbOperation(
        MILESTONES_STORE,
        'readwrite',
        (store) => store.add(newMilestone)
      );
      
      setMilestones(prev => [...prev, newMilestone]);
      
      // Return the created milestone
      return newMilestone;
    } catch (err) {
      console.error('Error adding milestone:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      return null;
    }
  };

  // Update a milestone
  const updateMilestone = async (id: string, milestoneData: Partial<Milestone>) => {
    try {
      const milestone = milestones.find(m => m.id === id);
      if (!milestone) return;
      
      const updatedMilestone = { ...milestone, ...milestoneData };
      
      await dbOperation(
        MILESTONES_STORE,
        'readwrite',
        (store) => store.put(updatedMilestone)
      );
      
      setMilestones(prev => 
        prev.map(m => m.id === id ? updatedMilestone : m)
      );
    } catch (err) {
      console.error('Error updating milestone:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  };

  // Delete a milestone
  const deleteMilestone = async (id: string) => {
    try {
      await dbOperation(
        MILESTONES_STORE,
        'readwrite',
        (store) => store.delete(id)
      );
      
      setMilestones(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      console.error('Error deleting milestone:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  };

  // Get milestones for a specific project
  const getProjectMilestones = (projectId: string) => {
    return milestones.filter(milestone => milestone.projectId === projectId);
  };

  return {
    projects,
    milestones,
    isLoading,
    error,
    addProject,
    updateProject,
    deleteProject,
    addMilestone,
    updateMilestone,
    deleteMilestone,
    getProjectMilestones
  };
}; 