import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ProjectCard from '../components/ProjectCard';
import ProjectDialog from '../components/ProjectDialog';
import ProjectSidebar from '../components/ProjectSidebar';
import { useProjects, type Project, type Milestone } from '../hooks/useProjects';
import { useTheme } from '../context/ThemeContext';
import Settings from '../components/Settings';
import { Spinner } from '@/components/ui/spinner';
import Nav from '../components/Nav';

const Projects: React.FC = () => {
  const { theme } = useTheme();
  const { 
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
  } = useProjects();
  
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

  const handleMilestoneToggle = async (projectId: string, milestoneId: string, completed: boolean) => {
    const status = completed ? 'Completed' : 'In Progress';
    await updateMilestone(milestoneId, { status });
  };

  const handleMilestoneDelete = async (projectId: string, milestoneId: string) => {
    await deleteMilestone(milestoneId);
  };

  const handleStatusChange = async (projectId: string, status: Project['status']) => {
    await updateProject(projectId, { status });
  };

  const handleUpdateProject = async (projectId: string, updates: Partial<Project>) => {
    await updateProject(projectId, updates);
  };

  const handleAddMilestone = async (projectId: string, milestoneData: Omit<Milestone, 'id' | 'projectId'>) => {
    return await addMilestone(projectId, milestoneData);
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
    <div className="container mx-auto py-8 px-4 relative min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Projects</h1>
        <div className="flex items-center gap-4">
          <Button
            onClick={handleAddClick}
            className={`group relative overflow-hidden ${
              theme === 'dark' 
                ? 'bg-white/10 hover:bg-white/20 text-white' 
                : 'bg-white hover:bg-gray-50 text-gray-900 border border-gray-200'
            } transition-colors`}
          >
            <span className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            <Plus className={`h-4 w-4 mr-2 transition-transform group-hover:scale-110 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            } ${isDialogOpen ? 'rotate-45' : ''} transition-all duration-300`} />
            <span className="relative">Add Project</span>
          </Button>
        </div>
      </div>

      <div className={`transition-all duration-300 ease-in-out ${
        isSidebarOpen 
          ? 'w-[60%] pr-6' 
          : 'w-full'
      }`}>
        <div className={`grid gap-6 ${
          isSidebarOpen 
            ? 'grid-cols-2' 
            : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
        }`}>
          {projects.map((project) => {
            const projectMilestones = getProjectMilestones(project.id);
            return (
              <div 
                key={project.id} 
                onClick={() => handleProjectClick(project)}
                className="project-card-container cursor-pointer transition-all duration-200 hover:scale-[1.01]"
              >
                <ProjectCard
                  project={project}
                  milestones={projectMilestones}
                  onEdit={handleEditClick}
                  onDelete={deleteProject}
                  onMilestoneToggle={handleMilestoneToggle}
                  onMilestoneDelete={handleMilestoneDelete}
                  onStatusChange={handleStatusChange}
                  onUpdateProject={handleUpdateProject}
                  onAddMilestone={handleAddMilestone}
                />
              </div>
            );
          })}
          {projects.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className={`${theme === 'dark' ? 'text-white/60' : 'text-gray-500'}`}>
                No projects yet. Click "Add Project" to get started!
              </p>
            </div>
          )}
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

export default Projects; 