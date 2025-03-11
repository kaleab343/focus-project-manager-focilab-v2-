import { useState, useEffect } from 'react';

export interface Milestone {
  id: string;
  name: string;
  targetDate: string;
  completed: boolean;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'Not Started' | 'In Progress' | 'Completed';
  startDate?: string;
  milestones: Milestone[];
}

const STORAGE_KEY = 'focilab_projects';

const loadProjectsFromStorage = (): Project[] => {
  try {
    const storedProjects = localStorage.getItem(STORAGE_KEY);
    if (storedProjects) {
      return JSON.parse(storedProjects);
    }
  } catch (error) {
    console.error('Error loading projects from storage:', error);
  }
  return [];
};

export const useProjects = () => {
  // Initialize state with projects from localStorage
  const [projects, setProjects] = useState<Project[]>(loadProjectsFromStorage());

  // Save projects to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    } catch (error) {
      console.error('Error saving projects to storage:', error);
    }
  }, [projects]);

  const addProject = (projectData: Omit<Project, 'id'>) => {
    const newProject: Project = {
      ...projectData,
      id: Date.now().toString(), // Simple ID generation
      milestones: projectData.milestones || [] // Ensure milestones is initialized
    };
    setProjects(prev => [...prev, newProject]);
  };

  const updateProject = (id: string, projectData: Partial<Project>) => {
    setProjects(prev =>
      prev.map(project =>
        project.id === id
          ? {
              ...project,
              ...projectData,
              milestones: projectData.milestones || project.milestones // Keep existing milestones if not provided
            }
          : project
      )
    );
  };

  const deleteProject = (id: string) => {
    setProjects(prev => prev.filter(project => project.id !== id));
  };

  return {
    projects,
    addProject,
    updateProject,
    deleteProject
  };
}; 