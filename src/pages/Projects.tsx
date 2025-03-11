import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ProjectCard from '../components/ProjectCard';
import ProjectDialog from '../components/ProjectDialog';
import ProjectSidebar from '../components/ProjectSidebar';
import { useProjects, type Project } from '../hooks/useProjects';
import { useTheme } from '../context/ThemeContext';
import Settings from '../components/Settings';

const Projects: React.FC = () => {
  const { theme } = useTheme();
  const { projects, addProject, updateProject, deleteProject } = useProjects();
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

  const handleSave = (projectData: Omit<Project, 'id'>) => {
    if (dialogMode === 'add') {
      addProject({
        ...projectData,
        milestones: projectData.milestones || []
      });
    } else if (selectedProject) {
      updateProject(selectedProject.id, projectData);
    }
  };

  const handleMilestoneToggle = (projectId: string, milestoneId: string, completed: boolean) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      const updatedMilestones = project.milestones.map(milestone =>
        milestone.id === milestoneId ? { ...milestone, completed } : milestone
      );
      updateProject(projectId, { milestones: updatedMilestones });
    }
  };

  const handleMilestoneDelete = (projectId: string, milestoneId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      const updatedMilestones = project.milestones.filter(
        milestone => milestone.id !== milestoneId
      );
      updateProject(projectId, { milestones: updatedMilestones });
    }
  };

  const handleStatusChange = (projectId: string, status: Project['status']) => {
    updateProject(projectId, { status });
  };

  const handleUpdateProject = (projectId: string, updates: Partial<Project>) => {
    updateProject(projectId, updates);
  };

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
            }`} />
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
          {projects.map((project) => (
            <div 
              key={project.id} 
              onClick={() => handleProjectClick(project)}
              className="project-card-container cursor-pointer transition-all duration-200 hover:scale-[1.01]"
            >
              <ProjectCard
                project={project}
                onEdit={handleEditClick}
                onDelete={deleteProject}
                onMilestoneToggle={handleMilestoneToggle}
                onMilestoneDelete={handleMilestoneDelete}
                onStatusChange={handleStatusChange}
                onUpdateProject={handleUpdateProject}
              />
            </div>
          ))}
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
        onSave={handleUpdateProject}
        onDelete={deleteProject}
      />
      
      <Settings />
    </div>
  );
};

export default Projects; 