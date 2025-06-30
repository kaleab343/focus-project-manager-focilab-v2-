import React, { useState } from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Flag, CheckCircle2, X } from "lucide-react";
import { useTheme } from '@/context/ThemeContext';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { type Milestone, type Project } from '@/hooks/useProjects';

interface ProjectCardProps {
  project: Project;
  milestones: Milestone[];
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;  // Pass IndexedDB id here
  onMilestoneToggle: (projectId: string, milestoneId: string, completed: boolean) => void;
  onMilestoneDelete: (projectId: string, milestoneId: string) => void;
  onStatusChange: (projectId: string, status: Project['status']) => void;
  onUpdateProject?: (projectId: string, updates: Partial<Project>) => void;
  onCurrentWorkChange?: (projectId: string, isCurrent: boolean) => void;
}

const getStatusColor = (status: Project['status']): "default" | "secondary" | "destructive" => {
  switch (status) {
    case 'Not Started': return 'default';
    case 'In Progress': return 'secondary';
    case 'Completed': return 'secondary';
    default: return 'default';
  }
};

const getMilestoneStatusColor = (status: Milestone['status']): "default" | "secondary" | "destructive" => {
  switch (status) {
    case 'Not Started': return 'default';
    case 'In Progress': return 'destructive';
    case 'Completed': return 'secondary';
    default: return 'default';
  }
};

const formatDate = (dateString?: string) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  milestones,
  onEdit,
  onDelete,
  onMilestoneToggle,
  onMilestoneDelete,
  onStatusChange,
  onUpdateProject,
  onCurrentWorkChange
}) => {
  const { theme } = useTheme();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);

  const handleTitleSubmit = (value: string) => {
    const trimmed = value.trim();
    if (onUpdateProject && trimmed !== '') {
      onUpdateProject(project.id, { title: trimmed });
    }
    setIsEditingTitle(false);
  };

  const handleDescriptionSubmit = (value: string) => {
    const trimmed = value.trim();
    if (onUpdateProject) {
      onUpdateProject(project.id, { description: trimmed });
    }
    setIsEditingDescription(false);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button, input, textarea, select, .dropdown-trigger')) {
      e.stopPropagation();
    }
  };

  const handleStatusChange = (newStatus: Project['status']) => {
    if (onUpdateProject) {
      const updates: Partial<Project> = { status: newStatus };

      if (newStatus === 'Completed' && !project.completedDate) {
        updates.completedDate = new Date().toISOString().split('T')[0];
      } else if (
        project.status === 'Completed' &&
        (newStatus === 'Not Started' || newStatus === 'In Progress')
      ) {
        updates.completedDate = undefined;
      }

      onUpdateProject(project.id, updates);
    }
  };

  return (
    <Card
      className={`relative flex flex-col h-full ${
        theme === 'dark'
          ? `bg-transparent border-white/10 hover:border-white/20 hover:shadow-white/5 ${
              project.isCurrentWork ? 'border-blue-500/50 shadow-blue-500/20' : ''
            }`
          : `bg-white border-gray-200 hover:border-gray-300 hover:shadow-gray-100 ${
              project.isCurrentWork ? 'border-blue-500 shadow-blue-500/20' : ''
            }`
      } transition-all duration-200 hover:shadow-lg ${
        project.isCurrentWork ? 'ring-2 ring-blue-500/20' : ''
      }`}
      onClick={handleCardClick}
    >
      <CardContent className="p-4 flex-1 min-h-0 overflow-auto">
        <div className="flex justify-between items-start mb-2">
          {isEditingTitle ? (
            <input
              type="text"
              defaultValue={project.title}
              onBlur={(e) => handleTitleSubmit(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleTitleSubmit((e.target as HTMLInputElement).value);
                }
              }}
              className={`text-lg font-semibold bg-transparent outline-none w-full ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <h3
              onDoubleClick={(e) => {
                e.stopPropagation();
                setIsEditingTitle(true);
              }}
              className={`text-lg font-semibold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}
            >
              {project.title}
            </h3>
          )}
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Badge
                  variant={getStatusColor(project.status)}
                  className="cursor-pointer hover:opacity-80 dropdown-trigger"
                  onClick={(e) => e.stopPropagation()}
                >
                  {project.status}
                </Badge>
              </DropdownMenuTrigger>
              <DropdownMenuContent onClick={(e) => e.stopPropagation()}>
                {['Not Started', 'In Progress'].map((status) => (
                  <DropdownMenuItem key={status} onClick={() => handleStatusChange(status as Project['status'])}>
                    {status}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuItem onClick={() => handleStatusChange('Completed')}>
                  Completed
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {project.isCurrentWork && (
              <Badge
                variant="secondary"
                className="bg-blue-500 text-white hover:bg-blue-600"
              >
                Current Work
              </Badge>
            )}
          </div>
        </div>

        {isEditingDescription ? (
          <textarea
            defaultValue={project.description}
            onBlur={(e) => handleDescriptionSubmit(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleDescriptionSubmit((e.target as HTMLTextAreaElement).value);
              }
            }}
            className={`text-sm mb-4 w-full bg-transparent outline-none resize-none font-mono ${
              theme === 'dark' ? 'text-white/70' : 'text-gray-600'
            }`}
            rows={3}
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <p
            onDoubleClick={(e) => {
              e.stopPropagation();
              setIsEditingDescription(true);
            }}
            className={`text-sm mb-4 whitespace-pre-line font-mono ${
              theme === 'dark' ? 'text-white/70' : 'text-gray-600'
            }`}
          >
            {project.description}
          </p>
        )}

        <div className="flex flex-col gap-2">
          {project.startDate && (
            <p className={`text-xs ${theme === 'dark' ? 'text-white/70' : 'text-gray-500'}`}>
              Started: {formatDate(project.startDate)}
            </p>
          )}
          {project.status === 'Completed' && project.completedDate && (
            <p className={`text-xs ${theme === 'dark' ? 'text-green-400' : 'text-green-700'}`}>
              Completed: {formatDate(project.completedDate)}
            </p>
          )}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`current-work-${project.id}`}
              checked={project.isCurrentWork || false}
              onChange={(e) => {
                if (onCurrentWorkChange) {
                  onCurrentWorkChange(project.id, e.target.checked);
                }
              }}
              onClick={(e) => e.stopPropagation()}
              className={`w-4 h-4 rounded border-2 ${
                theme === 'dark' 
                  ? 'bg-zinc-800 border-zinc-600 checked:bg-blue-500 checked:border-blue-500' 
                  : 'bg-white border-gray-300 checked:bg-blue-500 checked:border-blue-500'
              } focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
            />
            <label
              htmlFor={`current-work-${project.id}`}
              className={`text-xs font-medium cursor-pointer ${
                theme === 'dark' ? 'text-white/70' : 'text-gray-500'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              Current Work
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            {milestones.map((milestone) => (
              <TooltipProvider key={milestone.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="inline-flex items-center group/milestone">
                      <Badge
                        variant={getMilestoneStatusColor(milestone.status)}
                        className="flex items-center gap-1 cursor-pointer transition-all hover:opacity-80"
                        onClick={(e) => {
                          e.stopPropagation();
                          onMilestoneToggle(
                            project.id,
                            milestone.id,
                            milestone.status !== 'Completed'
                          );
                        }}
                      >
                        <Flag className="h-3 w-3" />
                        <span className="truncate max-w-[80px]">{milestone.name}</span>
                        {milestone.status === 'Completed' && (
                          <CheckCircle2 className="h-3 w-3 ml-1" />
                        )}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-5 w-0 p-0 overflow-hidden group-hover/milestone:w-5 group-hover/milestone:p-0.5 group-hover/milestone:ml-1 transition-all duration-200 ${
                          theme === 'dark' ? 'hover:bg-destructive/10' : 'hover:bg-destructive/20'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onMilestoneDelete(project.id, milestone.id);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-semibold">{milestone.name}</p>
                    <p className="text-xs opacity-90">Due: {formatDate(milestone.dueDate)}</p>
                    <p className="text-xs opacity-90">Status: {milestone.status}</p>
                    <p className="text-xs mt-1 text-muted-foreground">Click to toggle completion</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </div>
      </CardContent>

      <CardFooter className={`p-4 pt-0 flex justify-end ${theme === 'dark' ? 'text-white/70' : 'text-gray-600'}`}>
        <div className="flex gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(project);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit Project</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm('Are you sure you want to delete this project?')) {
                      onDelete(project.id);  // Pass IndexedDB id, not supa_id
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete Project</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardFooter>
    </Card>
  );
};
