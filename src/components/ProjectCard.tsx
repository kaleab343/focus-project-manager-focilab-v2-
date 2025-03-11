import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Flag, CheckCircle2, Plus, X } from "lucide-react";
import { useTheme } from '../context/ThemeContext';
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
import { type Milestone, type Project } from '../hooks/useProjects';

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
  onMilestoneToggle: (projectId: string, milestoneId: string, completed: boolean) => void;
  onMilestoneDelete: (projectId: string, milestoneId: string) => void;
  onStatusChange: (projectId: string, status: Project['status']) => void;
  onUpdateProject?: (projectId: string, updates: Partial<Project>) => void;
}

const getStatusColor = (status: Project['status']): "default" | "secondary" | "destructive" => {
  switch (status) {
    case 'Not Started':
      return 'default';
    case 'In Progress':
      return 'secondary';
    case 'Completed':
      return 'secondary';
    default:
      return 'default';
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

const ProjectCard: React.FC<ProjectCardProps> = ({ 
  project, 
  onEdit, 
  onDelete, 
  onMilestoneToggle,
  onMilestoneDelete,
  onStatusChange,
  onUpdateProject
}) => {
  const { theme } = useTheme();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);

  const handleTitleSubmit = (value: string) => {
    const trimmedTitle = value.trim();
    if (onUpdateProject && trimmedTitle !== '') {
      onUpdateProject(project.id, { name: trimmedTitle });
    }
    setIsEditingTitle(false);
  };

  const handleDescriptionSubmit = (value: string) => {
    const trimmedDescription = value.trim();
    if (onUpdateProject) {
      onUpdateProject(project.id, { description: trimmedDescription });
    }
    setIsEditingDescription(false);
  };
  
  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent card click when clicking on interactive elements
    if ((e.target as HTMLElement).closest('button, input, textarea, select, .dropdown-trigger')) {
      e.stopPropagation();
    }
  };
  
  return (
    <Card 
      className={`relative h-full ${
        theme === 'dark' 
          ? 'bg-transparent border-white/10 hover:border-white/20 hover:shadow-white/5' 
          : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-gray-100'
        } transition-all duration-200 hover:shadow-lg`}
      onClick={handleCardClick}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          {isEditingTitle ? (
            <input
              type="text"
              defaultValue={project.name}
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
              {project.name}
            </h3>
          )}
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
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                onStatusChange(project.id, 'Not Started');
              }}>
                Not Started
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                onStatusChange(project.id, 'In Progress');
              }}>
                In Progress
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                onStatusChange(project.id, 'Completed');
              }}>
                Completed
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {isEditingDescription ? (
          <textarea
            defaultValue={project.description}
            onBlur={(e) => handleDescriptionSubmit(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (e.shiftKey || e.ctrlKey || e.metaKey) {
                  return;
                }
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
            <p className={`text-xs ${
              theme === 'dark' ? 'text-white/70' : 'text-gray-500'
            }`}>
              Started: {formatDate(project.startDate)}
            </p>
          )}
          
          <div className="flex items-center gap-2">
            <div className="flex-1 flex flex-wrap gap-2 min-w-0">
              {project.milestones.map((milestone) => (
                <TooltipProvider key={milestone.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="inline-flex items-center group/milestone">
                        <Badge 
                          variant={milestone.completed ? "secondary" : "destructive"}
                          className="flex items-center gap-1 cursor-pointer transition-all hover:opacity-80"
                          onClick={(e) => {
                            e.stopPropagation();
                            onMilestoneToggle(project.id, milestone.id, !milestone.completed);
                          }}
                        >
                          <Flag className="h-3 w-3" />
                          <span className="truncate max-w-[80px]">
                            {milestone.name}
                          </span>
                          {milestone.completed && (
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
                    <TooltipContent className="flex flex-col gap-1" onClick={(e) => e.stopPropagation()}>
                      <p className="font-semibold">{milestone.name}</p>
                      <p className="text-xs opacity-90">Target: {formatDate(milestone.targetDate)}</p>
                      <p className="text-xs opacity-90">
                        Status: {milestone.completed ? 'Completed' : 'In Progress'}
                      </p>
                      <p className="text-xs mt-1 text-muted-foreground">Click to toggle completion</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
            <div className="flex gap-1 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(project);
                }}
                className={`h-8 w-8 ${
                  theme === 'dark' 
                    ? 'text-white hover:bg-white/10' 
                    : 'text-gray-700 hover:bg-gray-100'
                } transition-colors`}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(project.id);
                }}
                className={`h-8 w-8 text-destructive ${
                  theme === 'dark' ? 'hover:bg-destructive/10' : 'hover:bg-destructive/20'
                } transition-colors`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectCard; 