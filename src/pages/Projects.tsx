import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ProjectCard } from "@/components/features/projects/ProjectCard";
import { ProjectDialog } from "@/components/features/projects/ProjectDialog";
import { ProjectSidebar } from "@/components/features/projects/ProjectSidebar";
import { useProjects, type Project, type Milestone } from '../hooks/useProjects';
import { useProjectContext } from '../context/ProjectContext';
import { useTheme } from '../context/ThemeContext';
import { Settings } from "@/components/shared/Settings";
import { Spinner } from '@/components/ui/spinner';
import { Nav } from "@/components/layout/Nav";

export const Projects: React.FC = () => {
  const { theme } = useTheme();
  const {
    projects,
    isLoading,
    error,
    addProject,
    updateProject,
    deleteProject,
    addMilestone,
    updateMilestone,
    deleteMilestone,
    getProjectMilestones,
    setCurrentWork
  } = useProjects();

  const { hideSelectedTodos, notifyProjectChange } = useProjectContext();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | undefined>();
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleAddClick = () => {
    setSelectedProject(undefined);
    setDialogMode('add');
    setIsDialogOpen(true);
    setIsSidebarOpen(false);
  };

  const handleEditClick = (project: Project) => {
    setSelectedProject(project);
    setIsSidebarOpen(true);
  };

  const handleProjectClick = (project: Project) => {
    // Hide selected todos when clicking on a project
    hideSelectedTodos();
    notifyProjectChange();
    setSelectedProject(project);
    setIsSidebarOpen(true);
  };

  const handleSave = async (projectData: Omit<Project, 'id'>) => {
    if (dialogMode === 'add') {
      await addProject(projectData);
    } else if (selectedProject) {
      await updateProject(selectedProject.id, projectData);
    }
    setIsDialogOpen(false);
  };

  const handleMilestoneToggle = async (_projectId: string, milestoneId: string, completed: boolean) => {
    const status = completed ? 'Completed' : 'In Progress';
    await updateMilestone(milestoneId, { status });
  };

  const handleMilestoneDelete = async (_projectId: string, milestoneId: string) => {
    await deleteMilestone(milestoneId);
  };

  const handleStatusChange = async (projectId: string, status: Project['status']) => {
    await updateProject(projectId, { status });
  };

  const handleUpdateProject = async (projectId: string, updates: Partial<Project>) => {
    await updateProject(projectId, updates);
  };

  const handleCurrentWorkChange = async (projectId: string, isCurrent: boolean) => {
    // Hide selected todos when changing current work project
    if (isCurrent) {
      hideSelectedTodos();
      notifyProjectChange();
    }
    await setCurrentWork(projectId, isCurrent);
  };

  const handleAddMilestone = async (projectId: string, milestoneData: Omit<Milestone, 'id' | 'projectId'>) => {
    const milestone = await addMilestone(projectId, milestoneData);
    if (!milestone) {
      throw new Error('Failed to add milestone');
    }
    return milestone;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <h1 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Error</h1>
        <p className={`${theme === 'dark' ? 'text-white/60' : 'text-gray-500'}`}>
          {error.message}
        </p>
        <Button
          onClick={() => window.location.reload()}
          className="mt-4"
        >
          Reload Page
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 relative min-h-screen" style={{ background: 'var(--background)', color: 'var(--text-primary)' }}>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Projects</h1>
        <div className="flex items-center gap-4">
          <Button
            onClick={handleAddClick}
            className={`group relative overflow-hidden ${theme === 'dark' ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-white hover:bg-gray-50 text-gray-900 border border-gray-200'} transition-colors`}
          >
            <span className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            <Plus className={`h-4 w-4 mr-2 transition-transform group-hover:scale-110 ${theme === 'dark' ? 'text-white' : 'text-gray-900'} ${isDialogOpen ? 'rotate-45' : ''} transition-all duration-300`} />
            <span className="relative">Add Project</span>
          </Button>
        </div>
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 transition-all duration-300 ease-in-out ${
        isSidebarOpen ? 'w-[60%] pr-6' : 'w-full'
      }`}>
        {/* Not Started */}
        <div>
          <h2 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Not Started</h2>
          {projects.filter(p => p.status === 'Not Started').map(project => (
            <div
              key={project.id}
              onClick={() => handleProjectClick(project)}
              className="project-card-container cursor-pointer transition-all duration-200 hover:scale-[1.01] mb-4"
            >
              <ProjectCard
                project={project}
                milestones={getProjectMilestones(project.id)}
                onEdit={handleEditClick}
                onDelete={deleteProject}
                onMilestoneToggle={handleMilestoneToggle}
                onMilestoneDelete={handleMilestoneDelete}
                onStatusChange={handleStatusChange}
                onUpdateProject={handleUpdateProject}
                onCurrentWorkChange={handleCurrentWorkChange}
              />
            </div>
          ))}
        </div>

        {/* In Progress */}
        <div>
          <h2 className={`text-lg font-semibold mb-4 text-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>In Progress</h2>
          {projects.filter(p => p.status === 'In Progress').map(project => (
            <div
              key={project.id}
              onClick={() => handleProjectClick(project)}
              className="project-card-container cursor-pointer transition-all duration-200 hover:scale-[1.01] mb-4"
            >
              <ProjectCard
                project={project}
                milestones={getProjectMilestones(project.id)}
                onEdit={handleEditClick}
                onDelete={deleteProject}
                onMilestoneToggle={handleMilestoneToggle}
                onMilestoneDelete={handleMilestoneDelete}
                onStatusChange={handleStatusChange}
                onUpdateProject={handleUpdateProject}
                onCurrentWorkChange={handleCurrentWorkChange}
              />
            </div>
          ))}
        </div>

        {/* Completed */}
        <div>
          <h2 className={`text-lg font-semibold mb-4 text-right ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Completed</h2>
          {projects.filter(p => p.status === 'Completed').map(project => (
            <div
              key={project.id}
              onClick={() => handleProjectClick(project)}
              className="project-card-container cursor-pointer transition-all duration-200 hover:scale-[1.01] mb-4"
            >
              <ProjectCard
                project={project}
                milestones={getProjectMilestones(project.id)}
                onEdit={handleEditClick}
                onDelete={deleteProject}
                onMilestoneToggle={handleMilestoneToggle}
                onMilestoneDelete={handleMilestoneDelete}
                onStatusChange={handleStatusChange}
                onUpdateProject={handleUpdateProject}
                onCurrentWorkChange={handleCurrentWorkChange}
              />
            </div>
          ))}
        </div>
      </div>

      <ProjectDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSave}
        project={selectedProject}
        mode={dialogMode}
      />

      <ProjectSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        project={selectedProject}
        milestones={selectedProject ? getProjectMilestones(selectedProject.id) : []}
        onSave={handleUpdateProject}
        onDelete={deleteProject}
        onAddMilestone={handleAddMilestone}
        onUpdateMilestone={updateMilestone}
        onDeleteMilestone={deleteMilestone}
      />

      <Settings />
      <Nav />
    </div>
  );
};
